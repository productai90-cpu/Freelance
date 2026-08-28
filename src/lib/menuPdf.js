/* ============================================================
   MENU → PDF

   Persian is a shaped, right-to-left script. jsPDF's text layer
   does neither: it draws glyphs in code-point order with no
   joining, so `چلوکباب` comes out as disconnected letters in
   reverse. The only dependable fix in the browser is to let the
   BROWSER do the shaping — lay the menu out in real DOM, snapshot
   it to a canvas, and place the snapshot on the page.

   So this module builds an off-screen A4-width document, renders
   each sheet, shrinks the set uniformly if any sheet overruns a
   page, and snapshots them one page at a time. The
   libraries are dynamically imported: a visitor who never presses
   the button never downloads them.
   ============================================================ */

import { ICON_SHAPES, SVG_PROPS } from '../components/ServiceIcons.jsx'
import { menu, celebration } from '../data/content.js'
import { img } from '../data/images.js'
import { toFa } from './digits.js'
import estedadUrl from '../assets/fonts/Estedad-Variable.woff2'
import vazirmatnUrl from '../assets/fonts/Vazirmatn-Variable.woff2'

/* A4 at 96dpi. 210mm wide, so 1px here is 210/794 mm on the page. */
const PAGE_W = 794
const PAGE_H = 1123
const MM_PER_PX = 210 / PAGE_W
const SCALE = 2 // snapshot at 2× so type stays crisp when printed

/* Palette — mirrors the @theme tokens in styles/index.css. Written
   as literal hex on purpose: the snapshot must not depend on
   Tailwind utilities or color-mix() resolving inside the clone. */
const C = {
  base: '#e8eaec',
  surface: '#fbfcfd',
  cream: '#f4f1ea',
  ink: '#2e3236',
  muted: '#6b7178',
  accent: '#9aa3ac',
  accentDeep: '#6e777f',
  line: '#c7cdd2',
  white: '#ffffff',
}

/* Deliberately NOT the site's font stack.

   html2canvas draws a word in one call only while the whole word sits
   in one font. The moment a range over a word returns more than one
   client rect — which is exactly what a mid-word fallback produces —
   it gives up and draws the word letter by letter instead. In Persian
   that severs every join, and the word arrives in the PDF as a row of
   loose letters. It showed up on phones first because that is where a
   fallback was likeliest: `system-ui` is Roboto on Android, which has
   no Arabic at all, and the snapshot is taken inside a cloned iframe
   that has to fetch the webfonts a second time.

   So the booklet gets its own two faces, embedded as data URIs under
   private names and awaited before anything is measured. Nothing to
   re-fetch in the clone, nothing to fall back to. */
const FONT = "'Vazirmatn PDF', sans-serif"
const DISPLAY = "'Estedad PDF', sans-serif"

const EMBEDDED_FACES = [
  { family: 'Vazirmatn PDF', url: vazirmatnUrl },
  { family: 'Estedad PDF', url: estedadUrl },
]

/* Read once, kept for the rest of the session — the second download
   of the booklet should not re-encode a quarter of a megabyte. */
let facesCss = null

async function embeddedFontCss() {
  if (facesCss) return facesCss

  const faces = await Promise.all(
    EMBEDDED_FACES.map(async ({ family, url }) => {
      const bytes = new Uint8Array(await (await fetch(url)).arrayBuffer())
      let binary = ''
      // In chunks: one spread of 120k arguments overflows the stack.
      for (let i = 0; i < bytes.length; i += 8192) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192))
      }
      return `@font-face{font-family:'${family}';src:url(data:font/woff2;base64,${btoa(
        binary,
      )}) format('woff2');font-weight:100 900;font-style:normal;font-display:block}`
    }),
  )

  facesCss = faces.join('')
  return facesCss
}

/* ------------------------------------------------------------
   Icons — the same stroke data the site draws, flattened to
   static SVG markup (no motion, nothing to animate in a snapshot).
   ------------------------------------------------------------ */
