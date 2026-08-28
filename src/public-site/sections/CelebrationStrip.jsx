import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { celebration } from '../../data/content.js'
import { img } from '../../data/images.js'
import useReveal from '../../lib/useReveal.js'
import phoneBg from '../../assets/images/celebration-strip-phone.webp'

/* ============================================================
   CELEBRATION STRIP — a breath between two dense sections.

   The menu and the services grid are both information: lists,
   icons, facts. Running one straight into the other flattens the
   page. This band carries no information at all — one photograph
   and one line — so the reader comes up for air and meets a person
   again before the next grid.

   The parallax is `background-attachment: fixed`, and only from lg
   up: on iOS it is either ignored or repaints the whole layer on
   every scroll frame, which costs far more than the effect is worth.
   ============================================================ */

const EASE = [0.22, 0.61, 0.36, 1]

export default function CelebrationStrip() {
  const reduce = useReducedMotion()
  // The line and the rule under it are one gesture, on one trigger.
  const [ref, shown] = useReveal()

  /* A phone gets a different photograph behind the band. The desktop
     shot is a wide frame filling a wide band; at phone width the band
     is nearly square and that frame is cropped to a sliver of itself,
     so the phone gets the chandelier instead — a subject that reads at
     any size. Resolved at mount, like the gallery pair, so only one
     of the two is ever fetched. */
  const [phone] = useState(() => window.matchMedia?.('(max-width: 767px)').matches ?? false)
  const background = phone ? phoneBg : img('celebrationStrip')

  return (
    <section
      aria-label={celebration.alt}
      className="relative isolate flex min-h-[45vh] items-center justify-center overflow-hidden bg-base bg-cover bg-center bg-scroll lg:min-h-[60vh] lg:bg-fixed"
      style={{ backgroundImage: `url(${background})` }}
    >
      {/* Light scrim in the page's own ground colour, so the photograph
          reads as part of the palette rather than a window cut into it.
          Kept under half strength — the photograph is already almost
          white, and a heavier scrim erases the couple entirely. */}
      <div className="pointer-events-none absolute inset-0 bg-base/45" />

      {/* Each edge dissolves into the section it actually touches: the
          menu's panelled ground above, the services grid's base below.
          Fading both to one colour left a visible rule at whichever
          edge did not match. */}
      <div className="band-edge band-edge-top band-color-panel" />
      <div className="band-edge band-edge-bottom band-color-base" />

      <motion.div
        ref={ref}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
        animate={shown ? { opacity: 1, y: 0 } : reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
        transition={{ duration: 0.9, ease: EASE }}
        className="relative mx-auto max-w-2xl px-6 py-24 text-center sm:px-10 sm:py-32"
      >
        <p className="eyebrow">{celebration.eyebrow}</p>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: shown ? 1 : 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.65, 0, 0.35, 1] }}
          className="mx-auto mt-5 h-px w-24"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)',
          }}
        />

        <p className="mt-7 text-balance font-display text-2xl font-light leading-relaxed text-ink sm:text-3xl">
          {celebration.line}
        </p>
      </motion.div>
    </section>
  )
}
