import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/* ============================================================
   Shared demo state.

   Persisted per-visitor in localStorage: on a publicly-shared link
   one visitor's activity must never be visible to another, and the
   owner needs the state to survive a refresh mid-meeting.

   Demo seed data is loaded by DYNAMIC IMPORT, triggered only when the
   manager backend mounts. That keeps every booking, amount and status
   label out of the public bundle entirely — the public site is
   branding and lead capture, and its JavaScript reflects that.
   ============================================================ */

const KEY = 'marmar-demo-v2'
const DataContext = createContext(null)

const load = () => {
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

  useEffect(() => {
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

  /** Called by the public inquiry form. Always runs, network or not. */
  const addLead = useCallback((lead) => {
    const entry = {
      id: `l${Date.now()}`,
      status: 'new',
      at: Date.now(),
      ...lead,
    }
    setState((s) => ({ ...s, leads: [entry, ...s.leads] }))
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
    return created
  }, [])

  const updateBooking = useCallback((id, patch) => {
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }))
  }, [])

  const markLead = useCallback((id, status) => {
    setState((s) => ({
      ...s,
      leads: s.leads.map((l) => (l.id === id ? { ...l, status } : l)),
    }))
  }, [])

  /** Called by the admin shell on mount. Loads demo data on first use. */
  const ensureSeeded = useCallback(async () => {
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
  }, [state.seeded])

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
