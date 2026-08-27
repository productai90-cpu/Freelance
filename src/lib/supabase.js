import { createClient } from '@supabase/supabase-js'

/* ============================================================
   SUPABASE CLIENT

   Optional on purpose. With no environment variables the export is
   `null` and the whole app falls back to the localStorage demo — so
   a fresh clone still runs, and a broken key can never take the
   public site down with it.

   ABOUT THE ANON KEY BEING PUBLIC

   It is meant to be. It identifies the project; it does not grant
   access. What it can actually do is decided by the Row Level
   Security policies in supabase/schema.sql, which allow an anonymous
   caller to insert one lead and nothing else — no reading leads, no
   touching bookings.

   So: never put the SERVICE ROLE key in this file or in any env var
   starting with VITE_. That key bypasses RLS entirely and everything
   with a VITE_ prefix is compiled into the published bundle.
   ============================================================ */

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/* A half-filled .env.local is the likeliest state this file is ever
   in: the template is copied, then the keys are pasted a minute
   later. Both placeholders are non-empty strings, so a plain
   truthiness check would call that "configured" and send every login
   to YOUR-PROJECT.supabase.co. Treat the placeholders as absent, the
   same way isFormLive does in config.js. */
const filled = (v) => typeof v === 'string' && v.length > 0 && !v.includes('YOUR-')

export const isLive = filled(url) && filled(anonKey)

export const supabase = isLive
  ? createClient(url, anonKey, {
      auth: {
        // The manager's session should survive a refresh mid-call.
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

/* A guard rail with teeth: shout if the SECRET key ever lands in the
   public slot. Supabase issues two shapes and both have a dangerous
   twin, so both are checked.

     new    sb_publishable_...  safe   |  sb_secret_...   DANGER
     legacy JWT role "anon"     safe   |  "service_role"  DANGER

   The secret key bypasses Row Level Security completely, and anything
   read here is already compiled into the published bundle. */
function looksLikeSecret(key) {
  if (typeof key !== 'string') return false
  if (key.startsWith('sb_secret_')) return true
  try {
    return JSON.parse(atob(key.split('.')[1] ?? '')).role === 'service_role'
  } catch {
    return false // not a JWT — nothing more to check
  }
}

if (isLive && looksLikeSecret(anonKey)) {
  // eslint-disable-next-line no-console
  console.error(
    '[supabase] VITE_SUPABASE_ANON_KEY holds a SECRET key. It bypasses ' +
      'Row Level Security and is now in the public bundle. Rotate it in ' +
      'the Supabase dashboard now, and use the publishable/anon key.',
  )
}