function iconSvg(name, size = 20, color = C.accentDeep) {
  const shapes = ICON_SHAPES[name] ?? ICON_SHAPES.sparkle
  const body = shapes
    .map((s) =>
      s.t === 'circle'
        ? `<circle cx="${s.cx}" cy="${s.cy}" r="${s.r}"/>`
        : `<path d="${s.d}"/>`,
    )
    .join('')

  return `<svg width="${size}" height="${size}" viewBox="${SVG_PROPS.viewBox}" fill="none"
    stroke="${color}" stroke-width="${SVG_PROPS.strokeWidth}"
    stroke-linecap="${SVG_PROPS.strokeLinecap}" stroke-linejoin="${SVG_PROPS.strokeLinejoin}"
    style="display:block;flex:none">${body}</svg>`
}

const esc = (v = '') =>
  String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/* ------------------------------------------------------------
   Sheets
   ------------------------------------------------------------ */

function coverSheet() {
  const p = menu.pdf

  return `
    <div style="min-height:${PAGE_H}px;display:flex;flex-direction:column;background:${C.surface}">
      <div style="height:340px;overflow:hidden;position:relative;background:${C.base}">
        <img src="${img('celebrationStrip')}" alt="" crossorigin="anonymous"
          style="width:100%;height:100%;object-fit:cover;filter:saturate(0.82) contrast(1.01)"/>
        <div style="position:absolute;inset:0;background:${C.base};opacity:0.28"></div>
      </div>

      <div style="flex:1;padding:64px 72px 0;display:flex;flex-direction:column">
        <p style="margin:0;font-size:13px;font-weight:500;color:${C.accentDeep};word-spacing:0.35em">
          ${esc(p.brand)}
        </p>

        <h1 style="margin:18px 0 0;font-family:${DISPLAY};font-size:52px;font-weight:300;
          line-height:1.4;color:${C.ink}">${esc(p.coverTitle)}</h1>

        <div style="margin-top:26px;height:1px;width:120px;
          background:linear-gradient(90deg, ${C.accent}, ${C.line}, transparent)"></div>

        <p style="margin:30px 0 0;max-width:520px;font-size:16px;line-height:2.1;color:${C.muted}">
          ${esc(p.coverNote)}
        </p>

        <div style="margin-top:52px;display:flex;gap:14px">
          ${menu.packages
            .map(
              (pk, i) => `
            <div style="flex:1;border:1px solid ${C.line};background:${
              i === 1 ? C.cream : C.white
            };padding:22px 18px">
              ${iconSvg(pk.icon, 30)}
              <p style="margin:14px 0 0;font-family:${DISPLAY};font-size:18px;color:${C.ink}">
                ${esc(pk.name)}</p>
              <p style="margin:6px 0 0;font-size:12.5px;color:${C.muted}">${esc(pk.tag)}</p>
            </div>`,
            )
            .join('')}
        </div>

        <p style="margin:44px 0 0;font-size:14px;line-height:2;color:${C.accentDeep}">
          ${esc(p.coverContact)}
        </p>
      </div>

      <div style="padding:28px 72px 40px">
        <div style="height:1px;background:${C.line}"></div>
        <p style="margin:16px 0 0;font-size:12.5px;color:${C.muted}">
          ${esc(celebration.line)}
        </p>
      </div>
    </div>`
}

function groupBlock(g) {
  const items = g.items
    .map(
      (it) => `
      <li style="display:flex;align-items:flex-start;gap:9px;margin-bottom:6px;list-style:none">
        <span style="flex:none;width:4px;height:4px;border-radius:50%;background:${C.accent};
          margin-top:11px"></span>
        <span style="font-size:14px;line-height:1.85;color:${C.ink}">
          ${esc(it.name)}${
            it.note
              ? `<span style="color:${C.muted};font-size:12.5px"> — ${esc(it.note)}</span>`
              : ''
          }
        </span>
      </li>`,
    )
    .join('')

  return `
    <div style="break-inside:avoid;margin-bottom:17px">
      <div style="display:flex;align-items:center;gap:10px">
        ${iconSvg(g.icon, 22)}
        <h3 style="margin:0;font-family:${DISPLAY};font-size:17px;font-weight:400;color:${C.ink}">
          ${esc(g.title)}</h3>
        <span style="flex:1;height:1px;background:${C.line}"></span>
      </div>
      ${
        g.note
          ? `<p style="margin:9px 0 0;font-size:12.5px;line-height:1.9;color:${C.accentDeep}">${esc(
              g.note,
            )}</p>`
          : ''
      }
      <ul style="margin:10px 0 0;padding:0">${items}</ul>
    </div>`
}

