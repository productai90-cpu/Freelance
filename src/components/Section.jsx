import { motion, useReducedMotion } from 'motion/react'
import { EASE } from './Reveal.jsx'
import { WordReveal } from './MaskReveal.jsx'
import useReveal from '../lib/useReveal.js'

/** Page container. One max-width for the whole site. */
export function Container({ children, className = '' }) {
  return <div className={`mx-auto w-full max-w-[1200px] px-6 sm:px-10 ${className}`}>{children}</div>
}

/** Hairline rule — the marble-inlay motif. */
export function Hairline({ className = '', accent = false }) {
  return <div className={`${accent ? 'hairline-accent' : 'hairline'} ${className}`} />
}

/**
 * Section heading: accent eyebrow, display title, and a short accent
 * rule beneath. Used identically across every section so the page
 * has one rhythm rather than eight.
 *
 * The four parts share ONE trigger, taken on the whole heading block.
 * Given a trigger each, the eyebrow — a single line at the top — would
 * satisfy its own observer while the title below it was still off
 * screen, and the heading would assemble in front of nobody.
 */
export function SectionTitle({ eyebrow, title, intro, align = 'center', dark = false }) {
  const centered = align === 'center'
  const reduce = useReducedMotion()
  const [ref, shown] = useReveal()

  const rise = (delay) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 18 },
    animate: shown
      ? reduce
        ? { opacity: 1 }
        : { opacity: 1, y: 0 }
      : reduce
        ? { opacity: 0 }
        : { opacity: 0, y: 18 },
    transition: { duration: reduce ? 0.3 : 0.64, delay: reduce ? 0 : delay, ease: EASE },
  })

  return (
    <div ref={ref} className={`${centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}`}>
      {eyebrow && (
        <motion.p className="eyebrow mb-4" {...rise(0)}>
          {eyebrow}
        </motion.p>
      )}

      {/* Words rise one after another from behind a mask. Persian words
          stay whole — splitting to characters would sever letter joins. */}
      <h2 className={`fluid-title font-display font-light ${dark ? 'text-surface' : 'text-ink'}`}>
        <WordReveal text={title} delay={60} shown={shown} />
      </h2>

      <motion.div
        className={`mt-6 h-px w-16 ${centered ? 'mx-auto' : ''}`}
        style={{ background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)' }}
        {...rise(0.12)}
      />

      {intro && (
        <motion.p
          className={`mt-6 text-balance leading-loose ${dark ? 'text-surface/70' : 'text-muted'}`}
          {...rise(0.18)}
        >
          {intro}
        </motion.p>
      )}
    </div>
  )
}
