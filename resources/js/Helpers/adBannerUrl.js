/**
 * Ad-banner embed marker helper (mirrors resources/js/Helpers/productCardUrl.js's
 * buildProductCardMarkup exactly, scoped to ad banners instead of product cards).
 *
 * Builds the exact ad-banner markup the frontend's useAdBannerHydration portal
 * rendering expects: a `<div data-ad-id="..." data-type="ad-banner"></div>` DOM
 * marker, NOT a bracket `[shortcode]` syntax.
 */
export function buildAdBannerMarkup({ publicId }) {
    const safeId = String(publicId ?? '');
    return `<div data-ad-id="${safeId}" data-type="ad-banner"></div>`;
}

// Strict ad-banner shortcode shape — mirrors productCardUrl.js's PUBLIC_ID_RE strictness
// exactly (ad_ + a lowercase v4-style UUID), rather than a loose 36-char superset, so a
// malformed or non-UUID-shaped "ad_..." string can never be mistaken for a real shortcode.
const AD_BANNER_SHORTCODE_RE =
    /^ad_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Matches a BARE Ad Banner shortcode/public_id pasted or typed directly into content,
 * e.g. "ad_a1b2c3d4-5678-90ab-cdef-1234567890ab" — this IS the shortcode, no URL wrapper
 * required. The whole (trimmed) input must be exactly the shortcode, same strictness as
 * matchProductCardUrl requiring the whole pasted text to be, in full, a product URL.
 */
export function matchAdBannerShortcode(text) {
    if (typeof text !== 'string') return null;
    const trimmed = text.trim();
    if (!trimmed) return null;
    if (!AD_BANNER_SHORTCODE_RE.test(trimmed)) return null;
    return { publicId: trimmed };
}
