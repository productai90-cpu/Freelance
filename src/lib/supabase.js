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

export const isLive = Boolean(url && anonKey)

export const supabase = isLive
  ? createClient(url, anonKey, {
      auth: {
        // The manager's session should survive a refresh mid-call.
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

/* A guard rail with teeth. The service role key is recognisable —
   it carries "service_role" in its payload. If one ever gets pasted
   into the anon slot, say so loudly in the console rather than
   silently publishing a key that bypasses every policy. */
if (isLive && typeof anonKey === 'string') {
  try {
    const payload = JSON.parse(atob(anonKey.split('.')[1] ?? ''))
    if (payload?.role === 'service_role') {
      // eslint-disable-next-line no-console
      console.error(
        '[supabase] VITE_SUPABASE_ANON_KEY holds a SERVICE ROLE key. ' +
          'It bypasses Row Level Security and is now in the public bundle. ' +
          'Rotate it in the Supabase dashboard immediately and use the anon key.',
      )
    }
  } catch {
    /* not a JWT we can read — nothing to warn about */
  }
}
