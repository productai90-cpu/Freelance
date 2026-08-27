import { motion, useReducedMotion } from 'motion/react'
import { Container, SectionTitle } from '../../components/Section.jsx'
import { DrawnIcon } from '../../components/ServiceIcons.jsx'
import { services } from '../../data/content.js'
import useReveal from '../../lib/useReveal.js'

const EASE = [0.22, 0.61, 0.36, 1]
const EASE_CSS = 'ease-[cubic-bezier(.22,.61,.36,1)]'

/* Only these two icons are decorative rather than descriptive — a
   sparkle and a firework. A slow few degrees suits them; rotating a
   mirror or a parking sign would just look broken. */
const DECORATIVE = new Set(['sparkle', 'spark'])

/* ============================================================
   SERVICES

   Entrance and hover are deliberately on SEPARATE elements. Motion
   writes the entrance transform to the cell's inline style, and an
   inline transform beats any hover class — put the lift on the same
   node and it silently never fires. So: the cell animates in, and
   the panel inside it does the lifting.

   That split pays off twice. The cell keeps painting --color-surface
   at full size while the panel rises, so the 4px the panel vacates
   shows surface rather than the hairline grid behind it.

   Hover is desktop-only for free: Tailwind v4 compiles every
   `hover:` and `group-hover:` behind @media (hover: hover), so a
   touch device gets the scroll-in reveal and nothing else.
   ============================================================ */
export default function Services() {
  const reduce = useReducedMotion()

  return (
    <section id="services" className="bg-base py-24 sm:py-32">
      <Container>
        <SectionTitle eyebrow={services.eyebrow} title={services.title} intro={services.intro} />

        {/* gap-px over a line background draws the dividing hairlines
            without any per-cell border bookkeeping. No overflow-hidden:
            it would shear the top row's 4px lift off at the container
            edge. */}
        <div className="mt-14 grid gap-px border border-line bg-line sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
          {services.items.map((s, i) => (
            <ServiceCell key={s.title} s={s} index={i} reduce={reduce} />
          ))}
        </div>
      </Container>
    </section>
  )
}

/* One cell, one trigger. The icon draws itself off the CARD's reveal
   rather than off an observer of its own — a 48px icon sitting at the
   top of the panel satisfies its own threshold well before the panel
   it belongs to is on screen, which is how strokes ended up drawing
   themselves in cells the reader had not reached yet. */
function ServiceCell({ s, index, reduce }) {
  const [ref, shown] = useReveal()

  return (
    <motion.div
      ref={ref}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={
        shown
          ? { opacity: 1, y: 0 }
          : reduce
            ? { opacity: 0 }
            : { opacity: 0, y: 20 }
      }
      transition={{ duration: 0.7, delay: (index % 4) * 0.06, ease: EASE }}
      className="group relative bg-surface hover:z-10"
    >
      {/* The panel that wakes up. Border is transparent at rest
          rather than absent, so turning it on costs no 1px
          reflow of everything inside. */}
      <div
        className={`relative h-full border border-transparent bg-surface p-8 transition-[transform,box-shadow,border-color] duration-300 ${EASE_CSS} group-hover:-translate-y-1 group-hover:border-accent group-hover:shadow-hover`}
      >
        <DrawnIcon
          name={s.icon}
          delay={0.15 + (index % 4) * 0.07}
          reduce={reduce}
          trigger={shown ? 'now' : 'hold'}
          className={`h-12 w-12 text-ink transition-[transform,color] duration-300 ${EASE_CSS} group-hover:scale-[1.08] group-hover:text-accent-deep ${
            DECORATIVE.has(s.icon) ? 'group-hover:rotate-3 group-hover:duration-300' : ''
          }`}
        />

        {/* inline-block so the underline measures the title, not
            the column; the rule is absolute so switching it on
            never pushes the description down. */}
        <h3
          className={`relative mt-6 inline-block font-display text-lg font-normal text-ink transition-colors duration-300 ${EASE_CSS} group-hover:text-accent-deep`}
        >
          {s.title}
          <span
            aria-hidden
            className={`absolute -bottom-1.5 right-0 h-0.5 w-0 bg-accent transition-all duration-300 ${EASE_CSS} group-hover:w-6`}
          />
        </h3>

        <p className="mt-2.5 text-sm leading-relaxed text-muted">{s.desc}</p>
      </div>
    </motion.div>
  )
}
