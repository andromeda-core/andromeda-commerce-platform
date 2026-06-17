import DisplayPrice from '@/Components/DisplayPrice';
import Spinner from '@/Components/Spinner';
import { useTranslation } from '@/Hooks/useTranslation';
import { router } from '@inertiajs/react';
import React, { memo, useEffect, useRef, useState } from 'react';

const FeedImage = ({ src, alt, Placeholder, loadingStrategy, onLoadedChange }) => {
    const [loaded, setLoaded] = useState(false);
    const [inView, setInView] = useState(loadingStrategy === 'eager');
    const imgRef = useRef(null);

    const markLoaded = () => {
        setLoaded(true);
        if (typeof onLoadedChange === 'function') onLoadedChange(true);
    };

    useEffect(() => {
        if (inView) return;
        const el = imgRef.current;
        if (!el) return;

        const io = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setInView(true);
                    io.disconnect();
                }
            },
            { rootMargin: '600px 0px' },
        );
        io.observe(el);
        return () => io.disconnect();
    }, [inView]);

    useEffect(() => {
        if (!inView) return;
        const el = imgRef.current;
        if (el && el.complete && el.naturalWidth > 0) {
            markLoaded();
        }
    }, [inView]);

    return (
        <>
            <div
                className="ease pointer-events-none absolute inset-0 z-[5] overflow-hidden transition-opacity duration-[400ms]"
                style={{ opacity: loaded ? 0 : 1 }}
            >
                <div
                    className={`absolute inset-0 bg-gradient-to-r from-surface-1-light via-surface-2-light to-surface-3-light dark:from-surface-1-dark dark:via-surface-2-dark dark:to-surface-3-dark ${inView ? 'animate-pulse' : ''}`}
                />
            </div>
            {!loaded && <div style={{ width: '100%', paddingBottom: '100%' }} />}

            <img
                ref={imgRef}
                src={inView ? src || Placeholder : undefined}
                alt={alt}
                decoding="async"
                onLoad={markLoaded}
                onError={(e) => {
                    e.target.src = Placeholder;
                    markLoaded();
                }}
                style={{
                    width: '100%',
                    height: 'auto',
                }}
                className="object-cover text-[10px] text-black dark:text-white"
            />
        </>
    );
};
const MasonryFeedItem = memo(
    ({
        item,
        onClick,
        Placeholder,
        Index,
        isBookmarkPage = false,
        setBookmarkedPosts,
        setBookmarkStatusChanged,
        setBookmarkActionPost,
        windowSize,
        onMeasure,
    }) => {
        const { __ } = useTranslation();

        const [loaded, setLoaded] = useState(false);

        const [unmarking, setUnmarking] = useState(false);
        const loadingStrategy = Index < 6 ? 'eager' : 'lazy';

        const articleRef = useRef(null);
        const itemKey = `${item.type}-${item.id}`;
        const lastReportedRef = useRef(0);

        // Report real height once, then on any real size change (image load / scroll-in
        // under content-visibility). RO fires only on actual size change, not on scroll.
        useEffect(() => {
            const el = articleRef.current;
            if (!el || typeof onMeasure !== 'function') return;

            const report = () => {
                const h = el.offsetHeight;
                if (h > 0 && Math.abs(h - lastReportedRef.current) > 1) {
                    lastReportedRef.current = h;
                    onMeasure(itemKey, h);
                }
            };

            report();
            const ro = new ResizeObserver(report);
            ro.observe(el);
            return () => ro.disconnect();
        }, []);

        if (item.type === 'posts') {
            return (
                <article
                    ref={articleRef}
                    className="group relative mb-2 cursor-pointer break-inside-avoid overflow-hidden rounded-md transition-all duration-300"
                    style={{
                        WebkitColumnBreakInside: 'avoid',
                        pageBreakInside: 'avoid',
                        breakInside: 'avoid',
                    }}
                    onClick={onClick}
                >
                    {item?.images ? (
                        <div className="relative">
                            <div className="transition-transform duration-500 lg:group-hover:scale-105">
                                {/* Top gradient */}
                                <div
                                    className="pointer-events-none absolute inset-x-0 top-0 h-[40%]"
                                    style={{
                                        background:
                                            'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0))',
                                        mixBlendMode: 'multiply',
                                    }}
                                />

                                {/* Bottom gradient */}
                                <div
                                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%]"
                                    style={{
                                        background:
                                            'linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0))',
                                        mixBlendMode: 'multiply',
                                    }}
                                />

                                {/* {!loaded && (
                                    <div
                                        className="relative w-full overflow-hidden"
                                        style={{ paddingBottom: '100%' }}
                                    >
                                        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-surface-1-light via-surface-2-light to-surface-3-light dark:from-surface-1-dark dark:via-surface-2-dark dark:to-surface-3-dark" />
                                    </div>
                                )} */}

                                {/* <img
                                    src={item?.images[0]?.url || Placeholder}
                                    alt={item?.title}
                                    loading={loadingStrategy}
                                    decoding="async"
                                    onLoad={() => {
                                        setLoaded(true);
                                    }}
                                    onError={(e) => {
                                        e.target.src = Placeholder;
                                        setLoaded(true);
                                    }}
                                    style={{
                                        opacity: loaded ? 1 : 0,
                                        width: '100%',
                                        height: 'auto',
                                    }}
                                    className="object-cover text-[10px] text-black dark:text-white"
                                /> */}

                                <FeedImage
                                    src={item?.images[0]?.url || Placeholder}
                                    alt={item?.title}
                                    Placeholder={Placeholder}
                                    loadingStrategy={loadingStrategy}
                                    onLoadedChange={setLoaded}
                                />
                            </div>

                            {loaded && (
                                <>
                                    <div className="absolute left-3 top-3">
                                        <span className="text-[13px] font-semibold leading-[17px] text-white lg:text-[14px]">
                                            {item?.tag_display ?? item?.tag}
                                        </span>
                                    </div>

                                    {isBookmarkPage && (
                                        <div
                                            className="pointer-events-auto absolute right-3 top-3 z-30"
                                            onClick={(e) => {
                                                setUnmarking(true);
                                                e.stopPropagation();
                                                router.delete(
                                                    route('website.bookmarks.destroy', {
                                                        post_id: item.id,
                                                    }),
                                                    {
                                                        preserveScroll: true,

                                                        onSuccess: () => {
                                                            const updatedItem = {
                                                                ...item,
                                                                is_bookmarked: false,
                                                            };
                                                            setBookmarkActionPost(updatedItem);
                                                            setBookmarkStatusChanged(true);
                                                            setBookmarkedPosts((prev) =>
                                                                prev.filter(
                                                                    (post) => post.id !== item.id,
                                                                ),
                                                            );
                                                        },

                                                        onFinish: () => {
                                                            setUnmarking(false);
                                                        },
                                                    },
                                                );
                                            }}
                                        >
                                            <button className="text-[8px] text-main-text-light dark:text-main-text-dark sm:text-[9px] md:text-[10px] lg:text-[14px]">
                                                {unmarking ? (
                                                    <Spinner />
                                                ) : (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill={'white'}
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="size-6"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                                                        />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    <div className="absolute inset-x-0 bottom-0 p-4">
                                        <div className="mt-1 flex items-center justify-between text-[13px] leading-[17px] lg:text-[14px]">
                                            <p className="min-w-0 flex-1 font-semibold text-main-text-dark">
                                                <span
                                                    className="!display-['-webkit-box'] line-clamp-2 break-all [&_*]:inline"
                                                    dangerouslySetInnerHTML={{
                                                        __html: item?.content
                                                            ?.replace(/<[^>]*>/g, ' ')
                                                            .replace(/\s+/g, ' ')
                                                            ?.trim(),
                                                    }}
                                                />
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : !item?.images && item?.videos ? (
                        <div className="relative">
                            <div className="transition-transform duration-500 lg:group-hover:scale-105">
                                {/* Top gradient */}
                                <div
                                    className="pointer-events-none absolute inset-x-0 top-0 h-[40%]"
                                    style={{
                                        background:
                                            'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0))',
                                        mixBlendMode: 'multiply',
                                    }}
                                />

                                {/* Bottom gradient */}
                                <div
                                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%]"
                                    style={{
                                        background:
                                            'linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0))',
                                        mixBlendMode: 'multiply',
                                    }}
                                />

                                {/* {!loaded && (
                                    <div
                                        className="relative w-full overflow-hidden"
                                        style={{ paddingBottom: '100%' }}
                                    >
                                        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-surface-1-light via-surface-2-light to-surface-3-light dark:from-surface-1-dark dark:via-surface-2-dark dark:to-surface-3-dark" />
                                    </div>
                                )} */}

                                {/* <img
                                    src={item?.videos[0]?.thumbnail_url || Placeholder}
                                    alt={item?.title}
                                    loading={loadingStrategy}
                                    decoding="async"
                                    onLoad={() => {
                                        setLoaded(true);
                                    }}
                                    onError={(e) => {
                                        e.target.src = Placeholder;
                                        setLoaded(true);
                                    }}
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                    }}
                                    className="object-cover text-[10px] text-black transition-opacity duration-300 dark:text-white"
                                /> */}

                                <FeedImage
                                    src={item?.videos[0]?.thumbnail_url || Placeholder}
                                    alt={item?.title}
                                    Placeholder={Placeholder}
                                    loadingStrategy={loadingStrategy}
                                    onLoadedChange={setLoaded}
                                />
                            </div>

                            {loaded && (
                                <>
                                    <div className="absolute left-3 top-3">
                                        <span className="text-[13px] font-semibold leading-[17px] text-white lg:text-[14px]">
                                            {item?.tag_display ?? item?.tag}
                                        </span>
                                    </div>

                                    {isBookmarkPage && (
                                        <div
                                            className="pointer-events-auto absolute right-3 top-3 z-30"
                                            onClick={(e) => {
                                                setUnmarking(true);
                                                e.stopPropagation();
                                                router.delete(
                                                    route('website.bookmarks.destroy', {
                                                        post_id: item.id,
                                                    }),
                                                    {
                                                        preserveScroll: true,

                                                        onSuccess: () => {
                                                            const updatedItem = {
                                                                ...item,
                                                                is_bookmarked: false,
                                                            };
                                                            setBookmarkActionPost(updatedItem);
                                                            setBookmarkStatusChanged(true);
                                                            setBookmarkedPosts((prev) =>
                                                                prev.filter(
                                                                    (post) => post.id !== item.id,
                                                                ),
                                                            );
                                                        },

                                                        onFinish: () => {
                                                            setUnmarking(false);
                                                        },
                                                    },
                                                );
                                            }}
                                        >
                                            <button className="text-[8px] text-main-text-light dark:text-main-text-dark sm:text-[9px] md:text-[10px] lg:text-[14px]">
                                                {unmarking ? (
                                                    <Spinner />
                                                ) : (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill={'white'}
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="size-6"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                                                        />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    <div className="absolute inset-x-0 bottom-0 p-4">
                                        <div className="mt-1 flex items-center justify-between text-[13px] leading-[17px] lg:text-[14px]">
                                            <p className="min-w-0 flex-1 font-semibold text-main-text-dark">
                                                <span
                                                    className="!display-['-webkit-box'] line-clamp-2 break-all [&_*]:inline"
                                                    dangerouslySetInnerHTML={{
                                                        __html: item?.content
                                                            ?.replace(/<[^>]*>/g, ' ')
                                                            .replace(/\s+/g, ' ')
                                                            ?.trim(),
                                                    }}
                                                />
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div
                            className={`relative flex w-full flex-col bg-surface-2-light p-[18px] text-black transition-all duration-500 dark:bg-surface-2-dark dark:text-white lg:group-hover:scale-[1.02] ${windowSize.width > 1024 ? 'min-h-[clamp(300px,100%,100%)]' : ''}`}
                        >
                            <div className="absolute left-4 top-3">
                                <span className="text-[13px] font-semibold leading-[17px] text-black dark:text-white lg:text-[14px]">
                                    {item?.tag_display ?? item?.tag}
                                </span>
                            </div>

                            {isBookmarkPage && (
                                <div
                                    className="pointer-events-auto absolute right-3 top-3 z-30"
                                    onClick={(e) => {
                                        setUnmarking(true);
                                        e.stopPropagation();
                                        router.delete(
                                            route('website.bookmarks.destroy', {
                                                post_id: item.id,
                                            }),
                                            {
                                                preserveScroll: true,

                                                onSuccess: () => {
                                                    const updatedItem = {
                                                        ...item,
                                                        is_bookmarked: false,
                                                    };
                                                    setBookmarkActionPost(updatedItem);
                                                    setBookmarkStatusChanged(true);
                                                    setBookmarkedPosts((prev) =>
                                                        prev.filter((post) => post.id !== item.id),
                                                    );
                                                },

                                                onFinish: () => {
                                                    setUnmarking(false);
                                                },
                                            },
                                        );
                                    }}
                                >
                                    <button className="text-[8px] text-main-text-light dark:text-main-text-dark sm:text-[9px] md:text-[10px] lg:text-[14px]">
                                        {unmarking ? (
                                            <Spinner />
                                        ) : (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill={'white'}
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="size-6"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            )}

                            <div className="mt-10">
                                <p className="line-clamp-6 whitespace-pre-line break-all text-[13px] leading-[17px] opacity-90 sm:line-clamp-[10] md:line-clamp-[12] lg:line-clamp-[16] lg:text-[14px] xl:line-clamp-[20]">
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: item?.content?.trim(),
                                        }}
                                    ></span>
                                </p>
                            </div>
                        </div>
                    )}
                </article>
            );
        }

        // Lodging (Stage 3.2) — property card; mirrors the smartphones image card.
        if (item.type === 'lodging') {
            return (
                <article
                    ref={articleRef}
                    className="group relative mb-2 cursor-pointer break-inside-avoid overflow-hidden rounded-md transition-all duration-300"
                    style={{
                        WebkitColumnBreakInside: 'avoid',
                        pageBreakInside: 'avoid',
                        breakInside: 'avoid',
                    }}
                    onClick={onClick}
                >
                    {item?.cover_image_url ? (
                        <div className="relative">
                            <div className="transition-transform duration-500 lg:group-hover:scale-105">
                                {/* Top gradient */}
                                <div
                                    className="pointer-events-none absolute inset-x-0 top-0 h-[40%]"
                                    style={{
                                        background:
                                            'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0))',
                                        mixBlendMode: 'multiply',
                                    }}
                                />

                                {/* Bottom gradient */}
                                <div
                                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%]"
                                    style={{
                                        background:
                                            'linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0))',
                                        mixBlendMode: 'multiply',
                                    }}
                                />

                                {/* {!loaded && (
                                    <div
                                        className="relative w-full overflow-hidden"
                                        style={{ paddingBottom: '100%' }}
                                    >
                                        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-surface-1-light via-surface-2-light to-surface-3-light dark:from-surface-1-dark dark:via-surface-2-dark dark:to-surface-3-dark" />
                                    </div>
                                )} */}

                                {/* <img
                                    src={
                                        item?.lodging_image_urls?.[0] ||
                                        item?.cover_image_url ||
                                        Placeholder
                                    }
                                    alt={item.property_name}
                                    loading={loadingStrategy}
                                    decoding="async"
                                    onLoad={() => {
                                        setLoaded(true);
                                    }}
                                    onError={(e) => {
                                        e.target.src = Placeholder;
                                        setLoaded(true);
                                    }}
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                    }}
                                    className="object-cover text-[10px] text-black transition-opacity duration-300 dark:text-white"
                                /> */}

                                <FeedImage
                                    src={
                                        item?.lodging_image_urls?.[0] ||
                                        item?.cover_image_url ||
                                        Placeholder
                                    }
                                    alt={item?.property_name}
                                    Placeholder={Placeholder}
                                    loadingStrategy={loadingStrategy}
                                    onLoadedChange={setLoaded}
                                />
                            </div>

                            {loaded && (
                                <>
                                    {item?.tag && (
                                        <div className="absolute left-3 top-3">
                                            <span className="text-[13px] font-semibold leading-[17px] text-white lg:text-[14px]">
                                                {item?.tag_display ?? item?.tag}
                                            </span>
                                        </div>
                                    )}

                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3 pt-12">
                                        <div className="mt-2 flex w-full flex-col items-start text-[13px] font-semibold leading-[17px] lg:text-[14px]">
                                            {item.is_reservation_closed != false && (
                                                <span className="mt-1 inline-block rounded bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                                                    {__('Sold Out')}
                                                </span>
                                            )}

                                            {item.lowest_rate && (
                                                <span className="text-white">
                                                    <DisplayPrice
                                                        usdAmount={item.lowest_rate}
                                                        size="sm"
                                                        className={`w-full truncate text-white ${item.is_reservation_closed != false ? 'line-through' : ''}`}
                                                        isLodgingProduct={true}
                                                    />
                                                </span>
                                            )}

                                            <p className="w-full truncate text-white">
                                                {item.property_name}
                                            </p>

                                            {item.location_name && (
                                                <p className="w-full truncate text-[11px] font-normal text-white">
                                                    {item.location_name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        // No cover image: text card fallback
                        <div
                            className={`relative flex w-full flex-col bg-surface-2-light p-[18px] text-black transition-all duration-500 dark:bg-surface-2-dark dark:text-white lg:group-hover:scale-[1.02] ${windowSize.width > 1024 ? 'min-h-[clamp(300px,100%,100%)]' : ''}`}
                        >
                            {item?.tag && (
                                <div className="absolute left-4 top-3">
                                    <span className="text-[13px] font-semibold leading-[17px] text-black dark:text-white lg:text-[14px]">
                                        {item?.tag_display ?? item?.tag}
                                    </span>
                                </div>
                            )}
                            <div className="mt-10 flex flex-1 flex-col">
                                <div className="line-clamp-6 whitespace-pre-line break-all text-[13px] leading-[17px] opacity-90 sm:line-clamp-[10] md:line-clamp-[12] lg:line-clamp-[16] lg:text-[14px] xl:line-clamp-[20]">
                                    <p className="font-semibold">{item.property_name}</p>
                                    <p
                                        dangerouslySetInnerHTML={{
                                            __html: item?.content?.trim(),
                                        }}
                                    ></p>
                                </div>

                                {item.location_name && (
                                    <p className="mt-1 text-[13px] text-sub-text-light dark:text-sub-text-dark">
                                        {item.location_name}
                                    </p>
                                )}
                                <div className="mt-auto pt-4">
                                    {item.lowest_rate && (
                                        <DisplayPrice
                                            usdAmount={item.lowest_rate}
                                            size="sm"
                                            className={`w-full truncate`}
                                            isLodgingProduct={true}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </article>
            );
        }

        // Smartphones
        return (
            <article
                ref={articleRef}
                className="group relative mb-2 cursor-pointer break-inside-avoid overflow-hidden rounded-md transition-all duration-300"
                style={{
                    WebkitColumnBreakInside: 'avoid',
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid',
                }}
                onClick={onClick}
            >
                {item?.images ? (
                    <div className="relative">
                        <div className="transition-transform duration-500 lg:group-hover:scale-105">
                            {/* Top gradient */}
                            <div
                                className="pointer-events-none absolute inset-x-0 top-0 h-[40%]"
                                style={{
                                    background:
                                        'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0))',
                                    mixBlendMode: 'multiply',
                                }}
                            />

                            {/* Bottom gradient */}
                            <div
                                className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%]"
                                style={{
                                    background:
                                        'linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0))',
                                    mixBlendMode: 'multiply',
                                }}
                            />

                            {/* {!loaded && (
                                <div
                                    className="relative w-full overflow-hidden"
                                    style={{ paddingBottom: '100%' }}
                                >
                                    <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-surface-1-light via-surface-2-light to-surface-3-light dark:from-surface-1-dark dark:via-surface-2-dark dark:to-surface-3-dark" />
                                </div>
                            )} */}

                            {/* <img
                                src={item.images[0]?.url || Placeholder}
                                alt={item.name}
                                loading={loadingStrategy}
                                decoding="async"
                                onLoad={() => {
                                    setLoaded(true);
                                }}
                                onError={(e) => {
                                    e.target.src = Placeholder;
                                    setLoaded(true);
                                }}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                }}
                                className="object-cover text-[10px] text-black transition-opacity duration-300 dark:text-white"
                            /> */}

                            <FeedImage
                                src={item.images[0]?.url || Placeholder}
                                alt={item?.name}
                                Placeholder={Placeholder}
                                loadingStrategy={loadingStrategy}
                                onLoadedChange={setLoaded}
                            />
                        </div>

                        {loaded && (
                            <>
                                <div className="absolute left-3 top-3">
                                    <span className="text-[13px] font-semibold leading-[17px] text-white lg:text-[14px]">
                                        {item?.tag_display ?? item?.tag}
                                    </span>
                                </div>

                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3 pt-12">
                                    <div className="mt-2 flex w-full flex-col items-start text-[13px] font-semibold leading-[17px] lg:text-[14px]">
                                        {item.is_sold_out && (
                                            <span className="mt-1 inline-block rounded bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                                                {__('Sold Out')}
                                            </span>
                                        )}

                                        {item.selling_info?.total_price ? (
                                            <DisplayPrice
                                                usdAmount={item.selling_info.total_price}
                                                size="sm"
                                                className={`w-full truncate text-white ${item.is_sold_out ? 'line-through' : ''}`}
                                            />
                                        ) : (
                                            ''
                                        )}

                                        <p className="w-full truncate text-white">
                                            {item.name} ({item.capacity})
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ) : !item?.images && item?.videos ? (
                    <div className="relative">
                        <div className="transition-transform duration-500 lg:group-hover:scale-105">
                            {/* Top gradient */}
                            <div
                                className="pointer-events-none absolute inset-x-0 top-0 h-[40%]"
                                style={{
                                    background:
                                        'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0))',
                                    mixBlendMode: 'multiply',
                                }}
                            />

                            {/* Bottom gradient */}
                            <div
                                className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%]"
                                style={{
                                    background:
                                        'linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0))',
                                    mixBlendMode: 'multiply',
                                }}
                            />

                            {/* {!loaded && (
                                <div
                                    className="relative w-full overflow-hidden"
                                    style={{ paddingBottom: '100%' }}
                                >
                                    <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-surface-1-light via-surface-2-light to-surface-3-light dark:from-surface-1-dark dark:via-surface-2-dark dark:to-surface-3-dark" />
                                </div>
                            )} */}

                            {/* <img
                                src={item?.videos[0]?.thumbnail_url || Placeholder}
                                alt={item?.name}
                                loading={loadingStrategy}
                                decoding="async"
                                onLoad={() => {
                                    setLoaded(true);
                                }}
                                onError={(e) => {
                                    e.target.src = Placeholder;
                                    setLoaded(true);
                                }}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                }}
                                className="object-cover text-[10px] text-black transition-opacity duration-300 dark:text-white"
                            /> */}

                            <FeedImage
                                src={item?.videos[0]?.thumbnail_url || Placeholder}
                                alt={item?.name}
                                Placeholder={Placeholder}
                                loadingStrategy={loadingStrategy}
                                onLoadedChange={setLoaded}
                            />
                        </div>

                        {loaded && (
                            <>
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3 pt-12">
                                    <div className="mt-2 flex w-full flex-col items-start text-[13px] font-semibold leading-[17px] lg:text-[14px]">
                                        {item.is_sold_out && (
                                            <span className="mt-1 inline-block rounded bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                                                {__('Sold Out')}
                                            </span>
                                        )}

                                        {item.selling_info?.total_price ? (
                                            <DisplayPrice
                                                usdAmount={item.selling_info.total_price}
                                                size="sm"
                                                className={`w-full truncate text-white ${item.is_sold_out ? 'line-through' : ''}`}
                                            />
                                        ) : (
                                            ''
                                        )}

                                        <p className="w-full truncate text-white">
                                            {item.name} ({item.capacity})
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div
                        className={`relative flex w-full flex-col bg-surface-2-light p-[18px] text-black transition-all duration-500 dark:bg-surface-2-dark dark:text-white lg:group-hover:scale-[1.02] ${windowSize.width > 1024 ? 'min-h-[clamp(300px,100%,100%)]' : ''}`}
                    >
                        <div className="absolute left-4 top-3">
                            <span className="text-[13px] font-semibold leading-[17px] text-black dark:text-white lg:text-[14px]">
                                {item?.tag_display ?? item?.tag}
                            </span>
                        </div>

                        <div className="mt-10 flex flex-1 flex-col">
                            <p className="line-clamp-6 whitespace-pre-line break-words text-[13px] leading-[20px] opacity-90 sm:line-clamp-[10] md:line-clamp-[12] lg:line-clamp-[16] lg:text-[14px] xl:line-clamp-[20]">
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: (
                                            item?.content_display ??
                                            item?.content ??
                                            ''
                                        )?.trim(),
                                    }}
                                ></span>
                            </p>

                            {/* PRICE - normal flow, pushed to bottom (no overlap) */}
                            <div className="mt-auto pt-4 text-main-text-light dark:text-main-text-dark">
                                <div className="flex w-full flex-col items-start text-[13px] font-semibold leading-[17px] lg:text-[14px]">
                                    {item.is_sold_out && (
                                        <span className="mt-1 inline-block rounded bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                                            {__('Sold Out')}
                                        </span>
                                    )}

                                    {item.selling_info?.total_price ? (
                                        <DisplayPrice
                                            usdAmount={item.selling_info.total_price}
                                            size="sm"
                                            className={`w-full truncate ${item.is_sold_out ? 'line-through' : ''}`}
                                        />
                                    ) : (
                                        ''
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </article>
        );
    },
    (prevProps, nextProps) => {
        return (
            prevProps.item.id === nextProps.item.id &&
            prevProps.item.type === nextProps.item.type &&
            prevProps.index === nextProps.index
        );
    },
);

export default MasonryFeedItem;
