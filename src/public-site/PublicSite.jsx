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
  /* Which hero the visitor lands on, and the switch that changes it.
     Kept here rather than inside Hero because Nav owns the control and
     Hero owns the render.

     The default is per-device. On a desktop the photograph is the
     stronger opening and the lighting is the flourish you turn on. On
     a phone that is reversed: most visitors arrive from Instagram,
     the photograph is cropped hard to a tall frame, and the beams
     read as the more deliberate thing at that size — so the phone
     opens on the lighting and «نورپردازی» turns it off.

     Read once, at mount. A phone does not cross this breakpoint mid-
     visit, and re-deciding on every resize would yank the hero out
     from under anyone who had chosen the other one. */
  const [heroVariant, setHeroVariant] = useState(() =>
    window.matchMedia?.('(max-width: 767px)').matches ? 'beams' : 'photo',
  )
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

