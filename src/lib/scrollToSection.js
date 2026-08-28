/* ============================================================
   ANCHOR SCROLLING

   Go straight there. Do not tour the page on the way.

   ---- What this used to do, and why it stopped ----

   Earlier versions animated the scroll position across the whole
   document — from the hero to the form is some ten thousand pixels —
   and every section between the two flew past the reader on the way.
   That was never what the button promised. Someone pressing
   «استعلام تاریخ و رزرو» is not asking to be shown the gallery, the
   menu and the testimonials at speed; they are asking for the form.

   The long flight also cost more than it looked. It took half a
   second during which the reader was holding a phone, and anything
   that happened in that window — a thumb settling on the glass, the
   address bar collapsing, a late reflow — had a moving target to
   land in the middle of. Several bugs lived in that window, and all
   of them were bugs about the window rather than about the
   destination.

   So the position changes at once, and the DESTINATION does the
   moving instead: it rises a few pixels and fades up, which is the
   same gesture every other reveal on this site uses. The reader gets
   "here it is" rather than "watch me get there", and the window in
   which anything can go wrong is gone.
   ============================================================ */

/* The menu lightbox pins `body { overflow: hidden }` while it is
   open, and its call to action both closes the dialog AND links to
   #inquiry. Closing has an exit animation, so the lock outlives the
   click by a few frames — long enough to swallow the jump entirely. */
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

/* Arriving is worth 320ms; travelling is worth none. Matched to the
   site's one easing curve so the landing belongs to the same motion
   language as every other reveal rather than inventing a second. */
const ARRIVE_MS = 320
const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)'

/* How long to keep an eye on the landing, and how far we are willing
   to move the reader while doing it.

   The page can still shift by a few pixels just after the jump — a
   display face swapping in on `font-display: swap` will reflow the
   headings above. Correcting that keeps the form where it was put.

   But the correction is CAPPED, and the cap is the important half.
   An unbounded correction trusts the measurement absolutely: when
   something does go wrong with it — a clamp against a page that is
   briefly shorter, a rect read mid-animation — the reader gets
   hauled backwards through a section, which is far worse than the
   drift it was there to fix. Past this distance we assume we are the
   ones who are wrong and leave the reader alone. */
const HOLD_MS = 700
const MAX_CORRECTION = 120

/* Where the element sits in LAYOUT — deliberately not
   getBoundingClientRect().

   The rect includes every transform on the element and on its
   ancestors, and this page is full of them: the destination plays a
   short rise on arrival, and the Reveal wrapper around it animates
   y:18 -> 0 the first time it is seen. Measured through the rect the
   target therefore MOVES while those animations run, and the
   correction below chases it faithfully — nudging the page a few
   pixels up and down for as long as the entrance lasts. That is the
   shake, and it is the correction doing exactly what it was told.

   Walking offsetTop instead gives the position the element occupies
   in layout: where it will still be once every animation is over,
   which is the only position worth aiming at. */
function layoutTop(node) {
  let y = 0
  for (let el = node; el; el = el.offsetParent) y += el.offsetTop
  return y
}

/* Below this, a difference is sub-pixel layout and font hinting
   rather than the page actually moving. Correcting it would be
   visible motion in service of nothing. */
const DEAD_ZONE = 2

let running = 0
let release = null

export function scrollToId(id) {
  const section = document.getElementById(id)
  if (!section) return false

  /* A section may nominate what the reader should actually land on.
     The inquiry section leads with a heading and an intro, but the
     thing someone pressing «استعلام تاریخ و رزرو» came for is the
     form — so it marks the form and we aim there instead.

     The ownership check is not decoration. `#top` is a <div id="top">
     wrapping the ENTIRE page, so an unscoped querySelector finds the
     inquiry form inside it and every back-to-top link on the site
     quietly becomes another link to the booking form. A marker counts
     only for the section that is its nearest identified ancestor. */
  const marked = section.querySelector('[data-scroll-anchor]')
  const el = marked?.closest('[id]') === section ? marked : section

  const padding =
    parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0

  const targetY = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    return Math.max(0, Math.min(layoutTop(el) - padding, max))
  }

  // Any previous landing is over the moment a new one is asked for.
  release?.()

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  whenScrollable(() => {
    /* 'instant', never 'auto'.

       `behavior: 'auto'` does NOT mean "jump" — it means "use the
       element's computed scroll-behavior", and this site sets
       `html { scroll-behavior: smooth }`. So every scrollTo in this
       file used to be a smooth scroll, including the ones written
       specifically to avoid one. That is why the page still toured
       itself on the way to the form after the animation here was
       removed: the animation was gone, but the browser was quietly
       running its own in its place. */
    const landed = targetY()
    window.scrollTo({ top: landed, behavior: 'instant' })

    /* The destination introduces itself. Not a page transition and
       not a veil: the one element the reader came for, doing the
       same short rise that every section on this site does when you
       reach it. */
    if (!reduce && typeof el.animate === 'function') {
      el.animate(
        [
          { opacity: 0, transform: 'translateY(10px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: ARRIVE_MS, easing: EASE },
      )
    }

    hold(targetY, landed)
  })

  return true
}

/* Keep the landing honest for a moment, within reason. */
function hold(targetY, landed) {
  const started = performance.now()

  const stop = () => {
    cancelAnimationFrame(running)
    window.removeEventListener('wheel', stop)
    window.removeEventListener('touchstart', mark)
    window.removeEventListener('touchmove', drag)
    window.removeEventListener('keydown', stop)
    release = null
  }

  /* ---- Contact is not an instruction ----

     This pair replaces what was once a plain `touchstart -> stop`,
     and that listener was a bug all of its own. On a phone, pressing
     a button and then letting your thumb rest on the glass is not
     one gesture followed by another — it is simply how a thumb
     behaves. The event fired and the landing was abandoned. A mouse
     never touches the screen, so it only ever went wrong on phones.

     Cancel on MOVEMENT. A finger past the slop is a reader scrolling
     and they win at once; a finger merely down is a reader waiting
     to see where they have landed. */
  const SLOP = 8
  let fromY = 0
  const mark = (e) => {
    fromY = e.touches[0]?.clientY ?? 0
  }
  const drag = (e) => {
    const y = e.touches[0]?.clientY ?? fromY
    if (Math.abs(y - fromY) > SLOP) stop()
  }

  release = stop

  // Passive: these only ever cancel, they never preventDefault.
  window.addEventListener('wheel', stop, { passive: true })
  window.addEventListener('touchstart', mark, { passive: true })
  window.addEventListener('touchmove', drag, { passive: true })
  window.addEventListener('keydown', stop)

  const tick = (now) => {
    const to = targetY()
    const drift = to - window.scrollY

    if (Math.abs(drift) > DEAD_ZONE && Math.abs(to - landed) <= MAX_CORRECTION) {
      window.scrollTo({ top: to, behavior: 'instant' })
    }

    if (now - started >= HOLD_MS) stop()
    else running = requestAnimationFrame(tick)
  }

  running = requestAnimationFrame(tick)
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
