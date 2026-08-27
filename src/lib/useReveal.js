import { useEffect, useRef, useState } from 'react'

/* ============================================================
   Scroll reveal — deliberately dependency-free.

   Earlier versions leaned on Motion's whileInView / useInView.
   Those FAIL HIDDEN: if the trigger never satisfies (tall element,
   negative root margin, two nested observers disagreeing), the
   content stays clipped forever. That is what emptied the gallery.

   This runs a plain rect check on mount, on scroll and on resize.
   It is trivial to reason about, and if anything at all goes wrong
   the element is simply shown. Fail visible, never fail hidden.

   ---- The trigger rule ----

   One rule for the whole site, so nothing fires ahead of anything
   else: an element reveals once enough of IT is actually on screen.

     need = max( min(height, viewport × floor),
                 min(height × amount, viewport × cap) )

   The inner `height × amount` is what makes it read as "the reader
   has arrived at this thing" — a share of the element, not a single
   peeking pixel, which is what had reveals finishing before you got
   to them.

   `viewport × cap` is the safety valve. Without it, anything taller
   than the viewport could never satisfy `height × amount` and would
   hang hidden forever. Capping the requirement at a share of the
   SCREEN lets a tall figure reveal once it fills that much of the
   view, and keeps the rule satisfiable at any size.

   The floor covers the other end. A share of a one-line eyebrow is
   a few pixels, so short elements were still firing off the bottom
   edge; `min(height, viewport × floor)` asks a small element to be
   fully on screen, and never asks for more than the element has.

   Every term is bounded by the viewport, so the rule can always be
   met. Fail visible, never fail hidden.
   ============================================================ */

export default function useReveal({ amount = 0.3, cap = 0.22, floor = 0.06 } = {}) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    // No element for any reason -> show it rather than hide it.
    if (!el) {
      setShown(true)
      return
    }

    let done = false
    let frame = 0

    const check = () => {
      frame = 0
      if (done) return

      const r = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight || 0
      const h = r.height || el.offsetHeight || 0

      // How much of the element the reader can actually see, in px.
      const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0)
      const need = Math.max(
        1,
        Math.min(h, vh * floor),
        Math.min(h * amount, vh * cap),
      )

      // Show when enough is on screen; also show unconditionally if
      // it is already above the fold (deep link, reload mid-page) or
      // if it measures as zero-height, which means layout is not
      // ready and waiting on it would strand the content.
      if (visible >= need || r.bottom <= 0 || (h === 0 && r.top < vh)) {
        done = true
        setShown(true)
        detach()
      }
    }

    // Scroll fires far faster than we can paint; coalesce the layout
    // read onto the frame so a long page is not measuring per event.
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check)
    }

    const detach = () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
      frame = 0
    }

    // Already in view on mount — nothing to listen for.
    check()
    if (!done) {
      window.addEventListener('scroll', schedule, { passive: true })
      window.addEventListener('resize', schedule)
    }
    return detach
  }, [amount, cap, floor])

  return [ref, shown]
}
