import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { isLive } from '../lib/supabase.js'
import * as remote from './remote.js'

/* ============================================================
   Shared demo state.

   Persisted per-visitor in localStorage: on a publicly-shared link
   one visitor's activity must never be visible to another, and the
   owner needs the state to survive a refresh mid-meeting.

   Demo seed data is loaded by DYNAMIC IMPORT, triggered only when the
   manager backend mounts. That keeps every booking, amount and status
   label out of the public bundle entirely — the public site is
   branding and lead capture, and its JavaScript reflects that.

   ---- TWO MODES ----

   With Supabase configured (`isLive`), every read and write goes to
   the database and this local state is just a cache of it, so a lead
   left on a visitor's phone genuinely arrives on the owner's.

   Without it, everything below runs exactly as before: localStorage,
   one browser, seed data. That fallback is not a leftover — it means
   a fresh clone runs with no setup, and a bad key can never take the
   public site down.
   ============================================================ */

const KEY = 'marmar-demo-v2'
const DataContext = createContext(null)

const load = () => {
  /* localStorage is the DEMO's store, not a cache of the database.

     Reading it in live mode is what kept the seeded bookings on
     screen: the saved blob carries `seeded: true` from an earlier
     demo session, ensureSeeded saw that and returned before it ever
     reached Supabase. Drop the stale key so the two cannot be
     confused again. */
  if (isLive) {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* nothing to clear */
    }
    return null
  }

  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed?.bookings) || !Array.isArray(parsed?.leads)) return null
    return parsed
  } catch {
    // Private mode, blocked storage, corrupt value — fall back to seed.
    return null
  }
}

export function DataProvider({ children }) {
  const [state, setState] = useState(
    () => load() ?? { bookings: [], leads: [], seeded: false },
  )
  const [toast, setToast] = useState(null)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (isLive) return // the database is the store; nothing to mirror
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* storage unavailable — the demo still works in memory */
    }
  }, [state])

  const notify = useCallback((message) => {
    setToast({ message, id: Date.now() })
    setTimeout(() => setToast(null), 3200)
  }, [])

  /** Called by the public inquiry form. Always runs, network or not.

      The local entry is added FIRST and the insert is not awaited: a
      couple filling in a form should never watch a spinner because a
      database is slow, and if the insert fails the lead is still in
      front of them on screen. The console note is for us, not them. */
  const addLead = useCallback((lead) => {
    const entry = {
      id: `l${Date.now()}`,
      status: 'new',
      at: Date.now(),
      ...lead,
    }
    setState((s) => ({ ...s, leads: [entry, ...s.leads] }))

    if (isLive) {
      remote.insertLead(entry).catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[leads] insert failed', err)
      })
    }
    return entry
  }, [])

  /** The demo's pivotal action: a lead becomes a tentative booking. */
  const convertLead = useCallback((leadId) => {
    let created = null
    setState((s) => {
      const lead = s.leads.find((l) => l.id === leadId)
      if (!lead) return s

      created = {
        id: `b${Date.now()}`,
        date: lead.date,
        client: lead.name,
        phone: lead.phone,
        status: 'tentative',
        guests: 0,
        contract: 0,
        deposit: 0,
        hall: 'سالن اصلی',
        note: lead.message || '',
        fromLead: true,
      }

      return {
        bookings: [...s.bookings, created],
        leads: s.leads.map((l) => (l.id === leadId ? { ...l, status: 'converted' } : l)),
      }
    })

    if (isLive && created) {
      const tempId = created.id
      Promise.all([
        remote.insertBooking(created),
        remote.updateLeadStatus(leadId, 'converted'),
      ])
        .then(([saved]) => {
          /* The optimistic row was given `b<timestamp>`; the database
             generated a uuid. Left unreconciled the two drift apart —
             the detail screen we are about to navigate to would 404
             after any refresh, and every later edit would patch an id
             that does not exist. Swap it for the real one. */
          setState((s) => ({
            ...s,
            bookings: s.bookings.map((b) => (b.id === tempId ? { ...b, id: saved.id } : b)),
          }))
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[convert] failed', err)
          notify('ذخیرهٔ رزرو ناموفق بود.')
        })
    }
    return created
  }, [notify])

  const updateBooking = useCallback((id, patch) => {
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }))
    if (isLive) {
      remote.patchBooking(id, patch).catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[booking] update failed', err)
      })
    }
  }, [])

  const markLead = useCallback((id, status) => {
    setState((s) => ({
      ...s,
      leads: s.leads.map((l) => (l.id === id ? { ...l, status } : l)),
    }))
    if (isLive) {
      remote.updateLeadStatus(id, status).catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[lead] update failed', err)
      })
    }
  }, [])

  /** Called by the admin shell once the panel unlocks.

      Live: pulls the real tables. Demo: loads the seed. Either way it
      runs once, and either way the panel has something to show. */
  const ensureSeeded = useCallback(async () => {
    if (isLive) {
      // Guarded by a ref, not by state.seeded: that flag can arrive
      // already true from a previous demo session.
      if (fetchedRef.current) return
      fetchedRef.current = true
      try {
        const { leads, bookings } = await remote.fetchAll()
        setState({ leads, bookings, seeded: true })
      } catch (err) {
        fetchedRef.current = false // let a retry happen
        // eslint-disable-next-line no-console
        console.error('[load] failed', err)
        notify('اتصال به سرور برقرار نشد.')
      }
      return
    }

    if (state.seeded) return

    const { seedBookings, seedLeads } = await import('../data/mock.js')
    setState((s) =>
      s.seeded
        ? s
        : {
            // Anything the visitor already submitted stays on top.
            bookings: [...seedBookings, ...s.bookings],
            leads: [...s.leads, ...seedLeads],
            seeded: true,
          },
    )
  }, [state.seeded, notify])

  const resetDemo = useCallback(async () => {
    const { seedBookings, seedLeads } = await import('../data/mock.js')
    setState({ bookings: seedBookings, leads: seedLeads, seeded: true })
    notify('دمو به حالت اولیه بازگشت')
  }, [notify])

  /** date key -> booking, for O(1) calendar lookups */
  const byDate = useMemo(() => {
    const map = {}
    for (const b of state.bookings) map[b.date] = b
    return map
  }, [state.bookings])

  const newLeadCount = useMemo(
    () => state.leads.filter((l) => l.status === 'new').length,
    [state.leads],
  )

  const value = {
    ...state,
    byDate,
    newLeadCount,
    addLead,
    convertLead,
    ensureSeeded,
    updateBooking,
    markLead,
    resetDemo,
    toast,
    notify,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useData = () => {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside <DataProvider>')
  return ctx
}
