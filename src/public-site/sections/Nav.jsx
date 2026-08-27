import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { hall } from '../../config.js'
import Monogram from '../../components/Monogram.jsx'

/* ============================================================
   NAV — two states.

   Over the hero: a full-height rail down the left edge. Numbers at
   the top, section links at the bottom, generous space between, set
   faint so the photograph stays the subject.

   Once scrolled past the hero it collapses to a plain horizontal
   bar — wordmark on the right, numbers on the left, no links. The
   page itself is the navigation from that point on.
   ============================================================ */

const LINKS = [
  { href: '#about', label: 'دربارهٔ ما' },
  { href: '#gallery', label: 'گالری' },
  { href: '#menu', label: 'پذیرایی' },
  { href: '#services', label: 'خدمات' },
  { href: '#inquiry', label: 'استعلام' },
]

const EASE = [0.22, 0.61, 0.36, 1]

/* Hero lighting switch. Sits directly under the last section link in
   both menus — the rail on desktop, the sheet on mobile — because it
   changes the hero and the hero is what you are looking at when the
   menu is open. Quiet by default, accent dot when the lighting is on. */
function LightingSwitch({ variant, onToggle, className = '', dotClass = '' }) {
  const on = variant === 'beams'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className={className}
    >
      <span
        aria-hidden
        className={`inline-block h-1 w-1 rounded-full align-middle transition-colors duration-300 ${
          on ? 'bg-accent' : 'bg-current opacity-40'
        } ${dotClass}`}
      />
      نورپردازی
    </button>
  )
}

export default function Nav({ heroVariant, onToggleHero }) {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.72)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const numberCls = (dim) =>
    `num inline-block text-left text-[11px] font-light leading-[2] transition-colors duration-300 ${
      dim ? 'text-surface/45 hover:text-surface/90' : 'text-muted hover:text-accent'
    }`

  return (
    <>
      {/* ——— Top bar: wordmark always, numbers only once scrolled ——— */}
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-[420ms] ease-[cubic-bezier(.22,.61,.36,1)] ${
          solid
            ? 'border-b border-line bg-surface/92 backdrop-blur-md'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-4 sm:px-10">
          <a href="#top" className="flex items-center gap-2.5">
            <Monogram size={solid ? 30 : 34} tone={solid ? 'dark' : 'light'} />
            <span
              className={`font-display font-light transition-all duration-[420ms] ${
                solid ? 'text-xl text-ink' : 'text-2xl text-surface'
              }`}
            >
              {hall.name}
            </span>
          </a>

          <AnimatePresence>
            {solid && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.32, ease: EASE }}
                className="hidden flex-col items-start md:flex"
              >
                <a href={`tel:${hall.phoneHref}`} dir="ltr" className={numberCls(false)}>
                  {hall.phone}
                </a>
                <a href={`tel:${hall.mobileHref}`} dir="ltr" className={numberCls(false)}>
                  {hall.mobile}
                </a>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile trigger */}
          <button
            onClick={() => setOpen(true)}
            aria-label="باز کردن منو"
            className={`flex h-9 w-9 flex-col items-center justify-center gap-[5px] md:hidden ${
              solid ? 'text-ink' : 'text-surface'
            }`}
          >
            <span className="block h-px w-6 bg-current" />
            <span className="block h-px w-6 bg-current" />
          </button>
        </div>
      </header>

      {/* ——— Full-height rail, over the hero only ——— */}
      <AnimatePresence>
        {!solid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.42, ease: EASE }}
            className="pointer-events-none fixed left-0 top-0 z-40 hidden h-[100svh] flex-col justify-between px-6 py-16 sm:px-10 md:flex"
          >
            {/* Top — numbers */}
            <div className="pointer-events-auto flex flex-col pt-6">
              <motion.a
                href={`tel:${hall.phoneHref}`}
                dir="ltr"
                className={numberCls(true)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.75, ease: EASE }}
              >
                {hall.phone}
              </motion.a>
              <motion.a
                href={`tel:${hall.mobileHref}`}
                dir="ltr"
                className={numberCls(true)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.85, ease: EASE }}
              >
                {hall.mobile}
              </motion.a>
            </div>

            {/* Bottom — section links, spaced and faint */}
            <nav className="pointer-events-auto flex flex-col gap-[7px] pb-4">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 1.95 + i * 0.07, ease: EASE }}
                  className="text-[13px] font-light leading-[1.7] text-surface/45 transition-colors duration-300 hover:text-surface/90"
                >
                  {l.label}
                </motion.a>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.95 + LINKS.length * 0.07, ease: EASE }}
                className="mt-3 border-t border-surface/15 pt-3"
              >
                <LightingSwitch
                  variant={heroVariant}
                  onToggle={onToggleHero}
                  className="flex items-center gap-2 text-[13px] font-light leading-[1.7] text-surface/45 transition-colors duration-300 hover:text-surface/90"
                />
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ——— Mobile sheet ——— */}
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
              <span className="flex items-center gap-2.5">
                <Monogram size={30} tone="light" />
                <span className="font-display text-xl font-light text-surface">{hall.name}</span>
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="بستن منو"
                className="relative h-9 w-9 text-surface"
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
                  className="border-b border-surface/10 py-5 font-display text-2xl font-light text-surface"
                >
                  {l.label}
                </motion.a>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + LINKS.length * 0.06, duration: 0.4 }}
              >
                <LightingSwitch
                  variant={heroVariant}
                  onToggle={onToggleHero}
                  className="flex w-full items-center gap-3 border-b border-surface/10 py-5 font-display text-2xl font-light text-surface/70 transition-colors duration-300 hover:text-surface"
                  dotClass="h-1.5 w-1.5"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48, duration: 0.4 }}
                className="mt-10 flex flex-col gap-3"
              >
                <a
                  href={`tel:${hall.phoneHref}`}
                  dir="ltr"
                  className="num border border-accent/60 py-3.5 ps-4 text-left text-surface"
                >
                  {hall.phone}
                </a>
                <a
                  href={`tel:${hall.mobileHref}`}
                  dir="ltr"
                  className="num border border-accent/60 py-3.5 ps-4 text-left text-surface"
                >
                  {hall.mobile}
                </a>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
