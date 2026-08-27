import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useData } from '../store/DataContext.jsx'
import { navigate } from '../lib/router.js'
import { formatKeyLong } from '../lib/jalali.js'
import { toFa } from '../lib/digits.js'

/* Leads arrive here from the public inquiry form.

   An enquiry is either OPEN or SETTLED, and the inbox only shows the
   open ones. «تبدیل به رزرو» settles it into the calendar, «لغو»
   settles it away. «تماس گرفتم» settles nothing — it is a marker
   saying someone has already rung this person, so two staff do not
   call the same couple and nobody sits waiting on an enquiry that
   was answered yesterday.

   Settled enquiries drop into a collapsed list underneath. Out of
   the way, but a cancel is one tap and so is undoing it. */

const relative = (ts) => {
  const mins = Math.floor((Date.now() - ts) / 60000)
  if (mins < 1) return 'همین الان'
  if (mins < 60) return `${toFa(mins)} دقیقه پیش`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${toFa(hrs)} ساعت پیش`
  return `${toFa(Math.floor(hrs / 24))} روز پیش`
}

const BADGE = {
  new: { label: 'جدید', cls: 'bg-booked/12 text-booked border-booked/30' },
  contacted: { label: 'تماس گرفته شد', cls: 'bg-tentative/12 text-accent-deep border-accent/30' },
  converted: { label: 'تبدیل شد', cls: 'bg-free/12 text-free border-free/30' },
  archived: { label: 'لغو شد', cls: 'bg-line/40 text-muted border-line' },
}

/* Shared so the three actions are one row of the same object, not
   three buttons that happen to sit together. Only «تبدیل به رزرو» is
   filled — it is the one irreversible, revenue-shaped action on the
   screen, and the other two must not compete with it. */
const BTN = 'rounded-lg py-2.5 text-xs transition-colors duration-300'
const OUTLINE = `${BTN} border px-4`

const OPEN = new Set(['new', 'contacted'])

export default function LeadsInbox() {
  const { leads, convertLead, markLead, notify } = useData()
  const [showSettled, setShowSettled] = useState(false)

  const [open, settled] = useMemo(
    () => [leads.filter((l) => OPEN.has(l.status)), leads.filter((l) => !OPEN.has(l.status))],
    [leads],
  )

  const onConvert = (lead) => {
    const booking = convertLead(lead.id)
    if (!booking) return
    notify(`رزرو «${lead.name}» ایجاد شد`)
    setTimeout(() => navigate(`/admin/booking/${booking.id}`), 700)
  }

  return (
    <div className="px-5 pt-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-xl font-light text-ink">استعلام‌های باز</h2>
        <span className="num text-xs text-muted">{toFa(open.length)} مورد</span>
      </div>

      <div className="mt-5 space-y-3">
        <AnimatePresence initial={false}>
          {(showSettled ? settled : open).map((lead) => {
            const badge = BADGE[lead.status] ?? BADGE.new
            const converted = lead.status === 'converted'
            const archived = lead.status === 'archived'
            const done = converted || archived

            return (
              <motion.article
                key={lead.id}
                layout
                layoutId={`lead-${lead.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.26, ease: [0.22, 0.61, 0.36, 1] }}
                className={`rounded-xl border border-line bg-surface p-4 ${done ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-ink">{lead.name}</p>
                    <p className="num mt-0.5 text-xs text-muted">{relative(lead.at)}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>

                <dl className="mt-3 space-y-1.5 text-sm">
                  <div className="flex gap-2">
                    <dt className="text-muted">تاریخ مورد نظر:</dt>
                    <dd className="text-ink">{formatKeyLong(lead.date)}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-muted">تماس:</dt>
                    <dd>
                      {/* dir=ltr: a phone number is a Latin-digit run.
                          Left to the page's RTL context, bidi reorders
                          the groups and a number typed with spaces or a
                          leading + comes out scrambled. */}
                      <a
                        href={`tel:${lead.phone}`}
                        dir="ltr"
                        className="num block text-left text-ink underline-offset-4 hover:underline"
                      >
                        {lead.phone}
                      </a>
                    </dd>
                  </div>
                </dl>

                {lead.message && (
                  <p className="mt-3 border-r-2 border-line pr-3 text-xs leading-relaxed text-muted">
                    {lead.message}
                  </p>
                )}

                {!done && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => onConvert(lead)}
                      className={`${BTN} flex-1 bg-ink text-surface hover:bg-accent-deep`}
                    >
                      تبدیل به رزرو
                    </button>

                    {/* Stays on screen after it is used, and stays an
                        outline. Filling it in would put two solid
                        buttons beside each other and lose which one is
                        the real action. The accent border carries the
                        state instead. Tapping again undoes it — this is
                        a phone, mis-taps happen. */}
                    <button
                      onClick={() =>
                        markLead(lead.id, lead.status === 'contacted' ? 'new' : 'contacted')
                      }
                      aria-pressed={lead.status === 'contacted'}
                      className={`${OUTLINE} ${
                        lead.status === 'contacted'
                          ? 'border-accent bg-accent/10 text-accent-deep'
                          : 'border-line text-muted hover:text-ink'
                      }`}
                    >
                      {lead.status === 'contacted' ? '✓ تماس گرفتم' : 'تماس گرفتم'}
                    </button>

                    <button
                      onClick={() => {
                        markLead(lead.id, 'archived')
                        notify(`استعلام «${lead.name}» لغو شد`)
                      }}
                      className={`${OUTLINE} border-line text-muted hover:border-danger hover:text-danger`}
                    >
                      لغو
                    </button>
                  </div>
                )}

                {/* Cancelling is one tap, so it has to be one tap back.
                    Cheaper than a confirmation dialog and kinder than
                    losing an enquiry to a mis-tap. */}
                {archived && (
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        markLead(lead.id, 'new')
                        notify(`«${lead.name}» به استعلام‌های باز برگشت`)
                      }}
                      className={`${OUTLINE} w-full border-line text-muted hover:text-ink`}
                    >
                      بازگرداندن به استعلام‌های باز
                    </button>
                  </div>
                )}

                {/* A converted lead has a booking; take them to it. */}
                {converted && (
                  <div className="mt-4">
                    <button
                      onClick={() => navigate('/admin/bookings')}
                      className={`${OUTLINE} w-full border-line text-muted hover:text-ink`}
                    >
                      مشاهده در رزروها
                    </button>
                  </div>
                )}
              </motion.article>
            )
          })}
        </AnimatePresence>

        {(showSettled ? settled : open).length === 0 && (
          <p className="py-16 text-center text-sm text-muted">
            {showSettled
              ? 'هنوز استعلامی بسته نشده است.'
              : leads.length === 0
                ? 'هنوز استعلامی ثبت نشده است.'
                : 'همهٔ استعلام‌ها رسیدگی شده‌اند.'}
          </p>
        )}
      </div>

      {settled.length > 0 && (
        <button
          onClick={() => setShowSettled((v) => !v)}
          className="mt-6 w-full rounded-lg border border-line py-3 text-xs text-muted transition-colors duration-300 hover:text-ink"
        >
          {showSettled
            ? 'بازگشت به استعلام‌های باز'
            : `رسیدگی‌شده‌ها (${toFa(settled.length)})`}
        </button>
      )}
    </div>
  )
}
