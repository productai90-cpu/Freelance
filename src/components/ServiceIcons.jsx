import { motion } from 'motion/react'

/* Thin-line icons as data rather than markup, so each stroke can be
   rendered as a motion element and draw itself in on reveal.
   1px strokes, no fills — engraved, not buttons. */

export const ICON_SHAPES = {
  // تشریفات — a four-point sparkle with a small companion
  sparkle: [
    { t: 'path', d: 'M20 6c0 6 3 9 9 9-6 0-9 3-9 9 0-6-3-9-9-9 6 0 9-3 9-9Z' },
    {
      t: 'path',
      d: 'M29.5 25c0 2.6 1.3 3.9 3.9 3.9-2.6 0-3.9 1.3-3.9 3.9 0-2.6-1.3-3.9-3.9-3.9 2.6 0 3.9-1.3 3.9-3.9Z',
    },
  ],
  // سفرهٔ عقد — mirror and candlesticks
  mirror: [
    { t: 'path', d: 'M20 6c4.4 0 8 3.6 8 8v9H12v-9c0-4.4 3.6-8 8-8Z' },
    { t: 'path', d: 'M12 27h16' },
    { t: 'path', d: 'M14 34h12' },
    { t: 'path', d: 'M20 27v7' },
    { t: 'path', d: 'M8 14v13' },
    { t: 'path', d: 'M32 14v13' },
  ],
  // آتش‌بازی
  spark: [
    { t: 'path', d: 'M20 17V5' },
    { t: 'path', d: 'M23 17 30.6 9.4' },
    { t: 'path', d: 'M23 20h12' },
    { t: 'path', d: 'M23 23l7.6 7.6' },
    { t: 'path', d: 'M20 23v12' },
    { t: 'path', d: 'M17 23 9.4 30.6' },
    { t: 'path', d: 'M17 20H5' },
    { t: 'path', d: 'M17 17 9.4 9.4' },
    { t: 'circle', cx: 20, cy: 20, r: 2.5 },
  ],
  // دی‌جی و صدا
  music: [
    { t: 'circle', cx: 13, cy: 28, r: 4 },
    { t: 'circle', cx: 29, cy: 25, r: 4 },
    { t: 'path', d: 'M17 28V11l16-3v17' },
    { t: 'path', d: 'M17 16l16-3' },
  ],
  // جایگاه عروس و داماد
  arch: [
    { t: 'path', d: 'M11 35V19a9 9 0 0 1 18 0v16' },
    { t: 'path', d: 'M7 35h26' },
    { t: 'path', d: 'M11 24h18' },
    { t: 'path', d: 'M20 10V6' },
  ],
  // گل‌آرایی
  flower: [
    { t: 'circle', cx: 20, cy: 15, r: 3.2 },
    { t: 'path', d: 'M20 11.8c0-3.2 1.6-4.8 4.8-4.8 0 3.2-1.6 4.8-4.8 4.8Z' },
    { t: 'path', d: 'M20 11.8c0-3.2-1.6-4.8-4.8-4.8 0 3.2 1.6 4.8 4.8 4.8Z' },
    { t: 'path', d: 'M23.2 15c3.2 0 4.8 1.6 4.8 4.8-3.2 0-4.8-1.6-4.8-4.8Z' },
    { t: 'path', d: 'M16.8 15c-3.2 0-4.8 1.6-4.8 4.8 3.2 0 4.8-1.6 4.8-4.8Z' },
    { t: 'path', d: 'M20 18.2V34' },
    { t: 'path', d: 'M20 26c3 0 5-2 5-5' },
    { t: 'path', d: 'M20 30c-3 0-5-2-5-5' },
  ],
  // فیلم و عکس
  camera: [
    {
      t: 'path',
      d: 'M6 13h16l3 4h9a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V15a2 2 0 0 1 2-2Z',
    },
    { t: 'circle', cx: 20, cy: 25, r: 6 },
  ],
  // پیش‌غذا — کاسه با برگ تازه
  bowl: [
    { t: 'path', d: 'M7 20h26a13 13 0 0 1-26 0Z' },
    { t: 'path', d: 'M20 17c0-4 2.5-6.5 6.5-6.5 0 4-2.5 6.5-6.5 6.5Z' },
    { t: 'path', d: 'M20 17c0-4-2.5-6.5-6.5-6.5 0 4 2.5 6.5 6.5 6.5Z' },
    { t: 'path', d: 'M8 36h24' },
  ],
  // غذای اصلی — سرپوش نقره روی بشقاب
  cloche: [
    { t: 'path', d: 'M9 27a11 11 0 0 1 22 0' },
    { t: 'path', d: 'M5 27h30' },
    { t: 'path', d: 'M10 31h20' },
    { t: 'circle', cx: 20, cy: 13.6, r: 1.8 },
  ],
  // دسر و شیرینی — کیک لایه‌ای
  cake: [
    { t: 'path', d: 'M11 20h18v11H11z' },
    { t: 'path', d: 'M11 24.5h18' },
    { t: 'path', d: 'M6 31h28' },
    { t: 'circle', cx: 20, cy: 15.6, r: 1.7 },
    { t: 'path', d: 'M20 17.3V20' },
  ],
  // نوشیدنی — گیلاس پایه‌دار
  glass: [
    { t: 'path', d: 'M13 7h14l-1.6 9.4a5.6 5.6 0 0 1-10.8 0L13 7Z' },
    { t: 'path', d: 'M13.7 11.4h12.6' },
    { t: 'path', d: 'M20 21.6V32' },
    { t: 'path', d: 'M14 32h12' },
  ],
  // میوه — میوه‌آرایی
  fruit: [
    { t: 'path', d: 'M8 21h24a12 12 0 0 1-24 0Z' },
    { t: 'path', d: 'M20 32.6V35' },
    { t: 'path', d: 'M14.5 35h11' },
    { t: 'circle', cx: 15.5, cy: 16.4, r: 4.2 },
    { t: 'circle', cx: 24.6, cy: 17.4, r: 3.4 },
    { t: 'path', d: 'M24.6 13.6c0-3 1.6-4.6 4.6-4.6 0 3-1.6 4.6-4.6 4.6Z' },
  ],
  // تشریفات میز — شمعدان
  candles: [
    { t: 'path', d: 'M11 18h4v14h-4z' },
    { t: 'path', d: 'M18 14h4v18h-4z' },
    { t: 'path', d: 'M25 18h4v14h-4z' },
    { t: 'path', d: 'M7 32h26' },
    { t: 'path', d: 'M13 17.4c-1.7-1.4-1.7-3.6 0-5.2 1.7 1.6 1.7 3.8 0 5.2Z' },
    { t: 'path', d: 'M20 13.4c-1.7-1.4-1.7-3.6 0-5.2 1.7 1.6 1.7 3.8 0 5.2Z' },
    { t: 'path', d: 'M27 17.4c-1.7-1.4-1.7-3.6 0-5.2 1.7 1.6 1.7 3.8 0 5.2Z' },
  ],
  // سلف‌سرویس — ایستگاه گرم
  buffet: [
    { t: 'path', d: 'M6 22h28v4a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4v-4Z' },
    { t: 'path', d: 'M10.5 30v4' },
    { t: 'path', d: 'M29.5 30v4' },
    { t: 'path', d: 'M15 18.5c0-2 2-2.6 2-4.6' },
    { t: 'path', d: 'M20 18.5c0-2.4 2-3.2 2-5.6' },
    { t: 'path', d: 'M25 18.5c0-2 2-2.6 2-4.6' },
  ],
  // پکیج ویژه — نگین
  gem: [
    { t: 'path', d: 'M13.6 9h12.8l6.6 8-13 17L7 17l6.6-8Z' },
    { t: 'path', d: 'M7 17h26' },
    { t: 'path', d: 'M13.6 9 17 17l3 17' },
    { t: 'path', d: 'M26.4 9 23 17l-3 17' },
  ],
  // پکیج معمولی — چیدمان رومیزی
  setting: [
    { t: 'circle', cx: 20, cy: 20, r: 9 },
    { t: 'circle', cx: 20, cy: 20, r: 5.5 },
    { t: 'path', d: 'M4 7v5a2 2 0 0 0 4 0V7' },
    { t: 'path', d: 'M6 14v19' },
    { t: 'path', d: 'M34 33V7c-2.2 2.4-2.2 8.6 0 11' },
  ],
  // پارکینگ
  parking: [
    { t: 'path', d: 'M6 26l3-9a3 3 0 0 1 2.9-2h16.2a3 3 0 0 1 2.9 2l3 9' },
    {
      t: 'path',
      d: 'M6 26h28v6a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-2H11v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-6Z',
    },
    { t: 'path', d: 'M11 30h2' },
    { t: 'path', d: 'M27 30h2' },
  ],
}

