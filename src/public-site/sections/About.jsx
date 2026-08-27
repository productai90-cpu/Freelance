import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import Reveal from '../../components/Reveal.jsx'
import MaskReveal, { WordReveal } from '../../components/MaskReveal.jsx'
import { Container } from '../../components/Section.jsx'
import { about } from '../../data/content.js'
import { img } from '../../data/images.js'
import useReveal from '../../lib/useReveal.js'
import { toFa } from '../../lib/digits.js'
import textureImg from '../../assets/images/texture.webp'

/* ============================================================
   ABOUT — the reference layout, in this site's materials.

   One raised panel holds everything: copy on the inline-start
   (right, in RTL), a stacked photo pair opposite it, and a row of
   four figures ruled off along the bottom. The reference tilts the
   front photograph over the back one and threads a dashed line
   through the composition; both are kept, because that overlap is
   what stops the block reading as a two-column table.

   What is NOT kept is the reference's styling — rounded corners,
   pill button, orange. Those belong to another brand. Here the
   panel is square-cornered near-white on the page's silver, ruled
   in hairlines, and the only accent is pewter.
   ============================================================ */

const EASE = [0.22, 0.61, 0.36, 1]

/* The dashed thread.

   In the reference a dotted flight path sweeps behind the panel and
   ties the copy to the photographs. Same job here, drawn as one
   hairline that strokes itself in on reveal — the site already uses
   a rule drawing across as its reveal signature, so the flourish
   arrives in a vocabulary the reader has met in every section. */
function Thread({ reduce }) {
  // The svg is inset-0 of the panel, so watching itself IS watching
  // the panel — the thread draws when the composition it decorates
  // is on screen, not when its top edge grazes the fold.
  const [ref, shown] = useReveal()

  return (
    <svg
      ref={ref}
      aria-hidden
      viewBox="0 0 1200 620"
      preserveAspectRatio="none"
      /* Desktop only. The path is stretched to the panel with
         preserveAspectRatio="none", and a narrow panel squeezes the
         sweep into a near-vertical line straight through the
         paragraphs — a decoration that costs legibility is not one. */
      className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
    >
      <motion.path
        d="M1180 70 C 980 -20, 700 140, 560 300 C 430 450, 240 560, 20 470"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="1"
        strokeDasharray="5 7"
        opacity="0.5"
        initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: reduce || shown ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 2.2, ease: EASE }}
      />
    </svg>
  )
}

/* Counts from zero to `target` on an ease-out curve.

   Driven by the site's own useReveal, not Motion's useInView: a
   figure that fails to start reads as «۰ ظرفیت مهمان», which is
   worse than no animation at all. useReveal fails visible, and the
   value is clamped to the target on the last frame so the number
   the reader ends on is always exact. */
function useCountUp(target, run, duration = 1700) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!run) return
    let raf
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(p === 1 ? target : Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [run, target, duration])

  return value
}

/* One figure.

   The reference sets a bare number over a caption. That reads as a
   spec sheet, so each figure here gets the page's own furniture: an
   accent rule that draws across above it, the numeral counting up
   underneath, the unit word carried in accent beside it, and — from
   lg, where the four sit in a row — a hairline dividing it from its
   neighbour. The rule and the count share a delay, so the figure
   assembles as one gesture rather than two. */
