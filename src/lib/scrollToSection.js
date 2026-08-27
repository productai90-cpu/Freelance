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

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    whenScrollable(() => window.scrollTo({ top: targetY(), behavior: 'auto' }))
    return true
  }

  const stop = () => {
    cancelAnimationFrame(running)
    window.removeEventListener('wheel', stop)
    window.removeEventListener('touchstart', stop)
    window.removeEventListener('keydown', stop)
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
      else stop()
    }

    // Passive: these only cancel, they never preventDefault. Being
    // helpful is not worth fighting the reader's thumb.
    window.addEventListener('wheel', stop, { passive: true })
    window.addEventListener('touchstart', stop, { passive: true })
    window.addEventListener('keydown', stop)

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
