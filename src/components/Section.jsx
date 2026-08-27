import Reveal from './Reveal.jsx'

/** Page container. One max-width for the whole site. */
export function Container({ children, className = '' }) {
  return <div className={`mx-auto w-full max-w-[1200px] px-6 sm:px-10 ${className}`}>{children}</div>
}

/** Hairline rule — the marble-inlay motif. */
export function Hairline({ className = '', brass = false }) {
  return <div className={`${brass ? 'hairline-brass' : 'hairline'} ${className}`} />
}

/**
 * Section heading: brass eyebrow, display title, and a short brass
 * rule beneath. Used identically across every section so the page
 * has one rhythm rather than eight.
 */
export function SectionTitle({ eyebrow, title, intro, align = 'center', dark = false }) {
  const centered = align === 'center'

  return (
    <div className={`${centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}`}>
      {eyebrow && (
        <Reveal>
          <p className="eyebrow mb-4">{eyebrow}</p>
        </Reveal>
      )}

      <Reveal delay={0.06}>
        <h2 className={`fluid-title font-display font-light ${dark ? 'text-ivory' : 'text-ink'}`}>
          {title}
        </h2>
      </Reveal>

      <Reveal delay={0.12}>
        <div
          className={`mt-6 h-px w-16 ${centered ? 'mx-auto' : ''}`}
          style={{ background: 'linear-gradient(90deg, transparent, #C2A575, transparent)' }}
        />
      </Reveal>

      {intro && (
        <Reveal delay={0.18}>
          <p
            className={`mt-6 text-balance leading-loose ${dark ? 'text-muted-lt' : 'text-muted'}`}
          >
            {intro}
          </p>
        </Reveal>
      )}
    </div>
  )
}
