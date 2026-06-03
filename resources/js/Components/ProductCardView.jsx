import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DisplayPrice from '@/Components/DisplayPrice';
import Spinner from '@/Components/Spinner';
import { useTranslation } from '@/Hooks/useTranslation';

const ProductCardView = ({ publicId, slug = null }) => {
    if (!publicId || typeof publicId !== 'string' || !publicId.startsWith('prd_')) {
        return null;
    }

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [preview, setPreview] = useState(null);
    const [imageError, setImageError] = useState(false);

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

    // CSS placeholder for when no product image exists.
    // Solid background + centered icon, fills 100% of container (no whitespace).
    const ImagePlaceholder = () => (
        <div className="flex h-full w-full items-center justify-center bg-surface-2-light dark:bg-surface-3-dark">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-10 text-surface-3-light dark:text-main-text-dark/30"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
            </svg>
        </div>
    );

    // STATE 1: Loading skeleton — matches final card layout dimensions
    if (loading) {
        return (
            <div className="my-3 flex h-28 animate-pulse items-stretch overflow-hidden rounded-lg border border-surface-3-light bg-surface-1-light dark:border-surface-3-dark dark:bg-surface-2-dark">
                {/* Image skeleton: square, fills full card height */}
                <div className="aspect-square h-full flex-shrink-0 bg-surface-2-light dark:bg-surface-3-dark" />

                {/* Right column skeleton: text top, button bottom-right */}
                <div className="flex min-w-0 flex-1 flex-col px-3 py-2">
                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-surface-2-light dark:bg-surface-3-dark" />
                        <div className="h-4 w-1/2 rounded bg-surface-2-light dark:bg-surface-3-dark" />
                    </div>
                    <div className="mt-auto flex justify-end">
                        <div className="h-7 w-24 rounded-md bg-surface-2-light dark:bg-surface-3-dark" />
                    </div>
                </div>

                <span className="sr-only">
                    <Spinner customSize={'size-4'} />
                </span>
            </div>
        );
    }

    // STATE 2 & 3: Network error OR deleted product — plain link fallback
    if (error || (preview && !preview.exists)) {
        const fallbackUrl = `/product/${encodeURIComponent(publicId)}${slug ? '/' + encodeURIComponent(slug) : ''}`;
        return (
            <a
                href={fallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-blue-500 underline"
            >
                {fallbackUrl}
            </a>
        );
    }

    // STATE 4: Success — compact card with blurred backdrop + contained image
    return (
        <a
            href={productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="my-3 flex h-28 items-stretch overflow-hidden rounded-lg border border-surface-3-light bg-surface-1-light no-underline transition hover:shadow-md dark:border-surface-3-dark dark:bg-surface-2-dark"
            contentEditable={false}
            data-product-card-link
        >
            {/* Image area: square (aspect-square + h-full = 112x112) */}
            <div className="aspect-square h-full flex-shrink-0 overflow-hidden bg-surface-2-light dark:bg-surface-3-dark">
                {preview.image_url && !imageError ? (
                    <img
                        src={preview.image_url}
                        alt={preview.name}
                        className="h-full w-full scale-150 object-cover object-center"
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                ) : (
                    <ImagePlaceholder />
                )}
            </div>

            {/* Right column: text top, button bottom-right */}
            <div className="flex min-w-0 flex-1 flex-col px-3 lg:py-2">
                <div className="min-w-0 flex-1 text-xs lg:text-sm">
                    <h4 className="line-clamp-2 font-semibold text-main-text-light dark:text-main-text-dark">
                        {preview.name}
                    </h4>
                    <div className="lg:mt-1">
                        <DisplayPrice
                            usdAmount={preview.price_usd}
                            showCode
                            size="sm"
                            showEstimatedLabel={false}
                            className="text-xs font-bold text-main-text-light dark:text-main-text-dark lg:text-sm"
                        />
                    </div>
                </div>
                <div className="mb-1 mt-auto flex justify-end">
                    <span className="inline-flex items-center gap-1 rounded-md bg-main-text-light px-1.5 py-1.5 text-xs font-semibold text-main-text-dark dark:bg-main-text-dark dark:text-main-text-light lg:px-3">
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
