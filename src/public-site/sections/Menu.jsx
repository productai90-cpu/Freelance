import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Reveal from '../../components/Reveal.jsx'
import { Container, SectionTitle } from '../../components/Section.jsx'
import useReveal from '../../lib/useReveal.js'
import { DrawnIcon } from '../../components/ServiceIcons.jsx'
import { menu } from '../../data/content.js'
import { img } from '../../data/images.js'
import textureImg from '../../assets/images/texture.webp'

/* ============================================================
   MENU — three packages, and deliberately price-free.

   Halls don't want rates public (tax and competitive reasons), and
   the absence doubles as the lead mechanism. What changed here is
   the SHAPE, not the policy: a twenty-line wall of dish names asked
   the visitor to read everything to learn anything. Three cards ask
   them to pick a register first — رومیزی، ویژه، یا ایستگاهی — and
   only then read the detail, in a lightbox, at their own pace.

   Nothing in this file imports pricing.
   ============================================================ */

const EASE = [0.22, 0.61, 0.36, 1]

/* ------------------------------------------------------------
   CARD — the promise
   ------------------------------------------------------------ */

function PackageCard({ pk, index, onOpen, reduce }) {
  const [ref, shown] = useReveal()
  // Stagger across the row of three, and let the plate icon draw off
  // the CARD rather than off an observer of its own — a 56px badge
  // near the card's top clears the fold long before the card does.
  const step = (index % 3) * 0.08

  return (
    <Reveal shown={shown} delay={step}>
      <button
        ref={ref}
        type="button"
        onClick={() => onOpen(pk)}
        aria-haspopup="dialog"
        aria-label={`منوی کامل ${pk.name}`}
        className="group relative flex h-full w-full flex-col overflow-hidden border border-line bg-surface text-right shadow-soft transition-[box-shadow,transform] duration-300 ease-[cubic-bezier(.22,.61,.36,1)] hover:-translate-y-1 hover:shadow-lift focus-visible:-translate-y-1"
      >
        {/* Photograph — the only warm thing on the card */}
        <span className="relative block aspect-[5/4] overflow-hidden bg-line/25">
          <img
            src={img(pk.image)}
            alt={pk.alt}
            loading="lazy"
            decoding="async"
            className="photo-cool h-full w-full object-cover transition-transform duration-300 ease-[cubic-bezier(.22,.61,.36,1)] group-hover:scale-[1.05]"
          />
          <span className="pointer-events-none absolute inset-0 bg-accent/0 transition-colors duration-300 group-hover:bg-accent/10" />

          {pk.badge && (
            <span className="absolute right-4 top-4 bg-surface/95 px-3 py-1.5 text-[11px] text-accent-deep shadow-soft backdrop-blur-sm">
              {pk.badge}
            </span>
          )}
        </span>

        <span className="flex flex-1 flex-col p-6 sm:p-7">
          {/* Icon plate straddles the photo edge, tying image to text.
              It lives in the body, not in the image: the image span
              clips its overflow, and an absolutely-placed plate there
              loses the half that does the straddling.

              `relative z-10` is load-bearing. The photo span above is
              positioned, so it paints in a later layer than a static
              sibling's contents — without this the top half of the
              plate disappears behind the photograph and the icon comes
              out sheared. The negative margin is padding minus half the
              plate (24-52, 28-56), which is what puts the edge through
              its middle at both paddings. */}
          <span className="relative z-10 -mt-13 mb-5 flex h-14 w-14 items-center justify-center border border-line bg-surface sm:-mt-14">
            <DrawnIcon
              name={pk.icon}
              delay={0.2 + step}
              reduce={reduce}
              trigger={shown ? 'now' : 'hold'}
              className="h-7 w-7 text-accent-deep transition-transform duration-300 group-hover:scale-110"
            />
          </span>

          <span className="block font-display text-xl font-normal text-ink">{pk.name}</span>
          <span className="mt-1.5 block text-sm text-accent-deep">{pk.tag}</span>

          <span className="mt-5 block text-sm leading-relaxed text-muted">{pk.summary}</span>

          <span className="hairline my-6 block" />

          <span className="block space-y-2.5">
            {pk.highlights.map((h) => (
              <span key={h} className="flex items-start gap-2.5 text-sm text-ink">
                <span className="mt-[0.72em] h-1 w-1 shrink-0 rounded-full bg-accent" />
                <span className="leading-relaxed">{h}</span>
              </span>
            ))}
          </span>

          {/* Affordance, pinned to the bottom so all three cards agree */}
          <span className="mt-auto flex items-center gap-2 pt-7 text-sm text-accent-deep">
            <span>مشاهدهٔ منوی کامل</span>
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 ease-[cubic-bezier(.22,.61,.36,1)] group-hover:-translate-x-1.5"
            >
              ←
            </span>
          </span>
        </span>

        {/* Accent rule grows from the inline-start (right) edge */}
        <span className="absolute bottom-0 right-0 h-px w-0 bg-accent transition-all duration-300 ease-[cubic-bezier(.65,0,.35,1)] group-hover:w-full" />
      </button>
    </Reveal>
  )
}

