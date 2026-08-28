/* ============================================================
   ICON BUILD — one SVG in, every raster a phone asks for out.

   An SVG favicon alone is desktop-only thinking. Android's "add to
   home screen", iOS Safari, and the in-app browsers inside Telegram,
   Instagram and WhatsApp all ignore `rel="icon" type="image/svg+xml"`
   and go looking for a PNG, an apple-touch-icon, or /favicon.ico.
   Find none and they substitute something of their own — which is
   how the host app's own logo ends up standing in for the site.

   Run: npm run icons   (only needed when public/favicon.svg changes)
   ============================================================ */

import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, 'public')

const svg = await readFile(join(pub, 'favicon.svg'), 'utf8')

/* iOS masks the icon into its own squircle. Feeding it our rounded
   rect would round already-rounded corners and leave four transparent
   notches, so the touch icon gets square edges and its own opaque
   backdrop instead. */
const touchSvg = svg
  .replace(/ rx="10"/g, '')
  .replace(/ rx="9"/g, '')

const render = (source, size) =>
  sharp(Buffer.from(source), { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer()

/* ICO is a directory of images; each entry may hold a whole PNG, which
   every browser that still asks for favicon.ico understands. */
const ico = (pngs) => {
  const head = Buffer.alloc(6)
  head.writeUInt16LE(0, 0)
  head.writeUInt16LE(1, 2)
  head.writeUInt16LE(pngs.length, 4)

  let offset = 6 + pngs.length * 16
  const entries = pngs.map(({ size, data }) => {
    const e = Buffer.alloc(16)
    e.writeUInt8(size >= 256 ? 0 : size, 0)
    e.writeUInt8(size >= 256 ? 0 : size, 1)
    e.writeUInt8(0, 2)
    e.writeUInt8(0, 3)
    e.writeUInt16LE(1, 4)
    e.writeUInt16LE(32, 6)
    e.writeUInt32LE(data.length, 8)
    e.writeUInt32LE(offset, 12)
    offset += data.length
    return e
  })

  return Buffer.concat([head, ...entries, ...pngs.map((p) => p.data)])
}

const written = []
const emit = async (name, data) => {
  await writeFile(join(pub, name), data)
  written.push(`${name} — ${(data.length / 1024).toFixed(1)}kB`)
}

for (const size of [192, 512]) {
  await emit(`icon-${size}.png`, await render(svg, size))
}
await emit('apple-touch-icon.png', await render(touchSvg, 180))

/* Doubles as the og:image. Link previews want a landscape card, and a
   square one gets cropped to a thumbnail beside the title. */
await emit(
  'og-image.png',
  await sharp({
    create: { width: 1200, height: 630, channels: 4, background: '#2E3236' },
  })
    .composite([{ input: await render(svg, 320) }])
    .png({ compressionLevel: 9 })
    .toBuffer()
)

await emit(
  'favicon.ico',
  ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await render(svg, size) }))))
)

console.log(written.join('\n'))
