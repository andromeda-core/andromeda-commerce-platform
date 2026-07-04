import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Spinner from '@/Components/Spinner';

/**
 * Live ad-banner embed view (mirrors ProductCardView.jsx's fetch/loading/error
 * shape, rendered visually like the existing static PostBanner.jsx). Fetches the
 * banner's CURRENT media + redirect_url at render time via the public preview
 * route — never a stored snapshot, so editing/replacing an Ad Banner's media in
 * the dashboard updates every post that embeds it.
 */
const AdBannerView = ({ adId }) => {
    if (!adId || typeof adId !== 'string' || !adId.startsWith('ad_')) {
        return null;
    }

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        axios
            .get(route('website.ad-banners.preview', { public_id: adId }))
            .then((response) => {
                setPreview(response.data);
                setLoading(false);
            })
            .catch(() => {
                setError(true);
                setLoading(false);
            });
    }, [adId]);

    // STATE 1: Loading skeleton.
    if (loading) {
        return (
            <div className="my-3 flex h-28 w-full animate-pulse items-center justify-center overflow-hidden rounded-md bg-surface-2-light dark:bg-surface-3-dark">
                <span className="sr-only">
                    <Spinner customSize={'size-4'} />
                </span>
            </div>
        );
    }

    // STATE 2: Network error OR the banner was deleted / never finished uploading
    // -> render nothing (never a broken embed), same gate PostBanner.jsx uses.
    if (error || !preview?.exists) {
        return null;
    }

    // STATE 3: Success.
    return (
        <a
            href={preview.redirect_url}
            target="_blank"
            rel="noopener noreferrer"
            className="my-3 block overflow-hidden rounded-md"
            contentEditable={false}
            data-ad-banner-link
        >
            {preview.media_type === 'video' ? (
                <video
                    src={preview.file_url}
                    className="h-auto w-full rounded-md"
                    controls
                    playsInline
                />
            ) : (
                <img
                    src={preview.file_url}
                    alt={preview.name || ''}
                    loading="lazy"
                    className="h-auto w-full rounded-md"
                />
            )}
        </a>
    );
};

export default AdBannerView;
