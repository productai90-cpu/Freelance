import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useData } from '../store/DataContext.jsx'
import { STATUS } from '../data/mock.js'
import { navigate } from '../lib/router.js'
import { toFa } from '../lib/digits.js'
import { MONTHS, WEEKDAYS_SHORT, addMonths, formatLong, monthGrid, today } from '../lib/jalali.js'

/* The whole point of this screen: the manager is on the phone and
   needs to answer "is the 12th free?" without reading anything. So
   status is carried by a colour wash plus a dot, not by text. */

const STATUS_STYLE = {
  free: { tint: 'transparent', dot: null, text: 'text-ink' },
  tentative: { tint: 'color-mix(in srgb, var(--color-tentative) 16%, transparent)', dot: 'bg-tentative', text: 'text-ink' },
  booked: { tint: 'color-mix(in srgb, var(--color-booked) 16%, transparent)', dot: 'bg-booked', text: 'text-ink' },
}

export default function CalendarScreen() {
  const { byDate } = useData()
  const now = today()
  const [view, setView] = useState({ jy: now.jy, jm: now.jm })
  const [dir, setDir] = useState(1)
  const [selected, setSelected] = useState(null)

  const cells = monthGrid(view.jy, view.jm)

  const go = (delta) => {
    setDir(delta)
    setView((v) => addMonths(v.jy, v.jm, delta))
    setSelected(null)
  }

  const counts = cells.reduce(
    (acc, c) => {
      if (!c) return acc
      const s = byDate[c.key]?.status ?? 'free'
      acc[s]++
      return acc
    },
    { free: 0, tentative: 0, booked: 0 },
  )

  const selectedBooking = selected ? byDate[selected.key] : null

  return (
    <div className="px-5 pt-5">
      {/* — Month switcher. In RTL the "next" chevron points left. — */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => go(-1)}
          aria-label="ماه قبل"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-colors hover:text-ink"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-4 w-4">
            <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="text-center">
          <p className="font-display text-xl font-light text-ink">
            {MONTHS[view.jm - 1]} <span className="num">{toFa(view.jy)}</span>
          </p>
        </div>

        <button
          onClick={() => go(1)}
          aria-label="ماه بعد"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-colors hover:text-ink"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-4 w-4">
            <path d="m15 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* — At-a-glance tally — */}
      <div className="mt-4 flex items-center justify-center gap-5 text-[11px]">
        {Object.values(STATUS).map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-muted">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
            {s.label}
            <span className="num text-ink">{toFa(counts[s.key])}</span>
          </span>
        ))}
      </div>

      {/* — Weekday header, Saturday-first — */}
      <div className="mt-5 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS_SHORT.map((d, i) => (
          <span key={d} className={`py-2 text-[11px] ${i === 6 ? 'text-booked/70' : 'text-muted'}`}>
            {d}
          </span>
        ))}
      </div>

      {/* — Grid — */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${view.jy}-${view.jm}`}
            initial={{ opacity: 0, x: dir > 0 ? -24 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir > 0 ? 24 : -24 }}
            transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
            className="grid grid-cols-7 gap-1"
          >
            {cells.map((c, i) => {
              if (!c) return <span key={`e${i}`} />

              const status = byDate[c.key]?.status ?? 'free'
              const st = STATUS_STYLE[status]
              const isSel = selected?.key === c.key

              return (
                <button
                  key={c.key}
                  onClick={() => setSelected(isSel ? null : c)}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-lg border transition-all duration-200 ${
                    isSel ? 'border-accent' : 'border-transparent'
                  } ${c.isPast ? 'opacity-40' : ''}`}
                  style={{ background: st.tint }}
                >
                  <span
                    className={`num text-sm ${
                      c.isToday ? 'font-medium text-accent' : st.text
                    }`}
                  >
                    {toFa(c.jd)}
                  </span>

                  {st.dot && <span className={`mt-1 h-1 w-1 rounded-full ${st.dot}`} />}

                  {c.isToday && (
                    <span className="absolute inset-x-3 bottom-1 h-px bg-accent/50" />
                  )}
                </button>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* — Selected day: the phone-call answer — */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="mt-5 rounded-xl border border-line bg-cream/50 p-4"
          >
            <p className="text-sm text-muted">{formatLong(selected.jy, selected.jm, selected.jd)}</p>

            {selectedBooking ? (
              <>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: STATUS[selectedBooking.status].color }}
                  />
                  <p className="text-ink">{STATUS[selectedBooking.status].label}</p>
                  <span className="text-muted">—</span>
                  <p className="text-ink">{selectedBooking.client}</p>
                </div>

                <button
                  onClick={() => navigate(`/admin/booking/${selectedBooking.id}`)}
                  className="mt-4 w-full rounded-lg bg-ink py-3 text-sm text-surface transition-opacity hover:opacity-90"
                >
                  مشاهدهٔ جزئیات رزرو
                </button>
              </>
            ) : (
              <>
                <div className="mt-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: STATUS.free.color }} />
                  <p className="text-ink">این تاریخ آزاد است</p>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted">
                  می‌توانید همین حالا پشت تلفن با اطمینان پاسخ دهید.
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
