import { motion, useReducedMotion } from 'motion/react'

/* Section reveal: short travel, slow timing, soft easing.
   Fires once — re-animating on every scroll-past reads as restless. */

const EASE = [0.22, 0.61, 0.36, 1]

export default function Reveal({ children, delay = 0, y = 18, className = '', as = 'div' }) {
  const reduce = useReducedMotion()
  const M = motion[as] ?? motion.div

  return (
    <M
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
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
