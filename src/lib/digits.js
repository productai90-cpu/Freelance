/* Persian numerals. Latin digits inside a Persian luxury interface
   read as unfinished, so every number rendered to screen goes
   through here. */

const FA = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export const toFa = (input) => String(input ?? '').replace(/\d/g, (d) => FA[+d])

export const toEn = (input) =>
  String(input ?? '').replace(/[۰-۹]/g, (d) => String(FA.indexOf(d)))
