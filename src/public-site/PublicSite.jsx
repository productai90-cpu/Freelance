import Nav from './sections/Nav.jsx'
import Hero from './sections/Hero.jsx'
import About from './sections/About.jsx'
import Gallery from './sections/Gallery.jsx'
import Menu from './sections/Menu.jsx'
import Services from './sections/Services.jsx'
import Testimonials from './sections/Testimonials.jsx'
import Inquiry from './sections/Inquiry.jsx'
import Footer from './sections/Footer.jsx'
import ScrollProgress from '../components/ScrollProgress.jsx'

/* PUBLIC SITE — branding and lead capture only.

   Deliberately imports nothing from ../admin and nothing price-related.
   Prices, contracts, deposits and availability exist only behind
   «ورود مدیر». */

export default function PublicSite() {
  return (
    <div id="top">
      <ScrollProgress />
      <Nav />
      <main>
        <Hero />
        <About />
        <Gallery />
        <Menu />
        <Services />
        <Testimonials />
        <Inquiry />
      </main>
      <Footer />
    </div>
  )
}
