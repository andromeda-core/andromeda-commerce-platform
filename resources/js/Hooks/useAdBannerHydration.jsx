import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import AdBannerView from '@/Components/AdBannerView';

/**
 * Mirrors useProductCardHydration.jsx exactly, scoped to ad-banner markers
 * (`div[data-type="ad-banner"]`) instead of product cards.
 */
export const useAdBannerHydration = (containerRef, contentKey) => {
    const [placeholders, setPlaceholders] = useState([]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (!containerRef.current) {
                setPlaceholders([]);
                return;
            }

            const elements = containerRef.current.querySelectorAll(
                'div[data-type="ad-banner"]'
            );

            const found = [];
            elements.forEach((el, index) => {
                const adId = el.getAttribute('data-ad-id');

                if (!adId || !adId.startsWith('ad_')) return;

                // Skip placeholders nested inside <p> or other inline contexts
                // where block-level banner content would produce invalid DOM nesting.
                if (el.closest('p')) return;

                // Clear placeholder content so the portal renders cleanly
                el.innerHTML = '';

                found.push({
                    element: el,
                    adId,
                    key: `${contentKey}-${adId}-${index}`,
                });
            });

            setPlaceholders(found);
        }, 50);

        return () => {
            clearTimeout(timeoutId);
            setPlaceholders([]);
        };
    }, [contentKey]);
    // containerRef intentionally NOT in deps — stable by React contract

    return placeholders.map(({ element, adId, key }) =>
        createPortal(<AdBannerView adId={adId} />, element, key)
    );
};

export default useAdBannerHydration;
