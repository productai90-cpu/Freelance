import { toFa } from './digits.js'

/* Money formatting lives ONLY here, and only the admin bundle imports
   it. Keeping it out of digits.js is what keeps currency vocabulary
   from shipping in the public bundle. */

/** 45000000 -> "۴۵٬۰۰۰٬۰۰۰" (Persian thousands separator) */
export const faNumber = (n) => toFa(Number(n).toLocaleString('en-US')).replace(/,/g, '٬')

/** 45000000 -> "۴۵٬۰۰۰٬۰۰۰ تومان" */
export const toman = (n) => `${faNumber(n)} تومان`
