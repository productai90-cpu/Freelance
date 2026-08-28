import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Reveal from '../../components/Reveal.jsx'
import { Container, SectionTitle } from '../../components/Section.jsx'
import { inquiry } from '../../data/content.js'
import textureImg from '../../assets/images/texture.webp'
import { FORM_ENDPOINT, hall, isFormLive } from '../../config.js'
import { useData } from '../../store/DataContext.jsx'
import { MONTHS, dateKey, daysIn, formatKeyLong, today, yearOptions } from '../../lib/jalali.js'
import { toFa } from '../../lib/digits.js'

/* Underlined field — no boxes. Boxes make a luxury page look like a
   form; a rule that lights up accent on focus does not. */
function Field({ label, children }) {
  return (
    <label className="group block">
      {label && (
        <span className="mb-2 block text-sm text-muted transition-colors duration-300 group-focus-within:text-accent">
          {label}
        </span>
      )}
      {children}
      <span className="relative mt-1 block h-px w-full bg-line">
        <span className="absolute inset-y-0 right-1/2 left-1/2 bg-accent transition-all duration-300 ease-[cubic-bezier(.22,.61,.36,1)] group-focus-within:right-0 group-focus-within:left-0" />
      </span>
    </label>
  )
}

/* Selects sit on a tinted well with real padding, so the value never
   touches the edge and the control reads as tappable on a phone. */
