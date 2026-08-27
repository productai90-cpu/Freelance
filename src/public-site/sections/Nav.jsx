import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { hall } from '../../config.js'

const LINKS = [
  { href: '#about', label: 'دربارهٔ ما' },
  { href: '#gallery', label: 'گالری' },
  { href: '#menu', label: 'پذیرایی' },
  { href: '#services', label: 'خدمات' },
  { href: '#inquiry', label: 'استعلام' },
]

export default function Nav() {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock the page while the mobile sheet is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-[320ms] ease-[cubic-bezier(.22,.61,.36,1)] ${
          solid
            ? 'border-b border-vein bg-ivory/90 backdrop-blur-md'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-4 sm:px-10">
          <a
            href="#top"
            className={`font-display text-xl font-light transition-all duration-300 ${
              solid ? 'text-ink' : 'text-ivory'
            }`}
          >
            {hall.name}
          </a>

          <nav className="hidden items-center gap-9 md:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`relative py-1 text-sm transition-colors duration-300 ${
                  solid ? 'text-muted hover:text-ink' : 'text-ivory/80 hover:text-ivory'
                }`}
              >
                {l.label}
              </a>
            ))}
            <a
              href={`tel:${hall.phoneHref}`}
              className={`num border px-5 py-2 text-sm transition-colors duration-300 ${
                solid
                  ? 'border-brass/60 text-ink hover:bg-brass hover:text-ivory'
                  : 'border-ivory/40 text-ivory hover:border-brass hover:bg-brass hover:text-ink'
              }`}
            >
              {hall.phone}
            </a>
          </nav>

          {/* Mobile trigger */}
          <button
            onClick={() => setOpen(true)}
            aria-label="باز کردن منو"
            className={`flex h-9 w-9 flex-col items-center justify-center gap-[5px] md:hidden ${
              solid ? 'text-ink' : 'text-ivory'
            }`}
          >
            <span className="block h-px w-6 bg-current" />
            <span className="block h-px w-6 bg-current" />
          </button>
        </div>
      </header>

      {/* Mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            className="fixed inset-0 z-50 bg-ink md:hidden"
          >
            <div className="flex items-center justify-between px-6 py-4">
              <span className="font-display text-xl font-light text-ivory">{hall.name}</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="بستن منو"
                className="relative h-9 w-9 text-ivory"
              >
                <span className="absolute left-1/2 top-1/2 block h-px w-6 -translate-x-1/2 rotate-45 bg-current" />
                <span className="absolute left-1/2 top-1/2 block h-px w-6 -translate-x-1/2 -rotate-45 bg-current" />
              </button>
            </div>

            <nav className="flex flex-col px-6 pt-8">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.06, duration: 0.4 }}
                  className="border-b border-ivory/10 py-5 font-display text-2xl font-light text-ivory"
                >
                  {l.label}
                </motion.a>
              ))}

              <motion.a
                href={`tel:${hall.phoneHref}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, duration: 0.4 }}
                className="num mt-10 border border-brass/60 py-4 text-center text-ivory"
              >
                {hall.phone}
              </motion.a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
