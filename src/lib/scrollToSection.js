/* ============================================================
   ANCHOR SCROLLING

   Two things the browser's own `scroll-behavior: smooth` cannot do.

   1. TIMING. Its duration is the browser's business, not ours, and
      it is slow — long enough that it reads as a different site from
      the one whose every transition is 300ms.

   2. A MOVING TARGET. It computes the destination once, at click
      time, and never revises it. This page keeps growing after that:
      font-display is swap, so the display faces arrive mid-scroll and
      reflow every heading in nine sections. Over the longest jump on
      the site — the hero's call to action down to the form — the
      drift added up to a whole section, which is why that button
      used to land on the testimonials.

   Animating it ourselves solves both, and the second falls out for
   free: the destination is re-read EVERY FRAME, so a page that grows
   underneath the scroll is simply followed rather than fought.
   ============================================================ */

/* The site's one easing curve, the same cubic-bezier every CSS
   transition uses. Solved by bisection — cheap enough per frame and
   it keeps the scroll in the same motion language as everything else
   rather than inventing a second feel for one interaction. */
const [X1, Y1, X2, Y2] = [0.22, 0.61, 0.36, 1]

const bezier = (t, a, b) => {
  const u = 1 - t
  return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t
}

function ease(x) {
  let lo = 0
  let hi = 1
  let t = x
  for (let i = 0; i < 12; i++) {
    t = (lo + hi) / 2
    if (bezier(t, X1, X2) < x) lo = t
    else hi = t
  }
  return bezier(t, Y1, Y2)
}

/* Fast, and only a little longer for a longer trip. A fixed duration
   makes a short hop feel sluggish; a purely proportional one makes a
   full-page jump take seconds. */
const duration = (distance) => Math.min(560, 300 + Math.abs(distance) * 0.06)

/* The menu lightbox pins `body { overflow: hidden }` while it is open,
   and its call to action both closes the dialog AND links to #inquiry.
   Closing has an exit animation, so the lock outlives the click by a
   few frames — long enough to swallow the scroll entirely. */
const LOCK_WAIT_MS = 700

/* ---- Landing is not the same as arriving ----

   Re-reading the destination every frame keeps the scroll honest
   WHILE it runs, but the page is not finished moving when the scroll
   is. On a phone the hero's call to action is the full length of the
   site, the animation is capped at 560ms, and whatever changes the
   height above the form — a display face arriving on
   `font-display: swap` and reflowing nine headings, a section
   settling, the address bar collapsing and changing every `vh` —
   can easily land after that. Growth above the viewport pushes
   content down while `scrollY` stays where it was, so the reader
   ends up higher in the page than they were left: on the
   testimonials, one section short of the form.

   So we hold the landing. After the animation ends the destination
   is still re-read every frame and any drift is closed at once — an
   instant correction, because it is the PAGE that moved, not the
   reader, and the right result is the form sitting still while the
   content above it settles.

   ---- Knowing when to let go ----

   Not by asking about fonts. `document.fonts.status` reports
   'loaded' whenever nothing is pending AT THAT MOMENT, which on a
   fresh page is true before any text has been laid out and any font
   requested — so a fonts-ready check is answered "yes" long before
   the fonts are anywhere, and would release the landing on exactly
   the slow first visit it exists for.

   Watch the target instead. It is the thing we actually care about,
   it reports every cause at once — fonts, images, reflow, the
   address bar — and it needs no guess about which of them is in
   play. Hold while it keeps moving; let go once it has been still
   for a moment. The floor stops a single late frame from ending it
   early, the ceiling stops a page that never settles from holding
   the reader forever. */
const SETTLE_MIN_MS = 350   // never let go sooner than this
const SETTLE_QUIET_MS = 400 // ...nor until the target has been still this long
const SETTLE_MAX_MS = 2500  // ...and never hold longer than this

function whenScrollable(run) {
  const started = performance.now()
  const check = () => {
    const locked = getComputedStyle(document.body).overflow === 'hidden'
    if (!locked || performance.now() - started > LOCK_WAIT_MS) run()
    else requestAnimationFrame(check)
  }
  check()
}

