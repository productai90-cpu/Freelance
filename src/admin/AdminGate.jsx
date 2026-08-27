import { useState } from 'react'
import { motion } from 'motion/react'
import { hall } from '../config.js'
import { adminUser } from './credentials.js'
import { isLive, supabase } from '../lib/supabase.js'

/* ============================================================
   LOGIN GATE — two modes.

   LIVE (Supabase configured): a real sign-in. The password goes to
   Supabase Auth, is verified against a salted hash on their servers,
   and what comes back is a signed JWT. Row Level Security then keys
   off that token, so the panel cannot read a single booking without
   one. This is real security.

   DEMO (no Supabase): the note below applies.

   ------------------------------------------------------------
   READ THIS BEFORE TRUSTING THE DEMO MODE WITH ANYTHING REAL.

   This site is static. There is no server, so there is nothing that
   can check a password in private — the check happens in the browser,
   which means the credentials ship inside the JavaScript bundle and
   anyone who opens devtools can read them.

   So this is a DOOR, not a LOCK. It is worth having:
     · a casual visitor who finds /#/admin sees a login, not the data
     · during a demo you show the owner "this is your private panel"
     · the screen and the session flow are already built, so swapping
       in real authentication later touches only this file

   It is NOT worth trusting with a real hall's real bookings. For
   that you need a backend that verifies the password server-side —
   see the note in ./credentials.js.

   In demo mode the session lives in sessionStorage, so closing the
   tab signs you out — on a shared phone that is what you want. In
   live mode Supabase owns the session and refreshes its own token.
   ============================================================ */

const SESSION_KEY = 'marmar-admin-session'

/* Live sessions are resolved asynchronously by Supabase, so this
   only answers for demo mode; AdminShell asks Supabase separately. */
export const hasSession = () => {
  if (isLive) return false
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'ok'
  } catch {
    // Private mode or blocked storage — fail CLOSED here. Everywhere
    // else in this codebase storage failure falls back to showing
    // content; a login is the one place where it must not.
    return false
  }
}

export const signOut = async () => {
  if (isLive) {
    await supabase.auth.signOut()
    return
  }
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* nothing to clear */
  }
}

export default function AdminGate({ onUnlock }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')

    if (isLive) {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.trim(),
        password: pass,
      })

      if (authError) {
        /* Deliberately one message for every failure. Saying "no such
           user" tells an attacker which addresses exist. */
        setError('ایمیل یا رمز عبور درست نیست.')
        setPass('')
        setBusy(false)
        return
      }

      onUnlock()
      return
    }

    /* A short delay on purpose. Not security — an instant reject makes
       a typo feel like the field is broken, and a beat of "checking"
       is what every login the owner has ever used does. */
    setTimeout(() => {
      const ok = user.trim() === adminUser.username && pass === adminUser.password

      if (ok) {
        try {
          sessionStorage.setItem(SESSION_KEY, 'ok')
        } catch {
          /* session will not persist a refresh, but the panel opens */
        }
        onUnlock()
      } else {
        setError('نام کاربری یا رمز عبور درست نیست.')
        setPass('')
        setBusy(false)
      }
    }, 420)
  }

  const field =
    'w-full rounded-md border border-line bg-surface px-4 py-3 text-ink outline-none transition-colors duration-300 placeholder:text-muted/45 focus:border-accent'

  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-base px-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
        className="w-full max-w-[380px]"
      >
        <div className="border border-line bg-surface px-6 py-9 shadow-lift sm:px-8">
          <div className="text-center">
            <p className="font-display text-2xl font-light text-ink">{hall.name}</p>
            <p className="mt-1 text-[11px] text-muted">پنل مدیریت</p>
            <div
              className="mx-auto mt-5 h-px w-14"
              style={{
                background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)',
              }}
            />
          </div>

          <form onSubmit={submit} className="mt-8 space-y-3">
            <input
              type={isLive ? 'email' : 'text'}
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder={isLive ? 'ایمیل' : 'نام کاربری'}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              className={field}
              required
            />

            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="رمز عبور"
              autoComplete="current-password"
              className={field}
              required
            />

            {error && (
              <p
                role="alert"
                className="border-s-2 border-danger bg-danger-lt px-4 py-2.5 text-sm leading-relaxed text-ink"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-ink py-3.5 text-sm text-surface transition-colors duration-300 hover:bg-accent-deep disabled:opacity-60"
            >
              {busy ? 'در حال بررسی…' : 'ورود'}
            </button>
          </form>

          <a
            href="#/"
            className="mt-6 block text-center text-xs text-muted/70 transition-colors duration-300 hover:text-accent"
          >
            بازگشت به سایت
          </a>
        </div>

        {!isLive && (
          <p className="mt-4 text-center text-[11px] leading-relaxed text-muted/70">
            نسخهٔ نمایشی — ورود در مرورگر بررسی می‌شود، نه روی سرور.
          </p>
        )}
      </motion.div>
    </div>
  )
}
