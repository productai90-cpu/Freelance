/* ============================================================
   MONOGRAM — a marble slab bearing the letter م.

   The frame and its vein are SVG so they stay crisp at any size,
   while the letter itself is real text in the display face — a
   traced letterform would drift from the wordmark it sits beside.

   tone="light"  on photography / dark grounds
   tone="dark"   on the ivory and silver grounds
   ============================================================ */

export default function Monogram({ size = 34, tone = 'dark', className = '' }) {
  const light = tone === 'light'
  const frame = light ? 'rgba(251,252,253,0.55)' : 'var(--color-accent)'
  const vein = light ? 'rgba(251,252,253,0.28)' : 'color-mix(in srgb, var(--color-accent) 55%, transparent)'

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full" fill="none">
        {/* Slab */}
        <rect x="1.5" y="1.5" width="37" height="37" rx="2" stroke={frame} strokeWidth="1" />
        {/* Vein — the marble reference, clipped to the slab */}
        <clipPath id={`mono-clip-${size}-${tone}`}>
          <rect x="1.5" y="1.5" width="37" height="37" rx="2" />
        </clipPath>
        <g clipPath={`url(#mono-clip-${size}-${tone})`}>
          <path
            d="M-4 30C6 24 12 20 20 12S34 0 46 -4"
            stroke={vein}
            strokeWidth="0.9"
            strokeLinecap="round"
          />
          <path
            d="M-4 40C8 34 16 30 24 24S38 12 46 8"
            stroke={vein}
            strokeWidth="0.6"
            strokeLinecap="round"
            opacity="0.6"
          />
        </g>
      </svg>

      <span
        className={`relative font-display font-light leading-none ${
          light ? 'text-surface' : 'text-ink'
        }`}
        style={{ fontSize: size * 0.46, marginTop: -size * 0.03 }}
      >
        م
      </span>
    </span>
  )
}