/* ------------------------------------------------------------
   LIGHTBOX — the detail
   ------------------------------------------------------------ */

function GroupBlock({ group, index, reduce }) {
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.16 + index * 0.06, ease: EASE }}
      className="break-inside-avoid"
    >
      <div className="flex items-center gap-3">
        <DrawnIcon
          name={group.icon}
          trigger="now"
          delay={0.24 + index * 0.06}
          reduce={reduce}
          className="h-6 w-6 shrink-0 text-accent-deep"
        />
        <h4 className="font-display text-base font-normal text-ink">{group.title}</h4>
        <span className="hairline flex-1" />
      </div>

      {group.note && <p className="mt-2.5 text-xs leading-relaxed text-accent-deep">{group.note}</p>}

      <ul className="mt-3.5 space-y-2.5">
        {group.items.map((item) => (
          <li key={item.name} className="flex items-start gap-2.5">
            <span className="mt-[0.72em] h-1 w-1 shrink-0 rounded-full bg-accent" />
            <span className="text-sm leading-relaxed text-ink">
              {item.name}
              {item.note && <span className="text-xs text-muted"> — {item.note}</span>}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

function PackageDialog({ pk, onClose, onDownload, pdfState, reduce }) {
  const panelRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-scrim/90 p-0 backdrop-blur-[2px] sm:items-center sm:p-6 lg:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.26 }}
      onClick={onClose}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`منوی ${pk.name}`}
        tabIndex={-1}
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.99 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="relative w-full max-w-5xl bg-surface shadow-lift outline-none sm:max-h-[92vh] sm:overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن"
          className="absolute left-3 top-3 z-10 flex h-10 w-10 items-center justify-center bg-surface/90 text-ink/70 backdrop-blur-sm transition-colors duration-300 hover:text-ink sm:left-4 sm:top-4"
        >
          <span className="absolute h-px w-5 rotate-45 bg-current" />
          <span className="absolute h-px w-5 -rotate-45 bg-current" />
        </button>

        <div className="lg:flex lg:items-start">
          {/* ——— Aside: photography and the facts, sticky on desktop ——— */}
          <aside className="lg:sticky lg:top-0 lg:w-[38%] lg:shrink-0 lg:self-start">
            <div className="relative aspect-[16/9] overflow-hidden bg-line/25 lg:aspect-[4/5]">
              <img
                src={img(pk.image)}
                alt={pk.alt}
                className="photo-cool h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-scrim/45 to-transparent lg:from-scrim/35" />
            </div>

            {/* Two supporting shots — the same table, later in the night.
                Desktop only: on a phone the aside stacks ABOVE the menu,
                and three photos plus a facts row is a full screen of
                scrolling before the reader reaches a single dish. */}
            {pk.thumbs?.length > 0 && (
              <div className="hidden grid-cols-2 gap-px bg-line lg:grid">
                {pk.thumbs.map((key) => (
                  <div key={key} className="aspect-[4/3] overflow-hidden bg-line/25">
                    <img
                      src={img(key)}
                      alt=""
                      loading="lazy"
                      className="photo-cool h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            <dl className="grid grid-cols-3 gap-px border-y border-line bg-line lg:border-b-0">
              {pk.facts.map((f) => (
                <div key={f.label} className="bg-surface px-3 py-4 text-center lg:text-right">
                  <dt className="text-[11px] text-muted">{f.label}</dt>
                  <dd className="mt-1 text-sm text-ink">{f.value}</dd>
                </div>
              ))}
            </dl>
          </aside>

          {/* ——— Main: the menu itself ——— */}
          <div className="flex-1 p-6 sm:p-9 lg:p-10">
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
            >
              <div className="flex items-start gap-4">
                <DrawnIcon
                  name={pk.icon}
                  trigger="now"
                  delay={0.1}
                  reduce={reduce}
                  className="h-10 w-10 shrink-0 text-accent-deep"
                />
                <div>
                  <p className="eyebrow">{pk.tag}</p>
                  <h3 className="mt-1.5 font-display text-2xl font-light text-ink sm:text-3xl">
                    {pk.name}
                  </h3>
                </div>
              </div>

              <p className="mt-5 leading-loose text-muted">{pk.summary}</p>
            </motion.div>

            <div className="mt-9 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {pk.groups.map((g, i) => (
                <GroupBlock key={g.title} group={g} index={i} reduce={reduce} />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-10 border-t border-line pt-7"
            >
              <p className="text-sm leading-loose text-muted">{menu.note}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#inquiry"
                  onClick={onClose}
                  className="bg-ink px-7 py-3 text-sm text-surface transition-colors duration-300 hover:bg-accent-deep"
                >
                  استعلام تاریخ و مشاوره
                </a>
                <button
                  type="button"
                  onClick={onDownload}
                  disabled={pdfState === 'working'}
                  className="border border-line px-7 py-3 text-sm text-ink transition-colors duration-300 hover:border-accent-deep hover:text-accent-deep disabled:opacity-60"
                >
                  {pdfState === 'working'
                    ? menu.pdf.working
                    : pdfState === 'failed'
                      ? menu.pdf.failed
                      : menu.pdf.label}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ------------------------------------------------------------
   SECTION
   ------------------------------------------------------------ */

export default function Menu() {
  const [active, setActive] = useState(null)
  const [pdfState, setPdfState] = useState('idle') // idle | working | failed
  const reduce = useReducedMotion()

  /* The PDF pulls in jsPDF and html2canvas — roughly a quarter of a
     megabyte that a visitor who only reads the cards should never
     pay for. So the import happens here, on the click, not at load. */
  const download = useCallback(async () => {
    setPdfState('working')
    try {
      const { downloadMenuPdf } = await import('../../lib/menuPdf.js')
      await downloadMenuPdf()
      setPdfState('idle')
    } catch (err) {
      console.error('PDF build failed', err)
      setPdfState('failed')
      setTimeout(() => setPdfState('idle'), 4000)
    }
  }, [])

  return (
    <section id="menu" className="relative overflow-hidden bg-surface py-24 sm:py-32">
      {/* Marble ground — the same stone used across the site, so the
          section sits in the palette instead of beside it. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{ backgroundImage: `url(${textureImg})`, backgroundSize: '880px' }}
      />
      <div className="pointer-events-none absolute inset-0 bg-base/35" />

      <Container className="relative">
        <SectionTitle eyebrow={menu.eyebrow} title={menu.title} intro={menu.intro} />

        <Reveal delay={0.24}>
          <p className="mt-5 text-center text-xs text-accent-deep">{menu.hint}</p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:mt-20 lg:grid-cols-3 lg:gap-8">
          {menu.packages.map((pk, i) => (
            <PackageCard key={pk.id} pk={pk} index={i} onOpen={setActive} reduce={reduce} />
          ))}
        </div>

        {/* The absence of prices, turned into the call to action */}
        <Reveal delay={0.1}>
          <div className="mx-auto mt-14 max-w-2xl border border-line bg-surface px-8 py-10 text-center shadow-soft backdrop-blur-sm sm:mt-20">
            <p className="leading-loose text-ink">{menu.note}</p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={download}
                disabled={pdfState === 'working'}
                aria-live="polite"
                className="bg-ink px-8 py-3 text-sm text-surface transition-colors duration-300 hover:bg-accent-deep disabled:opacity-60"
              >
                {pdfState === 'working'
                  ? menu.pdf.working
                  : pdfState === 'failed'
                    ? menu.pdf.failed
                    : menu.pdf.label}
              </button>

              <a
                href="#inquiry"
                className="border border-line px-8 py-3 text-sm text-ink transition-colors duration-300 hover:border-accent-deep hover:text-accent-deep"
              >
                استعلام تاریخ
              </a>
            </div>
          </div>
        </Reveal>
      </Container>

      <AnimatePresence>
        {active && (
          <PackageDialog
            pk={active}
            reduce={reduce}
            pdfState={pdfState}
            onDownload={download}
            onClose={() => setActive(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
