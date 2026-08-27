import { motion, useReducedMotion } from 'motion/react'
import { Container, SectionTitle } from '../../components/Section.jsx'
import { ICON_SHAPES, SVG_PROPS } from '../../components/ServiceIcons.jsx'
import { services } from '../../data/content.js'

const EASE = [0.22, 0.61, 0.36, 1]

/** Renders one icon with each stroke drawing itself in. */
function DrawnIcon({ name, delay, reduce, className = '' }) {
  const shapes = ICON_SHAPES[name] ?? ICON_SHAPES.sparkle

  const stroke = {
    initial: reduce ? { opacity: 0 } : { pathLength: 0, opacity: 0 },
    whileInView: reduce ? { opacity: 1 } : { pathLength: 1, opacity: 1 },
    viewport: { once: true, margin: '-60px' },
  }

  return (
    <svg {...SVG_PROPS} className={className}>
      {shapes.map((s, i) =>
        s.t === 'circle' ? (
          <motion.circle
            key={i}
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            {...stroke}
            transition={{ duration: 0.8, delay: delay + i * 0.06, ease: 'easeInOut' }}
          />
        ) : (
          <motion.path
            key={i}
            d={s.d}
            {...stroke}
            transition={{ duration: 0.8, delay: delay + i * 0.06, ease: 'easeInOut' }}
          />
        ),
      )}
    </svg>
  )
}

export default function Services() {
  const reduce = useReducedMotion()

  return (
    <section id="services" className="bg-ivory py-24 sm:py-32">
      <Container>
        <SectionTitle eyebrow={services.eyebrow} title={services.title} intro={services.intro} />

        {/* gap-px over a vein background draws the dividing hairlines
            without any per-cell border bookkeeping */}
        <div className="mt-16 grid gap-px overflow-hidden border border-vein bg-vein sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
          {services.items.map((s, i) => (
            <motion.div
              key={s.title}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: (i % 4) * 0.07, ease: EASE }}
              className="group relative bg-ivory p-8 transition-colors duration-500 hover:bg-cream"
            >
              <DrawnIcon
                name={s.icon}
                delay={0.15 + (i % 4) * 0.07}
                reduce={reduce}
                className="h-10 w-10 text-brass transition-transform duration-500 group-hover:scale-105"
              />

              <h3 className="mt-6 font-display text-lg font-normal text-ink">{s.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{s.desc}</p>

              {/* Brass rule grows from the inline-start (right) edge */}
              <span className="absolute bottom-0 right-0 h-px w-0 bg-brass transition-all duration-500 ease-[cubic-bezier(.65,0,.35,1)] group-hover:w-full" />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