function Select({ value, onChange, children, ariaLabel }) {
  return (
    <div className="relative">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={onChange}
        className="w-full cursor-pointer appearance-none truncate rounded-md bg-surface/75 py-3 pe-8 ps-3 text-ink outline-none transition-colors duration-300 hover:bg-surface focus:bg-surface sm:pe-9 sm:ps-4"
      >
        {children}
      </select>
      {/* Chevron sits on the inline-end (left in RTL).

          The padding above must be on the SAME side. It was `ps-9` —
          padding-inline-START, which in RTL is the right edge, i.e.
          the side with nothing on it — while the chevron sat on the
          left behind only `pe-4`. So the value ran straight under the
          arrow. Positioned with the logical `end-3` now, so the two
          cannot drift apart again if direction ever changes. */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        aria-hidden="true"
        className="pointer-events-none absolute end-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
      >
        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

const inputCls =
  'w-full rounded-md bg-surface/75 px-4 py-3 text-ink outline-none transition-colors duration-300 placeholder:text-muted/45 hover:bg-surface focus:bg-surface'

export default function Inquiry() {
  const { addLead } = useData()
  const now = today()

  const blank = { name: '', phone: '', message: '', jy: now.jy, jm: now.jm, jd: now.jd }
  const [form, setForm] = useState(blank)
  const [state, setState] = useState('idle') // idle | sending | done | error
  const [errors, setErrors] = useState({})
  const panelRef = useRef(null)
  const [armed, setArmed] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const reset = () => {
    setState('idle')
    setForm(blank)
    setErrors({})
  }

  /* The confirmation is a dialog over the page now, not a panel
     swapped into the section.

     Inside the section it inherited the section. It sat wherever the
     form had been, so on a phone it opened below the fold as often as
     not; and being a few hundred pixels shorter than the form it
     replaced, it collapsed the document the moment it appeared and
     dropped the reader onto the footer. Both were treated here — a
     measured height pinned across the swap, a scroll nudged after it.
     Neither is needed once the message stops being part of the flow:
     the page behind it holds still because it is untouched.

     Dismissal is a click anywhere on the backdrop, armed a beat late.
     The tap that submitted the form must not be allowed to land on a
     scrim that did not exist when the finger went down. */
  useEffect(() => {
    if (state !== 'done') return

    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    const onKey = (e) => e.key === 'Escape' && reset()
    document.addEventListener('keydown', onKey)
    const arm = setTimeout(() => setArmed(true), 500)

    return () => {
      clearTimeout(arm)
      setArmed(false)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [state])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'نام خود را وارد کنید.'
    const digits = form.phone.replace(/[^\d۰-۹]/g, '')
    if (digits.length < 10) e.phone = 'شمارهٔ تماس معتبر نیست.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (state === 'sending') return
    if (!validate()) return

    setState('sending')
    const date = dateKey(+form.jy, +form.jm, +form.jd)

    // 1. File the lead locally FIRST. The demo must never depend on a
    //    third-party service being reachable.
    addLead({
      name: form.name.trim(),
      phone: form.phone.trim(),
      message: form.message.trim(),
      date,
    })

    // 2. Then attempt real delivery, if an endpoint is configured.
    if (!isFormLive) {
      setTimeout(() => setState('done'), 550)
      return
    }

    try {
      const body = new FormData()
      body.append('نام', form.name.trim())
      body.append('تلفن', form.phone.trim())
      body.append('تاریخ مورد نظر', formatKeyLong(date))
      body.append('پیام', form.message.trim())
      body.append('_subject', `استعلام جدید — ${hall.fullName}`)

      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body,
      })
      setState(res.ok ? 'done' : 'error')
    } catch {
      setState('error')
    }
  }

  return (
    <section id="inquiry" className="relative overflow-hidden bg-surface py-24 sm:py-32">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{ backgroundImage: `url(${textureImg})`, backgroundSize: '880px' }}
      />
      <div className="pointer-events-none absolute inset-0 bg-base/35" />
      <Container className="relative">
        <SectionTitle eyebrow={inquiry.eyebrow} title={inquiry.title} intro={inquiry.intro} />

        <Reveal delay={0.1}>
          <div
            /* Where an anchor scroll to #inquiry should actually land.
               The heading above is context; the form is the errand. */
            data-scroll-anchor
            className="mx-auto mt-14 max-w-2xl sm:mt-20"
          >
            <form
              onSubmit={onSubmit}
              className="space-y-8 border border-line bg-surface p-8 shadow-soft sm:p-12"
              noValidate
            >
              {/* Honeypot — a widely-shared public link attracts bots,
                  and the free Formspree quota is small. */}
              <input
                type="text"
                name="_gotcha"
                tabIndex={-1}
                autoComplete="off"
                className="absolute h-0 w-0 opacity-0"
                aria-hidden="true"
              />

              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <Field label="نام و نام خانوادگی">
                    <input
                      className={inputCls}
                      value={form.name}
                      onChange={set('name')}
                      placeholder="مثلاً سارا محمدی"
                      autoComplete="name"
                    />
                  </Field>
                  {errors.name && <p className="mt-2 text-xs text-danger">{errors.name}</p>}
                </div>

                <div>
                  <Field label="شمارهٔ تماس">
                    <input
                      className={`${inputCls} num text-left`}
                      value={form.phone}
                      onChange={set('phone')}
                      placeholder="0911 000 00 00"
                      inputMode="tel"
                      autoComplete="tel"
                      dir="ltr"
                    />
                  </Field>
                  {errors.phone && <p className="mt-2 text-xs text-danger">{errors.phone}</p>}
                </div>
              </div>

              {/* Jalali date picker — three padded selects, no Gregorian */}
              <div>
                <span className="mb-2 block text-sm text-muted">تاریخ مورد نظر</span>
                {/* Unequal columns on purpose. Three equal thirds
                    gave the month the same width as the day, and
                    «اردیبهشت» is eight characters against one —
                    it was being clipped to «اردی» on a phone. */}
                <div className="grid grid-cols-[0.8fr_1.5fr_1fr] gap-2 sm:grid-cols-3 sm:gap-4">
                  <Select value={form.jd} onChange={set('jd')} ariaLabel="روز">
                    {daysIn(+form.jy, +form.jm).map((d) => (
                      <option key={d} value={d}>
                        {toFa(d)}
                      </option>
                    ))}
                  </Select>
                  <Select value={form.jm} onChange={set('jm')} ariaLabel="ماه">
                    {MONTHS.map((m, idx) => (
                      <option key={m} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </Select>
                  <Select value={form.jy} onChange={set('jy')} ariaLabel="سال">
                    {yearOptions(3).map((y) => (
                      <option key={y} value={y}>
                        {toFa(y)}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <Field label="پیام (اختیاری)">
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={3}
                  value={form.message}
                  onChange={set('message')}
                  placeholder="تعداد تقریبی مهمانان، نوع مراسم، یا هر نکتهٔ دیگر"
                />
              </Field>

              <div className="flex flex-col items-center gap-5 pt-2 sm:flex-row-reverse sm:justify-between">
                <button
                  type="submit"
                  disabled={state === 'sending'}
                  className="w-full bg-ink px-10 py-4 text-sm text-surface transition-colors duration-300 hover:bg-accent-deep disabled:opacity-60 sm:w-auto"
                >
                  <span className="flex items-center justify-center gap-3">
                    {state === 'sending' && (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border border-surface border-t-transparent" />
                    )}
                    {state === 'sending' ? 'در حال ارسال…' : 'ارسال استعلام'}
                  </span>
                </button>

                <p className="text-center text-xs leading-relaxed text-muted sm:text-right">
                  یا مستقیم تماس بگیرید:{' '}
                  <a
                    href={`tel:${hall.phoneHref}`}
                    dir="ltr"
                    className="num inline-block border-b border-accent/40 pb-px text-ink transition-colors duration-300 hover:border-accent"
                  >
                    {hall.phone}
                  </a>
                </p>
              </div>

              {state === 'error' && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="border-s-2 border-danger bg-danger-lt py-3 pe-4 ps-4 text-sm leading-relaxed text-ink"
                >
                  ارسال با خطا مواجه شد. لطفاً با شمارهٔ{' '}
                  <a
                    href={`tel:${hall.phoneHref}`}
                    dir="ltr"
                    className="num inline-block text-danger underline"
                  >
                    {hall.phone}
                  </a>{' '}
                  تماس بگیرید.
                </motion.p>
              )}
            </form>
          </div>
        </Reveal>
      </Container>

      {/* ——— Confirmation, over the page ——— */}
      <AnimatePresence>
        {state === 'done' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.26 }}
            onClick={() => armed && reset()}
            className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-scrim/90 p-6 backdrop-blur-[2px]"
          >
            <motion.div
              ref={panelRef}
              role="status"
              aria-live="polite"
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.99 }}
              transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
              className="my-auto w-full max-w-md border border-success/25 bg-success-lt p-8 py-12 text-center shadow-lift outline-none sm:p-12"
            >
              {/* Semantic green — success, and only success */}
              <svg
                viewBox="0 0 48 48"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                className="mx-auto h-14 w-14 text-success"
              >
                <motion.circle
                  cx="24"
                  cy="24"
                  r="21"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.7, ease: 'easeInOut' }}
                />
                <motion.path
                  d="M15 24.5 21.5 31 33 18"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.45, delay: 0.45, ease: 'easeInOut' }}
                />
              </svg>

              <h3 className="mt-6 font-display text-2xl font-light text-ink">
                استعلام شما ثبت شد
              </h3>
              <p className="mt-3 leading-loose text-muted">
                همکاران ما در کمتر از ۲۴ ساعت با شما تماس می‌گیرند.
              </p>

              <button
                type="button"
                onClick={reset}
                className="mt-8 text-xs text-muted/70 underline-offset-4 transition-colors duration-300 hover:text-ink hover:underline"
              >
                بازگشت به سایت
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
