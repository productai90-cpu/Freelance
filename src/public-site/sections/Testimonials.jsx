import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import Reveal from '../../components/Reveal.jsx'
import { Container, SectionTitle } from '../../components/Section.jsx'
import useReveal from '../../lib/useReveal.js'
import { testimonials } from '../../data/content.js'
import { img } from '../../data/images.js'
import { toFa } from '../../lib/digits.js'

/* ============================================================
   TESTIMONIALS

   Five voices on a carousel that moves only when the reader moves
   it: two arrows, no autoplay, no scrollbar, no drag-scroll. The
   track is a transform, not an overflow — a scrolling row leaves a
   scrollbar and a loose feel, and this section is the one place
   the site asks to be believed.

   The couples are shot from behind or in profile. That is the
   point: no faces means no model releases to chase, and it keeps
   the reader imagining themselves in the frame.
   ============================================================ */

const EASE = [0.22, 0.61, 0.36, 1]

/* Five marks, filled to the rating, in gold.

   Gold is the sole warm colour in a silver palette, allowed here
   because a silver star does not read as a rating — it reads as an
   ornament. Muted and antique so it belongs to the same century as
   the rest of the page. */
function Stars({ rating = 5 }) {
  return (
    <span
      className="flex items-center gap-1"
      role="img"
      aria-label={`امتیاز ${toFa(rating)} از ${toFa(5)}`}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <svg
          key={i}
          aria-hidden
          viewBox="0 0 24 24"
          className={`h-3.5 w-3.5 ${i < rating ? 'text-gold' : 'text-line'}`}
          fill={i < rating ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={i < rating ? 0 : 1.5}
        >
          <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </span>
  )
}

/* Every card is the same width by construction (the track sets it)
   and the same height by `h-full` down the chain: slide → Reveal →
   figure. The photograph is a fixed ratio and the quote takes the
   slack, so a two-line quote and a five-line quote still end on the
   same baseline. */
function QuoteCard({ item, index, reduce }) {
  const [ref, shown] = useReveal()
  // Stagger across a row, not across the whole set: the carousel can
  // start on card five, and a 0.4s delay on the first thing you see
  // reads as the page hanging.
  const step = (index % 3) * 0.08

  return (
    <Reveal shown={shown} delay={step} className="h-full">
      <figure
        ref={ref}
        className="group flex h-full flex-col border border-line bg-surface shadow-soft transition-[box-shadow,transform] duration-300 ease-[cubic-bezier(.22,.61,.36,1)] hover:-translate-y-1 hover:shadow-lift"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-line/25">
          <img
            src={img(item.photo)}
            alt={item.alt}
            loading="lazy"
            decoding="async"
            className="photo-cool h-full w-full object-cover transition-transform duration-300 ease-[cubic-bezier(.22,.61,.36,1)] group-hover:scale-[1.04]"
          />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface/55 to-transparent" />
        </div>

        <div className="flex flex-1 flex-col p-6 sm:p-7">
          {/* Oversized, low-contrast quotation mark — the accent, not a badge */}
          <span aria-hidden className="block font-display text-5xl leading-[0.6] text-accent/45">
            ”
          </span>

          <blockquote className="mt-4 flex-1 leading-loose text-ink">{item.quote}</blockquote>

          {/* Name reads first; the rating sits opposite it, where a
              guest book would carry the date — present, not shouted. */}
          <figcaption className="mt-6 flex items-end justify-between gap-4 border-t border-line pt-5">
            <div>
              <p className="text-ink">{item.name}</p>
              <p className="mt-1 text-sm text-muted">{item.meta}</p>
            </div>
            <Stars rating={item.rating} />
          </figcaption>
        </div>

        {/* Accent rule draws itself from the inline-start (right) edge */}
        <motion.span
          aria-hidden
          className="h-px w-full origin-right bg-accent"
          initial={{ scaleX: reduce ? 1 : 0 }}
          animate={{ scaleX: reduce || shown ? 1 : 0 }}
          transition={{ duration: reduce ? 0 : 0.9, delay: reduce ? 0 : 0.2 + step, ease: [0.65, 0, 0.35, 1] }}
        />
      </figure>
    </Reveal>
  )
}

/* Breakpoints matched to the slide widths set on the track below.
   Read once and on resize rather than guessed, because the page
   count — and therefore where the arrows switch off — depends on
   how many cards are actually on screen. */
function usePerView() {
  const [perView, setPerView] = useState(3)

  useEffect(() => {
    const read = () =>
      setPerView(
        window.matchMedia('(min-width: 1024px)').matches
          ? 3
          : window.matchMedia('(min-width: 640px)').matches
            ? 2
            : 1,
      )
    read()
    window.addEventListener('resize', read)
    return () => window.removeEventListener('resize', read)
  }, [])

  return perView
}

function Carousel({ items, reduce }) {
  const trackRef = useRef(null)
  const perView = usePerView()
  const [index, setIndex] = useState(0)
  const [step, setStep] = useState(0)

  const maxIndex = Math.max(0, items.length - perView)

  /* A card plus one gap, measured rather than assumed — the slide
     width is a calc() that changes at every breakpoint. */
  useEffect(() => {
    const measure = () => {
      const el = trackRef.current
      const first = el?.children[0]
      if (!first) return
      const gap = parseFloat(getComputedStyle(el).columnGap || '0') || 0
      setStep(first.getBoundingClientRect().width + gap)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [perView])

  // Narrowing the viewport can leave the track parked past its end.
  useEffect(() => setIndex((i) => Math.min(i, maxIndex)), [maxIndex])

  /* The only direction-aware line in the component. In RTL the first
     card sits at the right edge and later cards run leftward, so
     advancing moves the track in +X; in LTR it is −X. */
  const rtl = typeof document !== 'undefined' && document.dir === 'rtl'
  const offset = index * step * (rtl ? 1 : -1)

  const arrow =
    'absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-line bg-surface/95 text-lg text-ink shadow-soft backdrop-blur-sm transition-all duration-300 ease-[cubic-bezier(.22,.61,.36,1)] hover:border-accent-deep hover:bg-surface hover:text-accent-deep disabled:pointer-events-none disabled:opacity-0'

  return (
    <div className="relative">
      {/* The viewport clips the track. py-3/-my-3 gives the cards'
          hover lift and shadow somewhere to go — overflow-hidden
          clips both axes, so without it the shadow is sheared off. */}
      <div className="-my-3 overflow-hidden py-3">
        <div
          ref={trackRef}
          className="flex items-stretch gap-6 lg:gap-8"
          style={{
            transform: `translateX(${offset}px)`,
            transition: reduce ? 'none' : 'transform 800ms cubic-bezier(0.22, 0.61, 0.36, 1)',
          }}
        >
          {items.map((item, i) => (
            <div
              key={item.name}
              className="w-full shrink-0 sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-4rem)/3)]"
              aria-hidden={i < index || i >= index + perView}
            >
              <QuoteCard item={item} index={i} reduce={reduce} />
            </div>
          ))}
        </div>
      </div>

      {/* Two arrows, centred on the cards and sitting half outside the
          track. RTL: → steps back toward the first card, ← forward. */}
      <button
        type="button"
        onClick={() => setIndex((i) => Math.max(0, i - 1))}
        disabled={index === 0}
        aria-label="نظرات پیشین"
        className={`${arrow} right-0 translate-x-1/2`}
      >
        <span aria-hidden>→</span>
      </button>

      <button
        type="button"
        onClick={() => setIndex((i) => Math.min(maxIndex, i + 1))}
        disabled={index >= maxIndex}
        aria-label="نظرات بعدی"
        className={`${arrow} left-0 -translate-x-1/2`}
      >
        <span aria-hidden>←</span>
      </button>
    </div>
  )
}

export default function Testimonials() {
  const reduce = useReducedMotion()

  return (
    <section
      id="testimonials"
      className="relative isolate overflow-hidden bg-base bg-cover bg-center py-24 sm:py-32"
      style={{ backgroundImage: `url(${img('testimonialsBg')})` }}
    >
      {/* The hall itself, held far enough back that the cards stay
          legible. The scrim is the page ground, not black — the
          section has to belong to the same silver family. */}
      <div className="pointer-events-none absolute inset-0 bg-base/70" />

      {/* Services grid above, inquiry panel below — two different
          grounds, so two different fades. */}
      <div className="band-edge band-edge-top band-color-base" />
      <div className="band-edge band-edge-bottom band-color-panel" />

      <Container className="relative">
        <SectionTitle
          eyebrow={testimonials.eyebrow}
          title={testimonials.title}
          intro={testimonials.intro}
        />

        <div className="mt-14 sm:mt-20">
          <Carousel items={testimonials.items} reduce={reduce} />
        </div>
      </Container>
    </section>
  )
}