function Stat({ stat, index, reduce }) {
  const [ref, shown] = useReveal()
  const counted = useCountUp(stat.to, shown && !reduce)
  const display = toFa(reduce ? stat.to : counted)

  return (
    <motion.div
      ref={ref}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
      animate={shown ? { opacity: 1, y: 0 } : reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
      transition={{ duration: 0.7, delay: index * 0.09, ease: EASE }}
      className={`text-right ${index > 0 ? 'lg:border-s lg:border-line lg:ps-8' : ''}`}
    >
      <motion.span
        aria-hidden
        className="block h-px w-10 origin-right bg-accent"
        initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
        animate={{ scaleX: reduce || shown ? 1 : 0 }}
        transition={{ duration: 0.9, delay: 0.2 + index * 0.09, ease: [0.65, 0, 0.35, 1] }}
      />

      {/* tabular-nums holds the width steady while the digits run —
          without it the label below shifts on every frame. */}
      <p className="mt-6 flex items-baseline gap-1.5 font-display text-4xl font-light leading-none text-ink sm:text-[2.75rem]">
        <span className="num tabular-nums">{display}</span>
        {stat.unit && <span className="text-2xl text-accent sm:text-3xl">{stat.unit}</span>}
      </p>

      <p className="mt-3.5 text-sm leading-relaxed text-muted">{stat.label}</p>
    </motion.div>
  )
}

/* The copy column reveals as one column. Eyebrow, title, rule and
   paragraphs each used to watch for themselves, which meant the
   eyebrow — one short line at the very top — had long finished by
   the time the paragraphs under it arrived. */
function Copy() {
  const [ref, shown] = useReveal()

  return (
    <div ref={ref}>
      <Reveal shown={shown}>
        <p className="eyebrow mb-4">{about.eyebrow}</p>
      </Reveal>

      <h2 className="fluid-title font-display font-light text-ink">
        <WordReveal text={about.title} delay={60} shown={shown} />
      </h2>

      <Reveal shown={shown} delay={0.12}>
        <div
          className="mt-6 h-px w-16"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)',
          }}
        />
      </Reveal>

      <div className="mt-8 space-y-5">
        {about.body.map((p, i) => (
          <Reveal key={i} shown={shown} delay={0.16 + i * 0.08}>
            <p className="leading-loose text-muted">{p}</p>
          </Reveal>
        ))}
      </div>
    </div>
  )
}

/* Both photographs open off the pair's own rect. The front frame
   overlaps the back one, so triggering them separately had the tilt
   land before the frame it is supposed to be breaking had opened. */
function StackedPair({ back, front, reduce }) {
  const [ref, shown] = useReveal()

  return (
    <div ref={ref} className="relative pb-16 sm:pb-20 lg:pb-14">
      <MaskReveal
        shown={shown}
        className="relative aspect-[4/5] w-[80%] border border-line bg-line/25 shadow-soft sm:aspect-[5/6]"
      >
        <img
          src={img(back.photo)}
          alt={back.alt}
          loading="lazy"
          decoding="async"
          className="photo-cool h-full w-full object-cover"
        />
      </MaskReveal>

      {/* Tilted in front, breaking the back frame's lower-left
          corner. It straightens a few degrees on hover, and that
          is the whole interaction — this site does not bounce. */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26, rotate: -10 }}
        animate={
          shown
            ? { opacity: 1, y: 0, rotate: reduce ? 0 : -6 }
            : reduce
              ? { opacity: 0 }
              : { opacity: 0, y: 26, rotate: -10 }
        }
        transition={{ duration: 1, delay: 0.35, ease: EASE }}
        className="absolute bottom-0 left-0 w-[62%] origin-bottom-left"
      >
        <div className="aspect-[3/4] border-4 border-surface bg-line/25 shadow-lift">
          <img
            src={img(front.photo)}
            alt={front.alt}
            loading="lazy"
            decoding="async"
            className="photo-cool h-full w-full object-cover"
          />
        </div>
      </motion.div>
    </div>
  )
}

export default function About() {
  const reduce = useReducedMotion()
  const { back, front } = about.figures

  return (
    <section id="about" className="relative overflow-hidden bg-base py-24 sm:py-32">
      {/* Marble wash behind the whole section, barely there */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage: `url(${textureImg})`,
          backgroundSize: '820px',
          maskImage: 'radial-gradient(72% 62% at 50% 38%, #000 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(72% 62% at 50% 38%, #000 0%, transparent 100%)',
        }}
      />

      <Container className="relative">
        {/* The panel. Square corners and a hairline border — the
            reference's soft radius would read as a different brand. */}
        <div className="relative border border-line bg-surface px-6 py-14 shadow-lift sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          <Thread reduce={reduce} />

          <div className="relative grid items-center gap-16 lg:grid-cols-2 lg:gap-14">
            {/* — Copy. First child, so RTL places it on the right — */}
            <Copy />

            {/* — The stacked pair — */}
            <StackedPair back={back} front={front} reduce={reduce} />
          </div>

          {/* — Figures, ruled off along the bottom — */}
          <div className="relative mt-14 border-t border-line pt-12 sm:mt-20">
            <div className="grid grid-cols-2 gap-y-12 sm:gap-x-8 lg:grid-cols-4 lg:gap-x-0">
              {about.stats.map((s, i) => (
                <Stat key={s.label} stat={s} index={i} reduce={reduce} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
