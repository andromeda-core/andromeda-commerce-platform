import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ProductCardView from '@/Components/ProductCardView';

export const useProductCardHydration = (containerRef, contentKey) => {
    const [placeholders, setPlaceholders] = useState([]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (!containerRef.current) {
                setPlaceholders([]);
                return;
            }

            const elements = containerRef.current.querySelectorAll(
                'div[data-type="product-card"]'
            );

            const found = [];
            elements.forEach((el, index) => {
                const publicId = el.getAttribute('data-public-id');
                const slug = el.getAttribute('data-slug');

                if (!publicId || !publicId.startsWith('prd_')) return;

                // Skip placeholders nested inside <p> or other inline contexts
                // where block-level card content would produce invalid DOM nesting.
                if (el.closest('p')) return;

                // Clear placeholder content so the portal renders cleanly
                el.innerHTML = '';

                found.push({
                    element: el,
                    publicId,
                    slug,
                    key: `${contentKey}-${publicId}-${index}`,
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

    return placeholders.map(({ element, publicId, slug, key }) =>
        createPortal(
            <ProductCardView publicId={publicId} slug={slug} />,
            element,
            key
        )
    );
};

export default useProductCardHydration;
