import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { Container, SectionTitle } from '../../components/Section.jsx'
import MaskReveal from '../../components/MaskReveal.jsx'
import { gallery } from '../../data/content.js'
import nightImg from '../../assets/images/gallery-night.webp'
import tableImg from '../../assets/images/table.webp'
import gardenImg from '../../assets/images/garden.webp'

const SHOTS = [
  { src: nightImg, caption: gallery.captions.night, id: 'night' },
  { src: tableImg, caption: gallery.captions.table, id: 'table' },
  { src: gardenImg, caption: gallery.captions.garden, id: 'garden' },
]

const EASE = [0.22, 0.61, 0.36, 1]

/* One frame type for every shot.

   Note: these images deliberately do NOT use layoutId. A shared-element
   morph needs Motion to project layout, and that fights the ancestor
   `scale` inside MaskReveal — the combination collapsed the frames.
   The lightbox gets its own scale-and-fade instead, which is robust.

   The caption is attached to the BUTTON, never to the inner parallax
   wrapper, so its padding matches across all three frames. */
function Frame({ shot, className = '', onOpen, priority = false, parallaxY = null, inset = '-8%' }) {
  return (
    <button
      onClick={() => onOpen(shot)}
      className={`group relative block w-full overflow-hidden bg-line/25 ${className}`}
      aria-label={`بزرگ‌نمایی: ${shot.caption}`}
    >
      {parallaxY ? (
        <motion.div
          className="absolute inset-x-0"
          style={{ top: inset, bottom: inset, y: parallaxY }}
        >
          <img
            src={shot.src}
            alt={shot.caption}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className="photo-cool h-full w-full object-cover transition-transform duration-300 ease-[cubic-bezier(.22,.61,.36,1)] group-hover:scale-[1.04]"
          />
        </motion.div>
      ) : (
        <img
          src={shot.src}
          alt={shot.caption}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="photo-cool absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-[cubic-bezier(.22,.61,.36,1)] group-hover:scale-[1.04]"
        />
      )}

      {/* Accent wash on hover */}
      <span className="pointer-events-none absolute inset-0 bg-accent/0 transition-colors duration-300 group-hover:bg-accent/10" />

      {/* Caption — identical p-5 on every frame */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-scrim/85 to-transparent p-4 pt-14 text-right sm:p-5">
        <span className="block translate-y-2 text-sm text-surface opacity-0 transition-all duration-300 ease-[cubic-bezier(.22,.61,.36,1)] group-hover:translate-y-0 group-hover:opacity-100">
          {shot.caption}
        </span>
        <span className="mt-2 block h-px w-0 bg-accent/70 transition-all duration-300 ease-[cubic-bezier(.65,0,.35,1)] group-hover:w-16" />
      </span>
    </button>
  )
}

export default function Gallery() {
  const [active, setActive] = useState(null)
  const reduce = useReducedMotion()
  const sectionRef = useRef(null)
  const leadRef = useRef(null)

  /* The lead shot is portrait inside a landscape frame, so it is given
     generous vertical overflow and a wide parallax range — scrolling
     pans through the whole photograph instead of showing a fixed crop. */
  const { scrollYProgress: leadProgress } = useScroll({
    target: leadRef,
    offset: ['start end', 'end start'],
  })
  const leadDrift = useTransform(leadProgress, [0, 1], ['-10%', '10%'])

  /* The pair drifts the opposite way and more gently — opposing motion
     reads as depth rather than as the whole page sliding. */
  const { scrollYProgress: pairProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const pairDrift = useTransform(pairProgress, [0, 1], ['5%', '-5%'])

  useEffect(() => {
    if (!active) return
    const onKey = (e) => e.key === 'Escape' && setActive(null)
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [active])

  return (
    <section id="gallery" ref={sectionRef} className="bg-surface py-24 sm:py-32">
      <Container>
        <SectionTitle eyebrow={gallery.eyebrow} title={gallery.title} intro={gallery.intro} />

        <div className="mt-14 sm:mt-20">
          {/* Lead shot */}
          <div ref={leadRef}>
            <MaskReveal>
              <Frame
                shot={SHOTS[0]}
                priority
                onOpen={setActive}
                parallaxY={reduce ? null : leadDrift}
                inset="-14%"
                className="aspect-[4/5] max-h-[76vh] sm:aspect-[3/2] sm:max-h-[70vh] lg:aspect-[16/9] lg:max-h-[64vh]"
              />
            </MaskReveal>
          </div>

          {/* Offset pairing — deliberately unequal, so it reads as
              editorial rather than as a grid of thumbnails */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:mt-8 lg:grid-cols-12 lg:gap-8">
            <MaskReveal delay={80} className="lg:col-span-7">
              <Frame
                shot={SHOTS[1]}
                onOpen={setActive}
                parallaxY={reduce ? null : pairDrift}
                inset="-6%"
                className="aspect-[4/3] max-h-[60vh] lg:max-h-[52vh]"
              />
            </MaskReveal>
            <MaskReveal delay={180} className="lg:col-span-5 lg:mt-14">
              <Frame
                shot={SHOTS[2]}
                onOpen={setActive}
                className="aspect-[4/3] max-h-[60vh] lg:max-h-[52vh]"
              />
            </MaskReveal>
          </div>
        </div>
      </Container>

      {/* ——— Lightbox ——— */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-scrim/95 p-3 sm:p-8 lg:p-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={() => setActive(null)}
          >
            <motion.img
              src={active.src}
              alt={active.caption}
              className="max-h-full max-w-full object-contain"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.45, ease: EASE }}
            />

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.18 }}
              className="absolute inset-x-0 bottom-6 text-center text-sm text-surface/70"
            >
              {active.caption}
            </motion.p>

            <button
              onClick={() => setActive(null)}
              aria-label="بستن"
              className="absolute left-5 top-5 h-10 w-10 text-surface/70 transition-colors duration-300 hover:text-surface"
            >
              <span className="absolute left-1/2 top-1/2 block h-px w-6 -translate-x-1/2 rotate-45 bg-current" />
              <span className="absolute left-1/2 top-1/2 block h-px w-6 -translate-x-1/2 -rotate-45 bg-current" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
