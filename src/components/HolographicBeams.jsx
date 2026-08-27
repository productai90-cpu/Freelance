import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

/* ============================================================
   LIGHT SHAFTS

   Adapted from a "holographic beams" canvas. The geometry is kept —
   soft pillars of light rising from the floor, their heights driven
   by summed sines, each drawn three times at a slight horizontal
   offset so the edges split into colour.

   Everything else is re-pointed at this site.

   COLOUR. The original splits pure red / blue / cyan-white over
   #000. That is the whole point of chromatic aberration, and it is
   also the one thing this palette cannot take — the hero grade is
   explicitly a warm charcoal, "never neutral black". So the split is
   done inside the site's own two accents instead: pewter one way,
   gold the other, a near-white core down the middle. It reads as
   light through glass rather than as a hologram, which is the right
   register for a room with chandeliers in it.

   GROUND. No background and no vignette. The canvas is transparent
   and the layer is composited with `screen`, so it ADDS light to the
   photograph underneath rather than replacing it. A black ground
   would hide the room, which is the thing being sold.

   SCANLINES. Dropped. Over a photograph of a wedding they read as a
   broken screen, not as an effect.
   ============================================================ */

/* Palette, as raw channels — the canvas needs numbers, not tokens.

   Two passes to get here. The first ran a near-white core against
   --color-accent and read as cold stage haze — both channels washed
   to the same white under `screen`. The second overcorrected into
   gold and champagne, which was warm but heavy.

   This is the settle. The core is --color-cream, a WARM white: it
   reads as white, which is what the hero wants, but it is not the
   blue-grey white of --color-surface that looked cheap. Gold stays
   in, weighted back so it tints rather than leads. The cool channel
   returns to --color-accent for lift.

   The order of weights is the whole balance — core brightest, cool
   second, gold last as an undertone. */
const CORE = '244, 241, 234' /* --color-cream, a warm white */
const PEWTER = '154, 163, 172' /* --color-accent */
const GOLD = '178, 140, 58' /* --color-gold */

export default function HolographicBeams({
  density = 18,
  speed = 1,
  aberration = 3,
  opacity = 88,
  direction = 'up',
  className = '',
}) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let time = 0
    let raf = 0
    let visible = true

    /* Cheap organic noise: three sines at different frequencies.
       No library, and stable enough that beams breathe rather than
       flicker. */
    const noise = (x, t) =>
      (Math.sin(x * 0.01 + t) +
        Math.sin(x * 0.03 + t * 2) * 0.5 +
        Math.sin(x * 0.1 + t * 4) * 0.25) /
      1.75

    /* The original sized the backing store to CSS pixels, so every
       beam edge was resampled up on a phone — and phones are most of
       this site's traffic. Size to DPR, capped at 2: past that the
       cost is real and the beams are blurred anyway. */
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = container.offsetWidth
      height = container.offsetHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    /* One shaft: narrow at the source, spreading and fading toward the
       tip. `down` is the same trapezoid mirrored — the source edge and
       the direction of travel swap, nothing else does, so the movement
       stays exactly the reference's. */
    const down = direction === 'down'

    const drawBeam = (x, t, color, widthMod) => {
      const n = noise(x, t * 0.5)
      const beamHeight = height * (0.6 + n * 0.4)
      const beamWidth = (width / density) * widthMod

      const source = down ? 0 : height
      const tip = down ? beamHeight : height - beamHeight

      const gradient = ctx.createLinearGradient(x, source, x, tip)
      gradient.addColorStop(0, color)
      gradient.addColorStop(1, 'transparent')

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.moveTo(x - beamWidth / 2, source)
      ctx.lineTo(x + beamWidth / 2, source)
      ctx.lineTo(x + beamWidth, tip)
      ctx.lineTo(x - beamWidth, tip)
      ctx.fill()
    }

    const paint = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'screen'

      const step = width / density

      for (let i = 0; i <= density; i++) {
        const x = i * step

        // Gold — the warm undertone, no longer leading
        const gAlpha = (opacity / 100) * (0.5 + 0.5 * Math.cos(i * 0.5 + time))
        drawBeam(x - aberration, time + i * 0.1, `rgba(${GOLD}, ${gAlpha * 0.42})`, 1.5)

        // Pewter, shifted the other way — the cool counterpoint
        const pAlpha = (opacity / 100) * (0.5 + 0.5 * Math.sin(i * 0.6 + time * 1.1))
        drawBeam(x + aberration, time + i * 0.12 + 10, `rgba(${PEWTER}, ${pAlpha * 0.5})`, 1.5)

        // Warm-white core, thinner — the structure the split hangs off
        const cAlpha = (opacity / 100) * (0.6 + 0.4 * Math.sin(i * 0.3 - time))
        drawBeam(x, time + i * 0.1 + 5, `rgba(${CORE}, ${cAlpha * 0.34})`, 0.8)
      }
    }

    const loop = () => {
      time += 0.01 * speed
      paint()
      raf = requestAnimationFrame(loop)
    }

    resize()

    // Honour the setting the rest of the site honours: one static
    // frame, no loop at all.
    if (reduce) {
      time = 4
      paint()
      const ro = new ResizeObserver(() => {
        resize()
        paint()
      })
      ro.observe(container)
      return () => ro.disconnect()
    }

    /* The hero is one screen tall and the page is nine. Left running,
       this would burn a frame budget for the entire scroll on content
       nobody is looking at. */
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting === visible) return
        visible = entry.isIntersecting
        if (visible) {
          raf = requestAnimationFrame(loop)
        } else {
          cancelAnimationFrame(raf)
          raf = 0
        }
      },
      { threshold: 0 },
    )
    io.observe(container)

    // ResizeObserver over window.resize: on mobile the URL bar
    // collapsing changes the hero's height without a resize event.
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    raf = requestAnimationFrame(loop)

    return () => {
      io.disconnect()
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [density, speed, aberration, opacity, direction, reduce])

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ mixBlendMode: 'screen' }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" style={{ filter: 'blur(4px)' }} />
    </div>
  )
}
