import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Reveal from '../../components/Reveal.jsx'
import { Container, SectionTitle } from '../../components/Section.jsx'
import { inquiry } from '../../data/content.js'
import { FORM_ENDPOINT, hall, isFormLive } from '../../config.js'
import { useData } from '../../store/DataContext.jsx'
import { MONTHS, dateKey, daysIn, formatKeyLong, today, yearOptions } from '../../lib/jalali.js'
import { toFa } from '../../lib/digits.js'

/* Underlined field — no boxes. Boxes make a luxury page look like a
   form; a rule that lights up brass on focus does not. */
function Field({ label, children }) {
  return (
    <label className="group block">
      <span className="mb-2 block text-sm text-muted transition-colors group-focus-within:text-brass">
        {label}
      </span>
      {children}
      <span className="relative mt-1 block h-px w-full bg-vein">
        <span className="absolute inset-y-0 right-1/2 left-1/2 bg-brass transition-all duration-300 ease-[cubic-bezier(.22,.61,.36,1)] group-focus-within:right-0 group-focus-within:left-0" />
      </span>
    </label>
  )
}

const inputCls =
  'w-full bg-transparent pb-2 text-ink outline-none placeholder:text-muted/50'
const selectCls =
  'w-full appearance-none bg-transparent pb-2 text-ink outline-none cursor-pointer'

export default function Inquiry() {
  const { addLead } = useData()
  const now = today()

  const [form, setForm] = useState({
    name: '',
    phone: '',
    message: '',
    jy: now.jy,
    jm: now.jm,
    jd: now.jd,
  })
  const [state, setState] = useState('idle') // idle | sending | done | error
  const [errors, setErrors] = useState({})

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'نام خود را وارد کنید.'
    // Accept Persian or Latin digits, 10–11 chars
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
    <section id="inquiry" className="relative bg-cream py-24 sm:py-32">
      <Container>
        <SectionTitle eyebrow={inquiry.eyebrow} title={inquiry.title} intro={inquiry.intro} />

        <Reveal delay={0.1}>
          <div className="mx-auto mt-14 max-w-2xl border border-vein bg-ivory p-8 sm:mt-16 sm:p-12">
            <AnimatePresence mode="wait">
              {state === 'done' ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
                  className="py-8 text-center"
                >
                  {/* Brass check, drawn */}
                  <svg
                    viewBox="0 0 48 48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    className="mx-auto h-14 w-14 text-brass"
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
                    onClick={() => {
                      setState('idle')
                      setForm({ name: '', phone: '', message: '', jy: now.jy, jm: now.jm, jd: now.jd })
                    }}
                    className="mt-8 border-b border-brass/50 pb-0.5 text-sm text-muted transition-colors hover:text-ink"
                  >
                    ثبت استعلام دیگر
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={onSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
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
                      {errors.name && (
                        <p className="mt-2 text-xs text-booked">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <Field label="شمارهٔ تماس">
                        <input
                          className={`${inputCls} num`}
                          value={form.phone}
                          onChange={set('phone')}
                          placeholder="۰۹۱۲ ۰۰۰ ۰۰ ۰۰"
                          inputMode="tel"
                          autoComplete="tel"
                          dir="ltr"
                          style={{ textAlign: 'right' }}
                        />
                      </Field>
                      {errors.phone && (
                        <p className="mt-2 text-xs text-booked">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Jalali date picker — three selects, no Gregorian anywhere */}
                  <div>
                    <span className="mb-2 block text-sm text-muted">تاریخ مورد نظر</span>
                    <div className="grid grid-cols-3 gap-4">
                      <Field label="">
                        <select className={selectCls} value={form.jd} onChange={set('jd')}>
                          {daysIn(+form.jy, +form.jm).map((d) => (
                            <option key={d} value={d}>
                              {toFa(d)}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="">
                        <select className={selectCls} value={form.jm} onChange={set('jm')}>
                          {MONTHS.map((m, idx) => (
                            <option key={m} value={idx + 1}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="">
                        <select className={selectCls} value={form.jy} onChange={set('jy')}>
                          {yearOptions(3).map((y) => (
                            <option key={y} value={y}>
                              {toFa(y)}
                            </option>
                          ))}
                        </select>
                      </Field>
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
                      className="group relative w-full overflow-hidden border border-brass px-10 py-4 text-sm text-ink transition-colors duration-300 hover:text-ivory disabled:opacity-60 sm:w-auto"
                    >
                      <span className="absolute inset-0 origin-right scale-x-0 bg-brass transition-transform duration-500 ease-[cubic-bezier(.65,0,.35,1)] group-hover:scale-x-100 group-disabled:scale-x-0" />
                      <span className="relative flex items-center justify-center gap-3">
                        {state === 'sending' && (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border border-brass border-t-transparent" />
                        )}
                        {state === 'sending' ? 'در حال ارسال…' : 'ارسال استعلام'}
                      </span>
                    </button>

                    <p className="text-center text-xs leading-relaxed text-muted sm:text-right">
                      یا مستقیم تماس بگیرید:{' '}
                      <a
                        href={`tel:${hall.phoneHref}`}
                        className="num border-b border-brass/40 pb-px text-ink transition-colors hover:border-brass"
                      >
                        {hall.phone}
                      </a>
                    </p>
                  </div>

                  {state === 'error' && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-r-2 border-booked bg-booked/5 px-4 py-3 text-sm leading-relaxed text-text"
                    >
                      ارسال با خطا مواجه شد. لطفاً با شمارهٔ{' '}
                      <a href={`tel:${hall.phoneHref}`} className="num text-ink underline">
                        {hall.phone}
                      </a>{' '}
                      تماس بگیرید.
                    </motion.p>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
