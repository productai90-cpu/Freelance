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
  strokeWidth: 1,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
}
