import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { navigate, segments } from '../lib/router.js'
import { useData } from '../store/DataContext.jsx'
import { hall } from '../config.js'
import CalendarScreen from './CalendarScreen.jsx'
import LeadsInbox from './LeadsInbox.jsx'
import BookingDetail from './BookingDetail.jsx'
import BookingsList from './BookingsList.jsx'
import AdminGate, { hasSession, signOut } from './AdminGate.jsx'
import { isLive, supabase } from '../lib/supabase.js'

/* ============================================================
   MANAGER BACKEND — mobile-first.

   Designed at 390px. On desktop it centres in a phone-width column
   inside a soft frame, so during a laptop demo it still reads as
   "this is your phone".

   Motion here is the deliberate opposite of the public site: every
   transition is capped at 280ms. The manager is mid-phone-call, so
   elegance means speed.
   ============================================================ */

const TABS = [
  { key: 'calendar', label: 'تقویم', path: '/admin', icon: CalendarIcon },
  { key: 'leads', label: 'سرنخ‌ها', path: '/admin/leads', icon: InboxIcon },
  { key: 'bookings', label: 'رزروها', path: '/admin/bookings', icon: ListIcon },
]

function CalendarIcon(p) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  )
}
function InboxIcon(p) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}>
      <path d="M3 13h4l2 3h6l2-3h4" />
      <path d="M5 5h14l2 8v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4l2-8Z" />
    </svg>
  )
}
function ListIcon(p) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}>
      <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" strokeLinecap="round" />
    </svg>
  )
}

export default function AdminShell({ route }) {
  const parts = segments(route) // ['admin', ...]
  const sub = parts[1]
  const { newLeadCount, toast, ensureSeeded } = useData()
  const [unlocked, setUnlocked] = useState(hasSession)

  /* Live mode: Supabase restores a session asynchronously, so a
     refresh must ask it rather than assume signed-out. */
  useEffect(() => {
    if (!isLive) return
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUnlocked(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUnlocked(Boolean(session))
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // Demo data lives in a dynamically-imported module so it never
  // reaches the public bundle. Seed only AFTER unlocking, so a
  // visitor who never signs in never pulls the bookings down.
  useEffect(() => {
    if (unlocked) ensureSeeded()
  }, [ensureSeeded, unlocked])

  if (!unlocked) return <AdminGate onUnlock={() => setUnlocked(true)} />

  const screen =
    sub === 'leads'
      ? 'leads'
      : sub === 'bookings'
        ? 'bookings'
        : sub === 'booking'
          ? 'detail'
          : 'calendar'

  const activeTab = screen === 'detail' ? 'bookings' : screen

  return (
    <div className="min-h-[100svh] bg-base lg:flex lg:items-center lg:justify-center lg:py-10">
      {/* Phone-width column. On desktop it gains a frame so the demo
          reads unmistakably as a phone screen. */}
      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[430px] flex-col bg-surface lg:min-h-0 lg:h-[860px] lg:rounded-[2.25rem] lg:border-8 lg:border-ink lg:shadow-2xl lg:overflow-hidden">
        {/* — Header — */}
        <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
          <div className="flex items-center justify-between px-5 pb-3 pt-5">
            <div>
              <p className="font-display text-lg font-light text-ink">{hall.name}</p>
              <p className="text-[11px] text-muted">پنل مدیریت</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-accent/40 px-2.5 py-1 text-[10px] text-accent">
                نسخهٔ نمایشی
              </span>
              <a
                href="#/"
                className="rounded-full border border-line px-2.5 py-1 text-[10px] text-muted transition-colors duration-300 hover:text-ink"
              >
                سایت
              </a>
              <button
                onClick={async () => {
                  await signOut()
                  setUnlocked(false)
                }}
                className="rounded-full border border-line px-2.5 py-1 text-[10px] text-muted transition-colors duration-300 hover:text-ink"
              >
                خروج
              </button>
            </div>
          </div>
        </header>

        {/* — Screen — */}
        <div className="flex-1 overflow-y-auto pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen + (parts[2] ?? '')}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
            >
              {screen === 'calendar' && <CalendarScreen />}
              {screen === 'leads' && <LeadsInbox />}
              {screen === 'bookings' && <BookingsList />}
              {screen === 'detail' && <BookingDetail id={parts[2]} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* — Bottom tabs: thumb-reachable, app-like, not a sidebar — */}
        <nav className="absolute inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
          <div className="flex">
            {TABS.map((t) => {
              const on = activeTab === t.key
              const Icon = t.icon
              return (
                <button
                  key={t.key}
                  onClick={() => navigate(t.path)}
                  className="relative flex flex-1 flex-col items-center gap-1 py-3"
                >
                  {on && (
                    <motion.span
                      layoutId="tab-indicator"
                      className="absolute inset-x-6 top-0 h-px bg-accent"
                      transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
                    />
                  )}
                  <span className="relative">
                    <Icon className={`h-5 w-5 ${on ? 'text-accent' : 'text-muted'}`} />
                    {t.key === 'leads' && newLeadCount > 0 && (
                      <span className="absolute -left-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-booked px-1 text-[9px] text-surface">
                        {newLeadCount}
                      </span>
                    )}
                  </span>
                  <span className={`text-[11px] ${on ? 'text-ink' : 'text-muted'}`}>{t.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* — Toast — */}
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="pointer-events-none absolute inset-x-5 bottom-24 z-30 rounded-lg bg-ink px-4 py-3 text-center text-sm text-surface shadow-xl"
            >
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
