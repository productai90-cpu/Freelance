/* ============================================================
   HALL PROFILE — the only file you edit to re-skin this template
   for a new client. Everything user-facing reads from here.
   ============================================================ */

export const hall = {
  name: 'مرمر',
  fullName: 'تالار پذیرایی مرمر',
  kicker: 'تالار پذیرایی',

  // The hero line. Kept short on purpose — one emotional idea, no more.
  tagline: 'آغازی که در سنگ می‌ماند',
  heroSub: 'تالاری آرام و مدرن، برای شبی که سال‌ها از آن گفته می‌شود.',

  // Landline first — it is the number a hall answers during office hours.
  phone: '۰۱۱ ۵۲۳۸ ۵۶۷۸',
  phoneHref: '+981152385678',
  mobile: '۰۹۱۱ ۱۹۱ ۴۴۷۵',
  mobileHref: '+989111914475',

  instagram: 'talar_marmar',
  instagramUrl: 'https://instagram.com/talar_marmar',
  address: 'مازندران، نوشهر، نیرنگ، تالار مرمر',
  hours: 'همه‌روزه ۱۰ تا ۲۰',
  capacity: 'تا ۱۲۰۰ نفر',

  // Footer credit
  credit: { label: 't.me/Rezmajidi', url: 'https://t.me/Rezmajidi' },
}

/* ============================================================
   INQUIRY FORM ENDPOINT
   ------------------------------------------------------------
   GitHub Pages has no backend, so the public form posts to a
   serverless form service.

   TO GO LIVE:
     1. Create a free form at https://formspree.io
     2. Paste your endpoint below, replacing the placeholder.

   While this stays as the placeholder the form runs in demo-only
   mode: it skips the network call and still files the lead into
   the manager inbox, so the demo never depends on a third party.
   ============================================================ */

export const FORM_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID'

export const isFormLive =
  FORM_ENDPOINT.startsWith('https://') && !FORM_ENDPOINT.includes('YOUR_FORM_ID')
