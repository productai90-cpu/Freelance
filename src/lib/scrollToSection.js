/* ============================================================
   ANCHOR SCROLLING THAT SURVIVES A SHIFTING PAGE

   `scroll-behavior: smooth` plus a plain href="#inquiry" is enough
   on a static document. This document is not static: nearly every
   image below the fold is loading="lazy", so they arrive WHILE the
   scroll is running and each one changes the height above the
   target.

   The browser computes the destination once, at click time, and
   never revises it. Over the longest jump on the page — the hero's
   call to action, top to the form near the bottom — that drift adds
   up to a whole section, which is why the button was landing on the
   testimonials.

   So: scroll, then keep re-measuring the target for a moment and
   correct if it moved. Any real input from the reader ends it
   immediately; being helpful is not worth fighting someone's thumb.
   ============================================================ */

const SETTLE_MS = 1400
const TOLERANCE = 6

/* The menu lightbox pins `body { overflow: hidden }` while it is open,
   and its call to action both closes the dialog AND links to #inquiry.
   Closing is a state change with an exit animation on it, so the lock
   is still in place for a few frames after the click — long enough to
   swallow the scroll entirely. Wait for the page to be scrollable
   again, but never longer than the exit takes. */
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

export function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return false

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Read the offset from the CSS rather than repeating the number,
  // so the header height stays defined in exactly one place.
  const padding =
    parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0

  const targetY = () => el.getBoundingClientRect().top + window.scrollY - padding

  if (reduce) {
    whenScrollable(() => window.scrollTo({ top: targetY(), behavior: 'auto' }))
    return true
  }

  let raf = 0
  let started = performance.now()

  const stop = () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('wheel', stop)
    window.removeEventListener('touchstart', stop)
    window.removeEventListener('keydown', stop)
  }

  const tick = () => {
    if (performance.now() - started > SETTLE_MS) return stop()

    const want = targetY()
    // Only correct once the browser's own scroll has stopped moving,
    // otherwise every frame re-issues a scroll and the page stutters.
    const drift = Math.abs(window.scrollY - want)
    if (drift > TOLERANCE) window.scrollTo({ top: want, behavior: 'smooth' })

    raf = requestAnimationFrame(tick)
  }

  // Passive listeners: these only cancel, they never preventDefault.
  window.addEventListener('wheel', stop, { passive: true })
  window.addEventListener('touchstart', stop, { passive: true })
  window.addEventListener('keydown', stop)

  whenScrollable(() => {
    started = performance.now() // the settle window begins at the scroll
    window.scrollTo({ top: targetY(), behavior: 'smooth' })
    raf = requestAnimationFrame(tick)
  })
  return true
}

/* One delegated listener covers every in-page link on the site — the
   hero button, the nav rail, the mobile sheet, the menu's call to
   action, the footer — without each of them having to remember to
   opt in. */
export function installAnchorScroll() {
  const onClick = (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return

    const link = e.target.closest?.('a[href^="#"]')
    if (!link) return

    const href = link.getAttribute('href') ?? ''
    // '#/admin' is a route, '#top' and '#inquiry' are places on this
    // page. Only the latter are ours to handle.
    if (href.length < 2 || href.startsWith('#/')) return

    const id = href.slice(1)
    if (!document.getElementById(id)) return

    e.preventDefault()
    if (scrollToId(id)) {
      // Keep the address bar honest without letting the hash change
      // trigger a jump of its own.
      history.replaceState(null, '', href)
    }
  }

  document.addEventListener('click', onClick)
  return () => document.removeEventListener('click', onClick)
}
