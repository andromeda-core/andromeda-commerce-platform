import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DisplayPrice from '@/Components/DisplayPrice';
import Spinner from '@/Components/Spinner';
const PLACEHOLDER_IMAGE = '/assets/images/product/placeholder.jpg';
import { useTranslation } from '@/Hooks/useTranslation';

const ProductCardView = ({ publicId, slug = null }) => {
    if (!publicId || typeof publicId !== 'string' || !publicId.startsWith('prd_')) {
        return null;
    }

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [preview, setPreview] = useState(null);

    const { __, loading: translationLoading } = useTranslation();
    const t = (key) => (translationLoading ? key : __(key));

    useEffect(() => {
        if (!publicId) {
            setError(true);
            setLoading(false);
            return;
        }

        axios
            .get(route('website.products.preview', { public_id: publicId }))
            .then((response) => {
                setPreview(response.data);
                setLoading(false);
            })
            .catch(() => {
                setError(true);
                setLoading(false);
            });
    }, [publicId]);

    const productUrl = preview?.exists
        ? `/product/${encodeURIComponent(preview.public_id)}/${encodeURIComponent(preview.slug)}`
        : `/product/${encodeURIComponent(publicId)}${slug ? '/' + encodeURIComponent(slug) : ''}`;

    // STATE 1: loading
    if (loading) {
        return (
            <div className="my-3 flex h-24 animate-pulse items-center gap-3 overflow-hidden rounded-lg border border-surface-3-light bg-surface-1-light dark:border-surface-3-dark dark:bg-surface-2-dark">
                <div className="h-24 w-24 flex-shrink-0 bg-surface-2-light dark:bg-surface-3-dark" />
                <div className="flex flex-1 flex-col gap-2 py-2 pr-3">
                    <div className="h-4 w-3/4 rounded bg-surface-2-light dark:bg-surface-3-dark" />
                    <div className="h-4 w-1/2 rounded bg-surface-2-light dark:bg-surface-3-dark" />
                    <div className="mt-auto flex justify-end">
                        <div className="h-6 w-20 rounded-md bg-surface-2-light dark:bg-surface-3-dark" />
                    </div>
                </div>
                <span className="sr-only">
                    <Spinner customSize={'size-4'} />
                </span>
            </div>
        );
    }

    // STATE 2: network error — plain link fallback
    // STATE 3: deleted product (exists === false) — same plain link fallback
    if (error || (preview && !preview.exists)) {
        const fallbackUrl = `/product/${encodeURIComponent(publicId)}${slug ? '/' + encodeURIComponent(slug) : ''}`;
        return (
            <a href={fallbackUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline break-all">
                {fallbackUrl}
            </a>
        );
    }

    // STATE 4: success
    return (
        <a
            href={productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="my-3 flex items-stretch gap-3 overflow-hidden rounded-lg border border-surface-3-light bg-surface-1-light no-underline transition hover:shadow-md dark:border-surface-3-dark dark:bg-surface-2-dark"
            contentEditable={false}
            data-product-card-link
        >
            {/* Image: 96x96 left */}
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden bg-surface-2-light dark:bg-surface-3-dark">
                <img
                    src={preview.image_url || PLACEHOLDER_IMAGE}
                    alt={preview.name}
                    className="h-full w-full object-cover"
                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                    loading="lazy"
                />
            </div>

            {/* Details: right side */}
            <div className="flex min-w-0 flex-1 flex-col justify-between py-2 pr-3">
                <div className="min-w-0">
                    <h4 className="line-clamp-2 text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                        {preview.name}
                    </h4>
                    <div className="mt-1">
                        <DisplayPrice
                            usdAmount={preview.price_usd}
                            showCode
                            showEstimatedLabel={false}
                            className="text-base font-bold text-main-text-light dark:text-main-text-dark"
                        />
                    </div>
                </div>

                <div className="mt-2 flex justify-end">
                    <span className="inline-flex items-center gap-1 rounded-md bg-main-text-light px-3 py-1 text-xs font-semibold text-main-text-dark dark:bg-main-text-dark dark:text-main-text-light">
                        {t('View Product')}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="h-3 w-3"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                            />
                        </svg>
                    </span>
                </div>
            </div>
        </a>
    );
};

export default ProductCardView;
