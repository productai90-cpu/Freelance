import { motion, useReducedMotion } from 'motion/react'
import { hall } from '../../config.js'
import heroImg from '../../assets/images/hero.webp'
import heroPortrait from '../../assets/images/gallery-night.webp'
import HolographicBeams from '../../components/HolographicBeams.jsx'

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

export default function Hero({ variant = 'photo' }) {
  const reduce = useReducedMotion()
  const beams = variant === 'beams'

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
            'linear-gradient(180deg, rgba(46,50,54,0.50) 0%, rgba(46,50,54,0.14) 38%, rgba(46,50,54,0.34) 72%, rgba(46,50,54,0.82) 100%)',
        }}
      />

      {/* Candle-warm glow rising from the room */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(78% 56% at 50% 64%, rgba(154,163,172,0.32) 0%, rgba(154,163,172,0.10) 45%, rgba(154,163,172,0) 74%)',
        }}
      />

      {/* — Light shafts —

          ABOVE the two grades and BELOW the type scrim, and the order
          is the whole trick. Composited with `screen`, the beams only
          ever add light; sat underneath the grades, every one of them
          subtracted it straight back and the movement disappeared.
          Here the grades darken the ROOM and the beams then light it,
          which is what stage lighting actually does — while the scrim
          below still lands on top of them to hold the wordmark. */}
      {beams && (
        <HolographicBeams density={15} speed={1.5} aberration={3} opacity={88} direction="down" />
      )}

      {/* Ceiling scrim, beams only.

          The shafts now root at the TOP edge, and over the hero the
          nav is transparent with white type and a light monogram —
          a bright band there would take it out. This holds the top
          strip down and releases by a third of the way in.

          It also reads better than the alternative: masking the
          source puts the fixtures above the frame, so what shows is
          the cone rather than a lit strip along the edge. That is
          how the light in a hall actually presents. */}
      {beams && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(46,50,54,0.62) 0%, rgba(46,50,54,0.26) 15%, rgba(46,50,54,0) 34%)',
          }}
        />
      )}

      {/* Localised scrim behind the type only. Lets the room stay bright
          at the edges while guaranteeing contrast on the wordmark, which
          otherwise sits on the brightest part of the photograph. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(50% 42% at 50% 46%, rgba(46,50,54,0.60) 0%, rgba(46,50,54,0.34) 48%, rgba(46,50,54,0) 78%)',
        }}
      />

      {/* Fine grain — soft-light so it doesn't crush the shadows */}
      <div
        className="grain absolute inset-0"
        style={{ mixBlendMode: 'soft-light', opacity: 0.75 }}
      />

      {/* ——————————————————— Content ——————————————————— */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center sm:px-10">
        <motion.p {...rise(0.35)} className="eyebrow eyebrow-lt mb-2.5">
          {hall.kicker}
        </motion.p>

        {/* Markazi Text ships 400–700 only, so the old `font-extralight`
            was being clamped to 400 and did nothing. 600 is a real step
            inside the face — and it is what separates the wordmark from
            everything under it, which is now uniformly light. */}
        <motion.h1
          {...rise(0.5)}
          className="fluid-display font-display font-semibold text-surface"
          style={{ lineHeight: 1.15 }}
        >
          {hall.name}
        </motion.h1>

        {/* The accent inlay, drawn rather than faded — the single most
            "expensive" detail in the hero. */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 132, opacity: 1 }}
          transition={
            reduce ? { duration: 0.3 } : { duration: 1.25, delay: 0.95, ease: [0.65, 0, 0.35, 1] }
          }
          className="my-7 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)' }}
        />

        {/* The tagline used to sit at full strength and a heavier
            size than the line under it, which put two competing
            weights below the wordmark. Both are light and quiet now,
            and only the size separates them — so the hierarchy is
            wordmark first, then everything else, in one voice. */}
        <motion.p
          {...rise(1.25)}
          className="max-w-md text-balance text-sm font-light text-surface/75 sm:text-base"
        >
          {hall.tagline}
        </motion.p>

        <motion.p
          {...rise(1.4)}
          className="mt-3.5 max-w-md text-balance text-sm font-light text-surface/70 sm:text-base"
        >
          {hall.heroSub}
        </motion.p>

        <motion.div
          {...rise(1.6)}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-5"
        >
          <a
            href="#inquiry"
            className="group relative overflow-hidden border border-surface/60 px-9 py-3.5 text-sm text-surface transition-colors duration-300 hover:border-surface hover:text-ink"
          >
            {/* Fill wipes in from the right — RTL-correct direction */}
            <span className="absolute inset-0 origin-right scale-x-0 bg-surface transition-transform duration-500 ease-[cubic-bezier(.65,0,.35,1)] group-hover:scale-x-100" />
            <span className="relative">استعلام تاریخ و رزرو</span>
          </a>

          {/* Mobile number only. A tel: link, so a tap dials on a phone;
              dir=ltr keeps the digits reading correctly. */}
          <a
            href={`tel:${hall.mobileHref}`}
            dir="ltr"
            className="num inline-block border-b border-transparent pb-0.5 text-left text-sm font-light text-surface/70 transition-colors duration-300 hover:border-surface hover:text-surface"
          >
            {hall.mobile}
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
        <div className="h-10 w-px overflow-hidden bg-surface/20">
          <div className={reduce ? '' : 'animate-scrollcue h-full w-full bg-accent'} />
        </div>
      </motion.div>
    </section>
  )
}
