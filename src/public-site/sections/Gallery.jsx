import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import Reveal from '../../components/Reveal.jsx'
import { Container, SectionTitle } from '../../components/Section.jsx'
import { gallery } from '../../data/content.js'
import nightImg from '../../assets/images/gallery-night.webp'
import tableImg from '../../assets/images/table.webp'
import gardenImg from '../../assets/images/garden.webp'

const SHOTS = [
  { src: nightImg, caption: gallery.captions.night, id: 'night' },
  { src: tableImg, caption: gallery.captions.table, id: 'table' },
  { src: gardenImg, caption: gallery.captions.garden, id: 'garden' },
]

/* A frame that lifts slightly and warms on hover, and opens into the
   lightbox by morphing from its own position via layoutId. */
function Frame({ shot, className = '', onOpen, priority = false }) {
  return (
    <button
      onClick={() => onOpen(shot)}
      className={`group relative block w-full overflow-hidden bg-cream ${className}`}
      aria-label={`بزرگ‌نمایی: ${shot.caption}`}
    >
      <motion.img
        layoutId={`shot-${shot.id}`}
        src={shot.src}
        alt={shot.caption}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-[700ms] ease-[cubic-bezier(.22,.61,.36,1)] group-hover:scale-[1.03]"
      />

      {/* Brass wash on hover */}
      <span className="pointer-events-none absolute inset-0 bg-brass/0 transition-colors duration-700 group-hover:bg-brass/10" />

      {/* Caption rises from the foot of the frame */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-5 pt-14 text-right">
        <span className="block translate-y-1 text-sm text-ivory opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          {shot.caption}
        </span>
      </span>
    </button>
  )
}

export default function Gallery() {
  const [active, setActive] = useState(null)
  const reduce = useReducedMotion()
  const sectionRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  // Light parallax — disabled under reduced motion and on narrow screens
  const drift = useTransform(scrollYProgress, [0, 1], ['-3%', '3%'])

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
    <section id="gallery" ref={sectionRef} className="bg-ink py-24 sm:py-32">
      <Container>
        <SectionTitle
          eyebrow={gallery.eyebrow}
          title={gallery.title}
          intro={gallery.intro}
          dark
        />
      </Container>

      <div className="mt-16 sm:mt-20">
        {/* Full-bleed hero shot of the section, with slow parallax drift */}
        <Reveal>
          <div className="relative h-[62vh] min-h-[420px] w-full overflow-hidden">
            <motion.div
              className="absolute inset-[-4%]"
              style={reduce ? undefined : { y: drift }}
            >
              <Frame
                shot={SHOTS[0]}
                priority
                onOpen={setActive}
                className="h-full [&_img]:h-full"
              />
            </motion.div>
          </div>
        </Reveal>

        {/* Offset pairing — deliberately unequal, so it reads as editorial
            rather than as a grid of thumbnails */}
        <Container className="mt-6 sm:mt-8">
          <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12">
            <Reveal delay={0.06} className="lg:col-span-7">
              <Frame shot={SHOTS[1]} onOpen={setActive} className="aspect-[4/3]" />
            </Reveal>
            <Reveal delay={0.14} className="lg:col-span-5 lg:pt-14">
              <Frame shot={SHOTS[2]} onOpen={setActive} className="aspect-[4/3]" />
            </Reveal>
          </div>
        </Container>
      </div>

      {/* ——— Lightbox: morphs open from the thumbnail ——— */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 p-4 sm:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setActive(null)}
          >
            <motion.img
              layoutId={`shot-${active.id}`}
              src={active.src}
              alt={active.caption}
              className="max-h-full max-w-full object-contain"
              transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
            />

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.25 }}
              className="absolute inset-x-0 bottom-6 text-center text-sm text-muted-lt"
            >
              {active.caption}
            </motion.p>

            <button
              onClick={() => setActive(null)}
              aria-label="بستن"
              className="absolute left-5 top-5 h-10 w-10 text-ivory/70 transition-colors hover:text-ivory"
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
