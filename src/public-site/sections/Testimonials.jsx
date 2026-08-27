import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Container, SectionTitle } from '../../components/Section.jsx'
import { testimonials } from '../../data/content.js'

export default function Testimonials() {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduce = useReducedMotion()
  const items = testimonials.items

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setI((n) => (n + 1) % items.length), 7000)
    return () => clearInterval(t)
  }, [paused, items.length])

  const active = items[i]

  return (
    <section
      className="bg-ink py-24 sm:py-32"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Container>
        <SectionTitle eyebrow={testimonials.eyebrow} title={testimonials.title} dark />

        {/* Fixed min-height so the cross-fade never shifts the layout */}
        <div className="relative mx-auto mt-16 flex min-h-[280px] max-w-3xl items-center justify-center sm:mt-20 sm:min-h-[240px]">
          <AnimatePresence mode="wait">
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: reduce ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -10 }}
              transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
              className="text-center"
            >
              {/* Brass quotation mark, oversized and low-contrast */}
              <span
                aria-hidden
                className="block font-display text-6xl leading-none text-brass/35"
              >
                ”
              </span>

              <blockquote className="mt-4 text-balance font-display text-xl font-light leading-loose text-ivory sm:text-2xl">
                {active.quote}
              </blockquote>

              <figcaption className="mt-8">
                <p className="text-ivory">{active.name}</p>
                <p className="mt-1 text-sm text-muted-lt">{active.meta}</p>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        {/* Rule-segment indicators — quieter than dots */}
        <div className="mt-10 flex justify-center gap-2">
          {items.map((_, n) => (
            <button
              key={n}
              onClick={() => setI(n)}
              aria-label={`نظر ${n + 1}`}
              aria-current={n === i}
              className="group py-3"
            >
              <span
                className={`block h-px transition-all duration-500 ease-[cubic-bezier(.22,.61,.36,1)] ${
                  n === i ? 'w-10 bg-brass' : 'w-5 bg-ivory/25 group-hover:bg-ivory/50'
                }`}
              />
            </button>
          ))}
        </div>
      </Container>
    </section>
  )
}
