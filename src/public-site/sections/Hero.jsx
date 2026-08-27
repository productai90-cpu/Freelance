import { motion, useReducedMotion } from 'motion/react'
import { hall } from '../../config.js'
import heroImg from '../../assets/images/hero.webp'
import heroPortrait from '../../assets/images/gallery-night.webp'

/* ============================================================
   HERO — a staged entrance.

   Two photographs, chosen by orientation:
     landscape → hero.webp, graded warm to read as dusk
     portrait  → gallery-night.webp, an actually-lit evening room

   Most visitors arrive from Instagram on a phone, so the portrait
   case is the common one, not the fallback. Grading differs per
   orientation (see .hero-photo in index.css) because the night
   photograph is already dark and would be crushed by the grade
   that daylight needs.

   Elements arrive in sequence rather than all at once — that is
   what separates "cinematic" from "a web page loaded".
   ============================================================ */

const EASE = [0.22, 0.61, 0.36, 1]

export default function Hero() {
  const reduce = useReducedMotion()

  const rise = (delay) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } }
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay, ease: EASE },
        }

  return (
    <section className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-ink">
      {/* — Photograph, drifting slowly — */}
      <div className="absolute inset-0">
        <picture>
          <source media="(orientation: portrait)" srcSet={heroPortrait} />
          <img
            src={heroImg}
            alt="سالن تالار پذیرایی مرمر در شبی از مراسم"
            className={`hero-photo h-full w-full object-cover ${
              reduce ? '' : 'animate-kenburns'
            }`}
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      </div>

      {/* Warm charcoal grade — brown-black, never neutral black, so the
          wood and linen keep their warmth. Light through the middle
          band so the room itself still reads. */}
      <div
        className="hero-grade absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(34,31,27,0.62) 0%, rgba(34,31,27,0.26) 38%, rgba(34,31,27,0.46) 72%, rgba(34,31,27,0.88) 100%)',
        }}
      />

      {/* Candle-warm glow rising from the room */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(78% 56% at 50% 64%, rgba(194,165,117,0.32) 0%, rgba(194,165,117,0.10) 45%, rgba(194,165,117,0) 74%)',
        }}
      />

      {/* Localised scrim behind the type only. Lets the room stay bright
          at the edges while guaranteeing contrast on the wordmark, which
          otherwise sits on the brightest part of the photograph. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(46% 38% at 50% 46%, rgba(34,31,27,0.52) 0%, rgba(34,31,27,0.28) 50%, rgba(34,31,27,0) 78%)',
        }}
      />

      {/* Fine grain — soft-light so it doesn't crush the shadows */}
      <div
        className="grain absolute inset-0"
        style={{ mixBlendMode: 'soft-light', opacity: 0.75 }}
      />

      {/* ——————————————————— Content ——————————————————— */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.p {...rise(0.35)} className="eyebrow mb-5">
          {hall.kicker}
        </motion.p>

        <motion.h1
          {...rise(0.5)}
          className="fluid-display font-display font-extralight text-ivory"
          style={{ lineHeight: 1.15 }}
        >
          {hall.name}
        </motion.h1>

        {/* The brass inlay, drawn rather than faded — the single most
            "expensive" detail in the hero. */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 132, opacity: 1 }}
          transition={
            reduce ? { duration: 0.3 } : { duration: 1.25, delay: 0.95, ease: [0.65, 0, 0.35, 1] }
          }
          className="my-7 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #C2A575, transparent)' }}
        />

        <motion.p
          {...rise(1.25)}
          className="max-w-xl text-balance text-lg font-light text-text-lt sm:text-xl"
        >
          {hall.tagline}
        </motion.p>

        <motion.p
          {...rise(1.4)}
          className="mt-3 max-w-md text-balance text-sm text-muted-lt sm:text-base"
        >
          {hall.heroSub}
        </motion.p>

        <motion.div
          {...rise(1.6)}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-5"
        >
          <a
            href="#inquiry"
            className="group relative overflow-hidden border border-brass/70 px-9 py-3.5 text-sm text-ivory transition-colors duration-300 hover:text-ink"
          >
            {/* Brass fill wipes in from the right — RTL-correct direction */}
            <span className="absolute inset-0 origin-right scale-x-0 bg-brass transition-transform duration-500 ease-[cubic-bezier(.65,0,.35,1)] group-hover:scale-x-100" />
            <span className="relative">استعلام تاریخ و رزرو</span>
          </a>

          <a
            href={`tel:${hall.phoneHref}`}
            className="border-b border-transparent pb-0.5 text-sm text-muted-lt transition-colors duration-300 hover:border-brass hover:text-ivory"
          >
            <span className="num">{hall.phone}</span>
          </a>
        </motion.div>
      </div>

      {/* — Scroll cue — */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: reduce ? 0 : 2.3 }}
        className="absolute inset-x-0 bottom-8 z-10 flex justify-center"
      >
        <div className="h-10 w-px overflow-hidden bg-ivory/20">
          <div className={reduce ? '' : 'animate-scrollcue h-full w-full bg-brass'} />
        </div>
      </motion.div>
    </section>
  )
}
