// Single source of truth (frontend) for right-to-left language codes. Twin of the backend list in
// app/Services/OpenAi.php (RTL_LOCALE_CODES). Intentionally a small hardcoded list — no schema
// change — matching the existing `activeLanguageLocale === 'ar'` pattern, generalized so it's
// defined once and reused on every render surface. ar = Arabic, ur = Urdu (primary use cases on
// this platform); the rest are included for completeness. To support more RTL languages later,
// add one line here and one line in the backend list.
export const RTL_LOCALE_CODES = ['ar', 'ur', 'he', 'fa', 'ps', 'sd', 'yi'];

export const isRtlLocale = (code) =>
    typeof code === 'string' && RTL_LOCALE_CODES.includes(code.toLowerCase());
