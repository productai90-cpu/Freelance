import { motion, useReducedMotion } from 'motion/react'
import useReveal from '../lib/useReveal.js'

/* Section reveal: short travel, slow timing, soft easing.
   Fires once — re-animating on every scroll-past reads as restless.

   The trigger is the site's own useReveal, NOT Motion's whileInView.
   Two reasons. It fails visible where an observer fails hidden, and
   — the point of this pass — every reveal on the page now measures
   arrival the same way, so nothing plays before the reader reaches
   it and nothing in a row goes off at a different moment. */

export const EASE = [0.22, 0.61, 0.36, 1]

export default function Reveal({
  children,
  delay = 0,
  y = 18,
  className = '',
  as = 'div',
  amount,
  shown: shownProp,
}) {
  const reduce = useReducedMotion()
  // Pass `shown` to hand the trigger to a container: a row of parts
  // that belong to one gesture should go off together, not each when
  // its own top edge happens to clear the fold.
  const [ref, selfShown] = useReveal(amount == null ? undefined : { amount })
  const shown = shownProp == null ? selfShown : shownProp
  const M = motion[as] ?? motion.div

  const hidden = reduce ? { opacity: 0 } : { opacity: 0, y }
  const visible = reduce ? { opacity: 1 } : { opacity: 1, y: 0 }

  return (
    <M
      ref={ref}
      className={className}
      initial={hidden}
      animate={shown ? visible : hidden}
      transition={{ duration: reduce ? 0.3 : 0.64, delay: reduce ? 0 : delay, ease: EASE }}
    >
      {children}
    </M>
  )
}

/** Staggers its children by index. Use for lists and grids. */
export function RevealGroup({ children, className = '', step = 0.08, y = 18 }) {
  return (
    <div className={className}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <Reveal key={i} delay={i * step} y={y}>
              {child}
            </Reveal>
          ))
        : children}
    </div>
  )
}
