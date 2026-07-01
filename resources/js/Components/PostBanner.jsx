import React from 'react';

/**
 * Per-post banner ad (single post page only). Simple, domain-agnostic, reusable
 * across every single-post render spot (dashboard show + public single-post view).
 *
 * Renders NOTHING unless both imageUrl and redirectUrl are non-empty AND the
 * banner's position matches the requested slot (`place`). When position is empty
 * it defaults to 'top'. The image is clickable and opens the redirect in a new
 * tab using the project's safe external-link convention.
 *
 * Props:
 *  - imageUrl    : banner image URL (a copied internal product image CDN URL)
 *  - redirectUrl : clickable destination URL (opens in a new tab)
 *  - position    : 'top' | 'bottom' (where the admin chose to show it)
 *  - place       : 'top' | 'bottom' (which slot is rendering this instance)
 */
export default function PostBanner({ imageUrl, redirectUrl, position, place = 'top' }) {
    const image = typeof imageUrl === 'string' ? imageUrl.trim() : '';
    const redirect = typeof redirectUrl === 'string' ? redirectUrl.trim() : '';

    // Gate: both URLs required, else render nothing (never an empty <a>/<img>).
    if (!image || !redirect) return null;

    // Empty position defaults to 'top'.
    const effectivePosition = position === 'bottom' ? 'bottom' : 'top';
    if (effectivePosition !== place) return null;

    return (
        <a
            href={redirect}
            target="_blank"
            rel="noopener noreferrer"
            className="my-3 block overflow-hidden rounded-md"
        >
            <img src={image} alt="" loading="lazy" className="h-auto w-full rounded-md" />
        </a>
    );
}
