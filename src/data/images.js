/* ============================================================
   IMAGE REGISTRY

   content.js stores image KEYS, never paths. Vite rewrites these
   imports to hashed URLs at build time; keeping them in one file
   means content stays free of bundler concerns and every asset
   has exactly one name the whole app agrees on.
   ============================================================ */

import menuAppetizer from '../assets/images/menu-appetizer.webp'
import menuMain from '../assets/images/menu-main.webp'
import menuPlated from '../assets/images/menu-plated.webp'
import menuDessert from '../assets/images/menu-dessert.webp'
import menuSweets from '../assets/images/menu-sweets.webp'
import aboutHall from '../assets/images/about-hall.webp'
import aboutCouple from '../assets/images/about-couple.webp'
import couple1 from '../assets/images/couple-1.webp'
import couple2 from '../assets/images/couple-2.webp'
import couple3 from '../assets/images/couple-3.webp'
import couple4 from '../assets/images/couple-4.webp'
import couple5 from '../assets/images/couple-5.webp'
import celebrationStrip from '../assets/images/celebration-strip.webp'
import testimonialsBg from '../assets/images/testimonials-bg.webp'

export const IMAGES = {
  // پذیرایی
  appetizer: menuAppetizer,
  main: menuMain,
  plated: menuPlated,
  dessert: menuDessert,
  sweets: menuSweets,

  // دربارهٔ ما
  aboutHall,
  aboutCouple,

  // زوج‌ها
  couple1,
  couple2,
  couple3,
  couple4,
  couple5,

  // نوارهای تمام‌عرض
  celebrationStrip,
  testimonialsBg,
}

/** Key -> URL, falling back to the plated shot rather than a broken img. */
export const img = (key) => IMAGES[key] ?? menuPlated