function packageSheet(pk, index) {
  const facts = pk.facts
    .map(
      (f) => `
      <div style="flex:1 1 0;min-width:0;padding:11px 14px;background:${C.white};border:1px solid ${C.line}">
        <p style="margin:0;font-size:11.5px;color:${C.muted}">${esc(f.label)}</p>
        <p style="margin:5px 0 0;font-size:15px;color:${C.ink}">${esc(f.value)}</p>
      </div>`,
    )
    .join('')

  return `
    <div style="min-height:${PAGE_H}px;background:${C.surface};display:flex;flex-direction:column">
      <div style="height:182px;overflow:hidden;position:relative;background:${C.base}">
        <img src="${img(pk.image)}" alt="" crossorigin="anonymous"
          style="width:100%;height:100%;object-fit:cover;filter:saturate(0.82) contrast(1.01)"/>
        <div style="position:absolute;inset:0;background:${C.base};opacity:0.2"></div>
      </div>

      <div style="padding:26px 62px 0">
        <div style="display:flex;align-items:flex-start;gap:16px">
          ${iconSvg(pk.icon, 40)}
          <div style="flex:1">
            <h2 style="margin:0;font-family:${DISPLAY};font-size:32px;font-weight:300;color:${
              C.ink
            }">${esc(pk.name)}</h2>
            <p style="margin:7px 0 0;font-size:13.5px;color:${C.accentDeep}">${esc(pk.tag)}</p>
          </div>
          <span style="font-size:12px;color:${C.muted};padding-top:8px">${esc(
            menu.pdf.brand,
          )} — ${toFa(index + 1)} از ${toFa(menu.packages.length)}</span>
        </div>

        <p style="margin:14px 0 0;font-size:14.5px;line-height:2;color:${C.muted};max-width:560px">
          ${esc(pk.summary)}
        </p>

        <div style="margin-top:16px;display:flex;gap:10px">${facts}</div>

        <div style="margin-top:22px;column-count:2;column-gap:34px">
          ${pk.groups.map(groupBlock).join('')}
        </div>
      </div>

      <div style="margin-top:auto;padding:16px 62px 24px">
        <div style="height:1px;background:${C.line}"></div>
        <p style="margin:14px 0 0;font-size:12px;line-height:1.9;color:${C.muted}">
          ${esc(menu.note)}
        </p>
      </div>
    </div>`
}

/* ------------------------------------------------------------
   Render
   ------------------------------------------------------------ */

/* How far past a page a sheet may run before it is squashed onto one
   page instead, and how far the whole booklet may be shrunk to make
   every sheet fit. Below MIN_FIT the type would stop being print-
   legible, so an unusually long menu is sliced instead. */
const SQUASH_TOLERANCE = 1.02
const MIN_FIT = 0.76

/**
 * One package per page, always.
 *
 * The menu is sample content today and the hall will paste its real
 * one in later, so the sheet height cannot be hand-tuned — a couple
 * of extra dishes would push a two-line orphan onto its own page and
 * the booklet would stop looking deliberate. Instead every sheet is
 * measured, and if the longest overflows, ALL of them are zoomed by
 * the same factor. One factor, not one per sheet: differing type
 * sizes between pages would read as a mistake.
 *
 * `zoom` rather than `transform: scale()` — zoom genuinely reflows
 * the layout, so the snapshot is of real text at a smaller size
 * rather than a rescaled bitmap.
 */
function fitSheetsToPage(sheets) {
  const tallest = Math.max(...sheets.map((el) => el.getBoundingClientRect().height))
  if (tallest <= PAGE_H * SQUASH_TOLERANCE) return 1

  const k = PAGE_H / tallest
  if (k < MIN_FIT) return 1 // too long to shrink legibly — let it slice

  for (const el of sheets) {
    el.style.zoom = String(k)
    // The section is zoomed, so its CSS width and the sheet's page
    // height must be pre-divided to still land on 794 × 1123 device px.
    el.style.width = `${PAGE_W / k}px`
    if (el.firstElementChild) el.firstElementChild.style.minHeight = `${PAGE_H / k}px`
  }
  return k
}

