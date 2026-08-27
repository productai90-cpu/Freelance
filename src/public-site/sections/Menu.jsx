import Reveal from '../../components/Reveal.jsx'
import { Container, SectionTitle } from '../../components/Section.jsx'
import { menu } from '../../data/content.js'
import textureImg from '../../assets/images/texture.webp'

/* ============================================================
   MENU — deliberately price-free.

   Halls don't want rates public (tax and competitive reasons), and
   the absence doubles as the lead mechanism: the full menu is the
   reason to fill in the inquiry form. Nothing here imports pricing.
   ============================================================ */

export default function Menu() {
  return (
    <section id="menu" className="relative overflow-hidden bg-cream py-24 sm:py-32">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply"
        style={{ backgroundImage: `url(${textureImg})`, backgroundSize: '900px' }}
      />

      <Container className="relative">
        <SectionTitle eyebrow={menu.eyebrow} title={menu.title} intro={menu.intro} />

        <div className="mt-16 grid gap-x-16 gap-y-14 sm:mt-20 sm:grid-cols-2">
          {menu.categories.map((cat, i) => (
            <Reveal key={cat.title} delay={i * 0.08}>
              <div>
                <div className="flex items-baseline gap-4">
                  <h3 className="font-display text-xl font-normal text-ink">{cat.title}</h3>
                  <span className="hairline-brass flex-1" />
                </div>

                <ul className="mt-6 space-y-3.5">
                  {cat.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-text">
                      <span className="mt-[0.7em] h-1 w-1 shrink-0 rounded-full bg-brass/70" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        {/* The absence of prices, turned into the call to action */}
        <Reveal delay={0.1}>
          <div className="mx-auto mt-20 max-w-2xl border border-brass/30 bg-ivory/60 px-8 py-9 text-center backdrop-blur-sm">
            <p className="leading-loose text-text">{menu.note}</p>
            <a
              href="#inquiry"
              className="group relative mt-7 inline-block overflow-hidden border border-brass/70 px-8 py-3 text-sm text-ink transition-colors duration-300 hover:text-ivory"
            >
              <span className="absolute inset-0 origin-right scale-x-0 bg-brass transition-transform duration-500 ease-[cubic-bezier(.65,0,.35,1)] group-hover:scale-x-100" />
              <span className="relative">دریافت منوی کامل</span>
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
