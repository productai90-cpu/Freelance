import { motion } from 'motion/react'
import { useData } from '../store/DataContext.jsx'
import { STATUS } from '../data/mock.js'
import { navigate } from '../lib/router.js'
import { formatKeyLong } from '../lib/jalali.js'
import { toFa } from '../lib/digits.js'
import { toman } from '../lib/money.js'

/* Money as a calm typographic hierarchy, not a data table.
   This is the screen most at risk of looking like accounting
   software, so it is the one kept most spacious. */

function Row({ label, value, emphasis = false }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3.5">
      <dt className="shrink-0 text-sm text-muted">{label}</dt>
      <dd
        className={`num text-left ${
          emphasis ? 'font-display text-lg text-ink' : 'text-sm text-ink'
        }`}
      >
        {value}
      </dd>
    </div>
  )
}

export default function BookingDetail({ id }) {
  const { bookings, updateBooking, notify } = useData()
  const booking = bookings.find((b) => b.id === id)

  if (!booking) {
    return (
      <div className="px-5 py-20 text-center">
        <p className="text-sm text-muted">این رزرو یافت نشد.</p>
        <button
          onClick={() => navigate('/admin')}
          className="mt-4 border-b border-accent/50 pb-0.5 text-sm text-ink"
        >
          بازگشت به تقویم
        </button>
      </div>
    )
  }

  const remaining = Math.max(0, booking.contract - booking.deposit)
  const paidRatio = booking.contract > 0 ? booking.deposit / booking.contract : 0
  const status = STATUS[booking.status]

  return (
    <div className="px-5 pt-5">
      <button
        onClick={() => navigate('/admin')}
        className="mb-4 flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-ink"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-3.5 w-3.5">
          <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        بازگشت
      </button>

      {/* — Headline — */}
      <div className="rounded-xl border border-line bg-cream/40 p-5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: status.color }} />
          <span className="text-xs text-muted">{status.label}</span>
          {booking.fromLead && (
            <span className="rounded-full border border-accent/30 px-2 py-0.5 text-[10px] text-accent">
              از استعلام سایت
            </span>
          )}
        </div>

        <h2 className="mt-3 font-display text-2xl font-light text-ink">{booking.client}</h2>
        <p className="mt-1.5 text-sm text-muted">{formatKeyLong(booking.date)}</p>

        <a
          href={`tel:${booking.phone}`}
          dir="ltr"
          className="num mt-4 inline-flex flex-row-reverse items-center gap-2 rounded-lg border border-line px-4 py-2 text-left text-sm text-ink transition-colors hover:border-accent"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="h-4 w-4">
            <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" />
          </svg>
          {booking.phone}
        </a>
      </div>

      {/* — Financials — */}
      <div className="mt-5 rounded-xl border border-line bg-surface p-5">
        <p className="eyebrow mb-1">مالی</p>
        <dl className="divide-y divide-line">
          <Row label="مبلغ قرارداد" value={toman(booking.contract)} />
          <Row label="بیعانهٔ پرداختی" value={toman(booking.deposit)} />
          <Row label="مانده حساب" value={toman(remaining)} emphasis />
        </dl>

        {/* Payment progress — a hairline, not a chunky bar */}
        <div className="mt-4">
          <div className="h-1 w-full overflow-hidden rounded-full bg-line">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(paidRatio * 100)}%` }}
              transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
            />
          </div>
          <p className="num mt-2 text-[11px] text-muted">
            {toFa(Math.round(paidRatio * 100))}٪ پرداخت شده
          </p>
        </div>
      </div>

      {/* — Event details — */}
      <div className="mt-5 rounded-xl border border-line bg-surface p-5">
        <p className="eyebrow mb-1">مراسم</p>
        <dl className="divide-y divide-line">
          <Row label="سالن" value={booking.hall} />
          <Row label="تعداد مهمان" value={booking.guests ? toFa(booking.guests) : '—'} />
        </dl>
        {booking.note && (
          <p className="mt-3 border-r-2 border-accent/40 pr-3 text-xs leading-relaxed text-muted">
            {booking.note}
          </p>
        )}
      </div>

      {/* — Actions — */}
      <div className="mt-5 space-y-2.5">
        <button
          onClick={() => notify(`یادآوری برای ${booking.client} ارسال شد`)}
          className="w-full rounded-lg bg-ink py-3.5 text-sm text-surface transition-opacity hover:opacity-90"
        >
          ارسال یادآوری
        </button>

        {booking.status === 'tentative' && (
          <button
            onClick={() => {
              updateBooking(booking.id, { status: 'booked' })
              notify('رزرو قطعی شد')
            }}
            className="w-full rounded-lg border border-accent py-3.5 text-sm text-ink transition-colors hover:bg-accent hover:text-surface"
          >
            قطعی کردن رزرو
          </button>
        )}
      </div>
    </div>
  )
}