/** Resolve when every <img> under `root` has actually decoded. */
async function imagesReady(root) {
  const shots = [...root.querySelectorAll('img')]
  await Promise.all(
    shots.map((el) =>
      el.complete && el.naturalWidth
        ? Promise.resolve()
        : new Promise((res) => {
            el.addEventListener('load', res, { once: true })
            // A missing image must not hang the download — carry on without it.
            el.addEventListener('error', res, { once: true })
          }),
    ),
  )
}

/**
 * Build the whole booklet — cover plus every package — as one PDF
 * and hand it to the browser as a download.
 *
 * @param {Array} packages defaults to all three
 */
export async function downloadMenuPdf(packages = menu.packages) {
  const [{ jsPDF }, html2canvas] = await Promise.all([
    import('jspdf'),
    import('html2canvas-pro').then((m) => m.default ?? m),
  ])

  const style = document.createElement('style')
  style.textContent = await embeddedFontCss()
  document.head.appendChild(style)

  const stage = document.createElement('div')
  stage.setAttribute('dir', 'rtl')
  stage.setAttribute('lang', 'fa')
  /* text-size-adjust: a 794px stage on a 390px phone is exactly the
     shape Android's font boosting looks for, and boosted type would
     reflow every sheet out of its page. */
  stage.style.cssText = `position:fixed;top:0;right:-${PAGE_W + 200}px;width:${PAGE_W}px;
    font-family:${FONT};font-weight:350;background:${C.surface};z-index:-1;pointer-events:none;
    -webkit-text-size-adjust:100%;text-size-adjust:100%;`

  const sheets = [coverSheet(), ...packages.map(packageSheet)]
  stage.innerHTML = sheets
    .map((html) => `<section style="width:${PAGE_W}px">${html}</section>`)
    .join('')

  document.body.appendChild(stage)

  /* fonts.ready alone only promises that the loads already in flight
     have settled — a face nothing has painted yet is not in flight.
     Ask for these two by name, against a Persian sample, so they are
     genuinely resolved before a single line is measured. */
  if (document.fonts?.load) {
    await Promise.all([
      document.fonts.load(`350 16px 'Vazirmatn PDF'`, 'آزمایش'),
      document.fonts.load(`300 32px 'Estedad PDF'`, 'آزمایش'),
    ])
    await document.fonts.ready
  }

  try {
    await imagesReady(stage)
    fitSheetsToPage([...stage.children])

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const sliceH = PAGE_H * SCALE
    let first = true

    const place = (source, sx, sh, heightMm) => {
      const part = document.createElement('canvas')
      part.width = source.width
      part.height = sh
      const ctx = part.getContext('2d')
      ctx.fillStyle = C.surface
      ctx.fillRect(0, 0, part.width, part.height)
      ctx.drawImage(source, 0, sx, source.width, sh, 0, 0, source.width, sh)

      if (!first) pdf.addPage()
      first = false
      pdf.addImage(part.toDataURL('image/jpeg', 0.94), 'JPEG', 0, 0, 210, heightMm, undefined, 'FAST')
    }

    for (const node of stage.children) {
      const canvas = await html2canvas(node, {
        scale: SCALE,
        backgroundColor: C.surface,
        useCORS: true,
        logging: false,
        windowWidth: PAGE_W,
      })

      if (canvas.height <= sliceH * SQUASH_TOLERANCE) {
        /* One package, one page. A sheet that lands a hair over the
           page after `fitSheetsToPage` is absorbed here rather than
           spilling a two-line orphan page onto the next sheet. */
        place(canvas, 0, canvas.height, Math.min(297, (canvas.height / SCALE) * MM_PER_PX))
      } else {
        // Only reachable for a menu far longer than the shrink cap
        // allows. Slicing beats truncating.
        const slices = Math.ceil(canvas.height / sliceH)
        for (let i = 0; i < slices; i++) {
          const h = Math.min(sliceH, canvas.height - i * sliceH)
          place(canvas, i * sliceH, h, (h / SCALE) * MM_PER_PX)
        }
      }
    }

    pdf.save(menu.pdf.fileName)
  } finally {
    stage.remove()
    style.remove()
  }
}
