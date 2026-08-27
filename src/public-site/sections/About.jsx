import Reveal from '../../components/Reveal.jsx'
import { Container, SectionTitle } from '../../components/Section.jsx'
import { about } from '../../data/content.js'
import textureImg from '../../assets/images/texture.webp'

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-ivory py-24 sm:py-32">
      {/* Marble texture, barely there — gives the ivory a material quality */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `url(${textureImg})`,
          backgroundSize: '760px',
          maskImage: 'radial-gradient(70% 60% at 50% 40%, #000 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(70% 60% at 50% 40%, #000 0%, transparent 100%)',
        }}
      />

      <Container className="relative">
        <SectionTitle eyebrow={about.eyebrow} title={about.title} />

        <div className="mx-auto mt-14 max-w-3xl space-y-6">
          {about.body.map((p, i) => (
            <Reveal key={i} delay={0.08 + i * 0.08}>
              <p className="text-center leading-loose text-text sm:text-lg">{p}</p>
            </Reveal>
          ))}
        </div>

        {/* Figures, separated by hairlines rather than boxed in cards */}
        <div className="mt-20 grid grid-cols-2 gap-y-12 sm:mt-24 lg:grid-cols-4">
          {about.stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              {/* border-s = inline-start, which resolves to the RIGHT in
                  RTL. Physical border-l would put dividers on the wrong
                  side of each figure. */}
              <div
                className={`px-4 text-center ${i % 2 === 1 ? 'border-s border-vein' : ''} ${
                  i > 0 ? 'lg:border-s lg:border-vein' : ''
                }`}
              >
                <p className="num font-display text-3xl font-light text-brass sm:text-4xl">
                  {s.value}
                </p>
                <p className="mt-2 text-sm text-muted">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
