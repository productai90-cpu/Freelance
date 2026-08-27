import { motion } from 'motion/react'
import { useData } from '../store/DataContext.jsx'
import { STATUS } from '../data/mock.js'
import { navigate } from '../lib/router.js'
import { formatKeyLong, parseKey, today } from '../lib/jalali.js'
import { toFa } from '../lib/digits.js'
import { faNumber } from '../lib/money.js'

/* Upcoming events, nearest first — the list the manager scans in the
   morning. Amounts are present but understated; this is not a ledger. */

const ordinal = (key) => {
  const { jy, jm, jd } = parseKey(key)
  return jy * 10000 + jm * 100 + jd
}

export default function BookingsList() {
  const { bookings } = useData()
  const now = today()
  const nowOrd = now.jy * 10000 + now.jm * 100 + now.jd

  const sorted = [...bookings].sort((a, b) => ordinal(a.date) - ordinal(b.date))
  const upcoming = sorted.filter((b) => ordinal(b.date) >= nowOrd)
  const past = sorted.filter((b) => ordinal(b.date) < nowOrd).reverse()

  const Card = ({ b, dim = false }) => {
    const status = STATUS[b.status]
    const remaining = Math.max(0, b.contract - b.deposit)

    return (
      <motion.button
        layout
        onClick={() => navigate(`/admin/booking/${b.id}`)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: dim ? 0.55 : 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
        className="w-full rounded-xl border border-vein bg-ivory p-4 text-right transition-colors hover:border-brass/50"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-ink">{b.client}</p>
            <p className="mt-0.5 text-xs text-muted">{formatKeyLong(b.date)}</p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-muted">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.color }} />
            {status.label}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-vein pt-3 text-xs">
          <span className="text-muted">{b.hall}</span>
          {remaining > 0 ? (
            <span className="num text-muted">
              مانده: <span className="text-ink">{faNumber(remaining)}</span> تومان
            </span>
          ) : (
            <span className="text-free">تسویه شده</span>
          )}
        </div>
      </motion.button>
    )
  }

  return (
    <div className="px-5 pt-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-xl font-light text-ink">رزروها</h2>
        <span className="num text-xs text-muted">{toFa(upcoming.length)} پیش‌رو</span>
      </div>

      <div className="mt-5 space-y-3">
        {upcoming.map((b) => (
          <Card key={b.id} b={b} />
        ))}
        {upcoming.length === 0 && (
          <p className="py-16 text-center text-sm text-muted">رزرو پیش‌رویی ثبت نشده است.</p>
        )}
      </div>

      {past.length > 0 && (
        <>
          <p className="eyebrow mt-9 mb-3">برگزار شده</p>
          <div className="space-y-3">
            {past.map((b) => (
              <Card key={b.id} b={b} dim />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
