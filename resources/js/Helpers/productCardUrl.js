/**
 * Product-card URL detection helper (client-side only, no API call).
 *
 * Restores the behavior of the old TipTap `ProductCardNode` paste rule
 * (resources/js/Components/ProductCardNode.jsx, now dead code) WITHOUT
 * reintroducing TipTap: given a plain string, decide whether it is — in full —
 * a product URL on THIS site's own origin, in the canonical
 * `/product/{public_id}/{slug?}` shape, and pull the parts straight out of the
 * URL path. The `public_id`/`slug` come from the URL itself; nothing is fetched.
 *
 * Kept faithful to the old paste rule's detection:
 *   - the site host is resolved dynamically (Ziggy's configured app URL first,
 *     then window.location.origin) — never a hardcoded domain, so it works
 *     across local/staging/prod;
 *   - the public_id must match the strict `prd_` + lowercase-UUID shape the old
 *     regex captured (stricter than the runtime consumers' `startsWith('prd_')`,
 *     and a safe superset of them);
 *   - host is compared protocol-agnostically (the old rule matched
 *     `https?://{host}`), so a link copied over http still converts.
 */

// Strict product public_id shape — verbatim from the old ProductCardNode paste
// rule's capture group: prd_ + a lowercase (v4-style) UUID.
const PUBLIC_ID_RE =
    /^prd_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Resolve this site's host the same way the old paste rule did: prefer Ziggy's
// configured app URL (route().t?.url), fall back to the current window origin.
// Wrapped defensively so a paste never throws from Ziggy internals.
function getAppHost() {
    let appUrl;
    try {
        appUrl =
            (typeof route === 'function' && route()?.t?.url) ||
            window.location.origin;
    } catch {
        appUrl = window.location.origin;
    }
    try {
        return new URL(appUrl).host;
    } catch {
        return window.location.host;
    }
}

/**
 * Returns { publicId, slug } when `text` (trimmed) is, in full, a product URL on
 * this site in the /product/{public_id}/{slug?} shape; otherwise null.
 */
export function matchProductCardUrl(text) {
    if (typeof text !== 'string') return null;
    const trimmed = text.trim();
    if (!trimmed) return null;

    let url;
    try {
        url = new URL(trimmed);
    } catch {
        return null; // not an absolute URL -> let it paste normally
    }

    // This site only (host match, protocol-agnostic — mirrors the old rule).
    if (url.host !== getAppHost()) return null;

    // Path shape: /product/{public_id}/{slug?}
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 2 || parts[0] !== 'product') return null;

    let publicId;
    let slug;
    try {
        publicId = decodeURIComponent(parts[1]);
        slug = parts[2] ? decodeURIComponent(parts[2]) : '';
    } catch {
        return null; // malformed percent-encoding
    }

    // Strict public_id validation (verbatim shape from the old paste rule).
    if (!PUBLIC_ID_RE.test(publicId)) return null;

    return { publicId, slug };
}

/**
 * Builds the exact product-card markup the frontend's hasProductCards()
 * detection + useProductCardHydration portal rendering expect.
 */
export function buildProductCardMarkup({ publicId, slug }) {
    const safeId = String(publicId ?? '');
    const safeSlug = String(slug ?? '');
    return `<div data-public-id="${safeId}" data-slug="${safeSlug}" data-type="product-card"></div>`;
}
