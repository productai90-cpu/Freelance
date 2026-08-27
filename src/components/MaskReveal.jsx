import { useReducedMotion } from 'motion/react'
import useReveal from '../lib/useReveal.js'

/* ============================================================
   The editorial image reveal.

   A clip-path curtain opens upward while the image inside
   counter-scales back to 1. Because the two move in opposite
   directions the photograph settles into place rather than
   sliding in.

   Driven by plain CSS transitions and one boolean, not by a
   motion library — a masked reveal that fails hidden takes the
   content with it, and that is exactly what went wrong before.
   ============================================================ */

const EASE = 'cubic-bezier(.33,.9,.28,1)'

export default function MaskReveal({
  children,
  className = '',
  delay = 0,
  duration = 1100,
  shown: shownProp,
}) {
  const reduce = useReducedMotion()
  // As with WordReveal: a figure that belongs to a composition takes
  // its cue from the composition, so the pieces open together.
  const [ref, selfShown] = useReveal()
  const shown = shownProp == null ? selfShown : shownProp

  if (reduce) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className={`overflow-hidden ${className}`}
      style={{
        clipPath: shown ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)',
        transition: `clip-path ${duration}ms ${EASE} ${delay}ms`,
      }}
    >
      <div
        className="h-full w-full"
        style={{
          transform: shown ? 'scale(1)' : 'scale(1.1)',
          transition: `transform ${duration + 200}ms ${EASE} ${delay}ms`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

/* Text that rises word by word. Persian words stay whole —
   splitting into characters would sever the letter joins. */
export function WordReveal({ text, className = '', delay = 0, step = 55, shown: shownProp }) {
  const reduce = useReducedMotion()
  // A heading inside a group (SectionTitle) is told when to run, so
  // the eyebrow, the words and the rule are one gesture. Standing on
  // its own it watches for itself.
  const [ref, selfShown] = useReveal()
  const shown = shownProp == null ? selfShown : shownProp

  if (reduce) {
    return (
      <span ref={ref} className={className}>
        {text}
      </span>
    )
  }

  return (
    <span ref={ref} className={className}>
      {String(text)
        .split(' ')
        .map((word, i) => (
          // pb/-mb pair gives the mask room for Persian descenders,
          // which overflow-hidden would otherwise shear off.
          //
          // The gap between words is a margin, not a space character:
          // a trailing space inside an overflow-hidden inline-block is
          // trimmed away, which left Markazi Text headlines reading as
          // one unbroken word.
          <span
            key={i}
            className="-mb-[0.22em] inline-block overflow-hidden align-bottom pb-[0.22em]"
            style={{ marginInlineEnd: '0.26em' }}
          >
            <span
              className="inline-block"
              style={{
                transform: shown ? 'translateY(0)' : 'translateY(105%)',
                transition: `transform 800ms cubic-bezier(.22,.75,.3,1) ${delay + i * step}ms`,
              }}
            >
              {word}
            </span>
          </span>
        ))}
    </span>
  )
}
