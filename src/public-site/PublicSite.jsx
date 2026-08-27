import { useEffect, useState } from 'react'
import Nav from './sections/Nav.jsx'
import Hero from './sections/Hero.jsx'
import About from './sections/About.jsx'
import Gallery from './sections/Gallery.jsx'
import Menu from './sections/Menu.jsx'
import CelebrationStrip from './sections/CelebrationStrip.jsx'
import Services from './sections/Services.jsx'
import Testimonials from './sections/Testimonials.jsx'
import Inquiry from './sections/Inquiry.jsx'
import Footer from './sections/Footer.jsx'
import ScrollProgress from '../components/ScrollProgress.jsx'
import { installAnchorScroll } from '../lib/scrollToSection.js'

/* PUBLIC SITE — branding and lead capture only.

   Deliberately imports nothing from ../admin and nothing price-related.
   Prices, contracts, deposits and availability live only behind the
   `#/admin` route, which this site never links to. */

export default function PublicSite() {
  /* The photograph is the default hero; the lighting is opt-in from
     the menu switch. Kept here rather than inside Hero because Nav
     owns the control and Hero owns the render. */
  const [heroVariant, setHeroVariant] = useState('photo')
  const toggleHero = () => setHeroVariant((v) => (v === 'beams' ? 'photo' : 'beams'))

  // Lazy images shift the page while a long anchor scroll is running,
  // so the destination has to be re-measured on the way down.
  useEffect(installAnchorScroll, [])

  return (
    <div id="top">
      <ScrollProgress />
      <Nav heroVariant={heroVariant} onToggleHero={toggleHero} />

      <main>
        <Hero variant={heroVariant} />
        <About />
        <Gallery />
        <Menu />
        <CelebrationStrip />
        <Services />
        <Testimonials />
        <Inquiry />
      </main>
      <Footer />
    </div>
  )
}

