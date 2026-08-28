<div dir="rtl">

# تالار پذیرایی مرمر — نمونهٔ نمایشی

</div>

A clickable prototype for selling a website + private booking system to Persian wedding-hall owners. Fully RTL, Jalali calendar, mock data only.

Two parts, one build:

| | |
|---|---|
| **Public site** `#/` | Branding and lead capture. Hero, about, gallery, menu, services, testimonials, inquiry form. |
| **Manager backend** `#/admin` | Mobile-first. Availability calendar, leads inbox, booking detail. Reached via the quiet «ورود مدیر» link in the footer. |

---

## Running locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview  # serve the production build
```

---

## The demo loop

The sequence to walk an owner through, in order:

1. Fill in the استعلام form on the public site and submit.
2. Scroll to the footer → **ورود مدیر**.
3. **سرنخ‌ها** — the inquiry just submitted is at the top, badged «جدید».
4. Tap **تبدیل به رزرو** — it becomes a booking.
5. **تقویم** — that date has flipped آزاد → پیش‌قرار.
6. Tap the date → contract, deposit, remaining balance, and **ارسال یادآوری**.

**بازنشانی دمو** at the foot of the admin screens restores the seed data between meetings.

---

## Connecting the inquiry form

The form posts to [Formspree](https://formspree.io). Until an endpoint is set it runs in demo-only mode — it skips the network call but still files the lead into the manager inbox, so the demo never depends on a third party being reachable.

To receive real leads, edit **one line** in [`src/config.js`](src/config.js):

```js
export const FORM_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID'
```

The form always writes the lead locally *before* attempting the network call, so a failed send still leaves the demo working — and the error state shows the hall's phone number as a fallback rather than dead-ending.

A hidden `_gotcha` honeypot filters bots. Worth keeping: the free Formspree tier allows 50 submissions/month and a widely-shared public link attracts spam.

---

## Re-skinning for a new hall

Everything client-specific lives in [`src/config.js`](src/config.js) — name, tagline, phone, address, Instagram, capacity. Content (menu, services, testimonials, about) is in [`src/data/content.js`](src/data/content.js). Images are in `src/assets/images/`.

A new client should be a config edit, not a rebuild.

---

## Deploying to GitHub Pages

The build is configured for a Pages subpath from the start: `base: './'` for relative assets, hash routing so deep links never 404, and self-hosted fonts so nothing depends on a CDN.

### Deploying

`.github/workflows/deploy.yml` is already set up, and it is the only
way this site ships.

1. Push the repo to GitHub.
2. **Settings → Pages → Source → GitHub Actions**.
3. Every push to `main` redeploys automatically. Nothing else does.

That last sentence is the whole section. There used to be a second,
"manual" option here — an `npm run deploy` script that pushed `dist/`
to a `gh-pages` branch — and it was a trap: Pages is serving the
Actions artifact, so publishing to that branch succeeded, printed
"Published", and changed nothing at all on the live site. Both the
script and the dependency behind it have been removed so the trap
cannot be walked into again.

**To ship: commit to `main` and push.** Then watch the Actions tab, or
just poll the live page until the hashed bundle name in its `<script>`
tag changes.

### Verifying before you ship

The failure mode that only appears once live is a broken asset path under the subpath. To catch it locally, build and serve `dist/` from a **subdirectory** rather than the server root, then confirm in DevTools → Network that the fonts, images, CSS and JS all return 200 — and hard-refresh directly on `#/admin/leads` to confirm the deep link resolves.

---

## Notes

- **`base: './'` is repo-name-agnostic** — renaming the repository will not break the build. Don't replace it with `/repo-name/` unless you have a specific reason.
- **The public site never shows prices or availability.** This is enforced structurally: `src/public-site/` imports nothing from `src/admin/`, and the demo data is loaded by dynamic import so no booking, amount or status label ships in the public bundle. Verify with:
  ```bash
  grep -c "تومان" dist/assets/index-*.js   # expect 0
  ```
- **All backend data is mock** and client names are fictional — this ships to a public URL.
- **Images are WebP**, converted from the source JPGs (3.5 MB → 0.37 MB). Re-run the conversion if you replace them.

---

## Stack

React 19 · Vite 8 · Tailwind 4 · Motion 13 · jalaali-js

Fonts: **Estedad** (display) and **Vazirmatn** (body), self-hosted as variable woff2.