export const SVG_PROPS = {
  viewBox: '0 0 40 40',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
}

/* ------------------------------------------------------------
   One icon, each stroke drawing itself in.

   `trigger` matters: sections reveal on scroll, but an icon that
   mounts inside an already-open lightbox has no scroll event to
   wait for — it must draw immediately or it never appears.
   ------------------------------------------------------------ */
export function DrawnIcon({ name, delay = 0, reduce = false, trigger = 'inView', className = '' }) {
  const shapes = ICON_SHAPES[name] ?? ICON_SHAPES.sparkle
  const from = reduce ? { opacity: 0 } : { pathLength: 0, opacity: 0 }
  const to = reduce ? { opacity: 1 } : { pathLength: 1, opacity: 1 }

  // 'now'   — draw on mount (a lightbox has no scroll event to wait for)
  // 'hold'  — the CARD owns the trigger; stay drawn-out until it says go
  // 'inView'— watch for itself
  const stroke =
    trigger === 'now'
      ? { initial: from, animate: to }
      : trigger === 'hold'
        ? { initial: from, animate: from }
        : { initial: from, whileInView: to, viewport: { once: true, amount: 0.4 } }

  return (
    <svg {...SVG_PROPS} className={className}>
      {shapes.map((s, i) => {
        const transition = { duration: 0.8, delay: delay + i * 0.06, ease: 'easeInOut' }
        return s.t === 'circle' ? (
          <motion.circle key={i} cx={s.cx} cy={s.cy} r={s.r} {...stroke} transition={transition} />
        ) : (
          <motion.path key={i} d={s.d} {...stroke} transition={transition} />
        )
      })}
    </svg>
  )
}