let running = 0

export function scrollToId(id) {
  const section = document.getElementById(id)
  if (!section) return false

  /* A section may nominate what the reader should actually land on.
     The inquiry section leads with a heading and an intro, but the
     thing someone pressing "استعلام تاریخ و رزرو" came for is the
     form — so it marks the form and we aim there instead. */
  const el = section.querySelector('[data-scroll-anchor]') ?? section

  const padding =
    parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0

  const targetY = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const want = el.getBoundingClientRect().top + window.scrollY - padding
    return Math.max(0, Math.min(want, max))
  }

  cancelAnimationFrame(running)

  const stop = () => {
    cancelAnimationFrame(running)
    window.removeEventListener('wheel', stop)
    window.removeEventListener('touchstart', stop)
    window.removeEventListener('keydown', stop)
  }

  /* Hold the landing: correct drift until the page stops moving.
     Costs nothing when nothing moves — it is a read and a compare. */
  const settle = () => {
    const started = performance.now()
    let last = targetY()
    let stillSince = started

    const tick = (now) => {
      const to = targetY()

      // A pixel of slack throughout. Sub-pixel layout, and the
      // rounding some browsers apply to scrollY, would otherwise
      // read as perpetual movement and never let this finish.
      if (Math.abs(to - last) > 1) {
        last = to
        stillSince = now // the page moved under us — keep holding
      }
      if (Math.abs(window.scrollY - to) > 1) {
        window.scrollTo({ top: to, behavior: 'auto' })
      }

      const elapsed = now - started
      const settled = now - stillSince >= SETTLE_QUIET_MS && elapsed >= SETTLE_MIN_MS
      if (settled || elapsed >= SETTLE_MAX_MS) stop()
      else running = requestAnimationFrame(tick)
    }

    running = requestAnimationFrame(tick)
  }

  // Passive: these only cancel, they never preventDefault. Being
  // helpful is not worth fighting the reader's thumb. They stay
  // attached through the settle — a reader who scrolls away during it
  // has overruled us, and we let go.
  const watchForReader = () => {
    window.addEventListener('wheel', stop, { passive: true })
    window.addEventListener('touchstart', stop, { passive: true })
    window.addEventListener('keydown', stop)
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    whenScrollable(() => {
      window.scrollTo({ top: targetY(), behavior: 'auto' })
      watchForReader()
      settle()
    })
    return true
  }

  whenScrollable(() => {
    const from = window.scrollY
    const total = duration(targetY() - from)
    const t0 = performance.now()

    const frame = (now) => {
      const p = Math.min((now - t0) / total, 1)
      // Re-read the destination every frame: if the page grew above
      // us while the scroll was running, follow it.
      const to = targetY()
      // behavior:'auto' is required — CSS scroll-behavior is smooth,
      // and without this every frame would start its own animation.
      window.scrollTo({ top: from + (to - from) * ease(p), behavior: 'auto' })
      if (p < 1) running = requestAnimationFrame(frame)
      else settle()
    }

    watchForReader()

    running = requestAnimationFrame(frame)
  })

  return true
}

/* One delegated listener covers every in-page link on the site — the
   hero button, the nav rail, the mobile sheet, the menu's call to
   action, the footer — without each of them having to opt in. */
export function installAnchorScroll() {
  const onClick = (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return

    const link = e.target.closest?.('a[href^="#"]')
    if (!link) return

    const href = link.getAttribute('href') ?? ''
    // '#/admin' is a route; '#top' and '#inquiry' are places on this
    // page. Only the latter are ours to handle.
    if (href.length < 2 || href.startsWith('#/')) return
    if (!document.getElementById(href.slice(1))) return

    e.preventDefault()
    if (scrollToId(href.slice(1))) history.replaceState(null, '', href)
  }

  document.addEventListener('click', onClick)
  return () => document.removeEventListener('click', onClick)
}
