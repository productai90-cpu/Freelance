import { toJalaali, toGregorian, jalaaliMonthLength } from 'jalaali-js'
import { toFa } from './digits.js'

/* ============================================================
   JALALI (شمسی) DATES
   The manager thinks only in the Persian calendar, so the whole
   app does too. Gregorian appears nowhere in the interface.
   ============================================================ */

export const MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
]

/** The Persian week starts on Saturday. */
export const WEEKDAYS = ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه']
export const WEEKDAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

/** JS getDay() is Sunday-first; shift it to Saturday-first. */
const persianWeekday = (date) => (date.getDay() + 1) % 7

export const today = () => {
  const { jy, jm, jd } = toJalaali(new Date())
  return { jy, jm, jd }
}

export const toGregorianDate = (jy, jm, jd) => {
  const { gy, gm, gd } = toGregorian(jy, jm, jd)
  return new Date(gy, gm - 1, gd)
}

export const monthLength = (jy, jm) => jalaaliMonthLength(jy, jm)

/** Stable lookup key: "1405-06-05" */
export const dateKey = (jy, jm, jd) =>
  `${jy}-${String(jm).padStart(2, '0')}-${String(jd).padStart(2, '0')}`

export const parseKey = (key) => {
  const [jy, jm, jd] = key.split('-').map(Number)
  return { jy, jm, jd }
}

/** "۵ شهریور ۱۴۰۵" */
export const formatLong = (jy, jm, jd) => `${toFa(jd)} ${MONTHS[jm - 1]} ${toFa(jy)}`

export const formatKeyLong = (key) => {
  const { jy, jm, jd } = parseKey(key)
  return formatLong(jy, jm, jd)
}

/** "۱۴۰۵/۰۶/۰۵" */
export const formatShort = (jy, jm, jd) =>
  toFa(`${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`)

export const addMonths = (jy, jm, delta) => {
  let total = jy * 12 + (jm - 1) + delta
  return { jy: Math.floor(total / 12), jm: (total % 12) + 1 }
}

export const isSameDay = (a, b) => a.jy === b.jy && a.jm === b.jm && a.jd === b.jd

/**
 * Build a month grid, Saturday-first, padded with leading blanks so
 * the first day lands under its correct weekday column.
 * Returns a flat array of `null | { jy, jm, jd, key, weekday, isToday, isPast }`.
 */
export function monthGrid(jy, jm) {
  const length = monthLength(jy, jm)
  const firstWeekday = persianWeekday(toGregorianDate(jy, jm, 1))
  const now = today()
  const nowOrdinal = now.jy * 10000 + now.jm * 100 + now.jd

  const cells = Array(firstWeekday).fill(null)

  for (let jd = 1; jd <= length; jd++) {
    const ordinal = jy * 10000 + jm * 100 + jd
    cells.push({
      jy,
      jm,
      jd,
      key: dateKey(jy, jm, jd),
      weekday: (firstWeekday + jd - 1) % 7,
      isToday: ordinal === nowOrdinal,
      isPast: ordinal < nowOrdinal,
    })
  }

  // Pad the tail so the final row is complete and the grid keeps its shape.
  while (cells.length % 7 !== 0) cells.push(null)

  return cells
}

/** Day options for a given month — used by the inquiry date picker. */
export const daysIn = (jy, jm) =>
  Array.from({ length: monthLength(jy, jm) }, (_, i) => i + 1)

/** A few years forward from now, for date-picker year options. */
export const yearOptions = (count = 2) => {
  const { jy } = today()
  return Array.from({ length: count }, (_, i) => jy + i)
}
