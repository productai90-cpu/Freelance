/* ============================================================
   MANAGER PANEL LOGIN — change these before handing over a demo.

   This file is imported only by the admin chunk, which is lazy-loaded
   on #/admin. A visitor who only ever reads the public site never
   downloads it. That is housekeeping, not security.

   ⚠️  The check still happens in the BROWSER, so these strings are
   readable by anyone who opens the admin page and looks at devtools.
   That is what "static site, no server" means — there is nowhere
   private to verify a password.

   Fine for: keeping a casual visitor out, and showing an owner what
   their private area will feel like.

   Not fine for: a real hall's real bookings and customer phone
   numbers. That needs the password checked somewhere the visitor
   cannot see. See DEPLOY.md.
   ============================================================ */

export const adminUser = {
  username: 'admin',
  password: 'marmar1404',
}
