import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import gsap from 'gsap';
import MobileFeedGallery from './MobileFeedGallery';
import useDarkMode from '@/Hooks/useDarkMode';
import Spinner from '@/Components/Spinner';
import { useFilterStore } from '@/Hooks/useFilterStore';
import { useVideoStore } from '@/Hooks/useVideoStore';
import { useFeedCleanupStore } from '@/Hooks/useFeedCleanupStore';
import { useHomeNavStore } from '@/Hooks/useHomeNavStore';
import InstagramStyledVideoPlayer from '@/Components/InstagramStyledVideoPlayer';
import DisplayPrice from '@/Components/DisplayPrice';
// import "@/Components/dubugOverlay";
const MobileFeed = ({
    feed,
    feedGallery,
    setFeedOpen,
    setFeedGallery,
    feedIndex,
    setFeedIndex,
    setShowQrCode,
    setLinkCopied,
    setBookmarkStatusChanged,
    auth,
    generateURL,
    navigateToHashtag,
    fetchMoreYAxis,
    MobileFeedGalleryOpen,
    setMobileFeedGalleryOpen,
    currency,
    placeholderImage,
    relatedFeed,
    fetchRelatedFeed,
    relatedFeedNextUrlsRef,
    nextPageUrl,
    isfetchingMoreYAxisFeed,
    isFeedOpeningDirectly,
    showErrorMessage,
    showInfoMessage,
    ErrorMessage,
    InfoMessage,
    setInfoMessage,
    setShowInfoMessage,
    setErrorMessage,
    setShowErrorMessage,
    windowSize,
    generateSmartphoneURL,
    isSinglePageRef,
    setSpatiotemporalInfoModal,
    spatiotemporalInfoModal,
    __,
}) => {
    useEffect(() => {
        const url = new URL(window.location);
        window.history.pushState({}, '', url.toString());
    }, []);

    const isIOS =
        typeof window !== 'undefined' &&
        (/iPhone|iPad|iPod/i.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

    // Local feed state for seamless looping
    const [localFeed, setLocalFeed] = useState([]);

    // Manually Passing Correct Feed To Feed Gallery To Open
    const [manualFeedGalleryItem, setManualFeedGalleryItem] = useState(null);

    const isFeedOpeningDirectlyRef = useRef(isFeedOpeningDirectly);
    const isMobileFeedGalleryOpenRef = useRef(MobileFeedGalleryOpen);
    const hasUserInteractedRef = useRef(false);

    const shouldCleanupBrowserHistoryRef = useRef(true);

    // its for FEED ITEMS To TRACK WHIHC ITEMS LOADED OR WHICH ARENT To SHOW SKELETON
    const [loadedItems, setLoadedItems] = useState(new Set());

    const [mobileFeedGalleryOpening, setMobileFeedGalleryOpening] = useState(false);

    const scrollContainerRef = useRef(null);

    // SCROLLING TRACKING REFS
    const hasInitializedScroll = useRef(false);
    const isLoopingRef = useRef(false);
    const lastUpdateRef = useRef({ id: null, index: null });
    const isLockedRef = useRef(false);
    const isProcessingRef = useRef(false);

    const isYSuspendedRef = useRef(false);
    const horizontalRefs = useRef([]);
    const lastHorizontalUpdateRef = useRef({});
    const hasInitializedHorizontalRef = useRef(false);
    const isXLoopingRef = useRef(false);

    // Preserving X axis Scroll State Ref
    const preserveXAxisScrollRef = useRef({});

    // Restricting X Axis Ticker to run if Scroll Restoring
    const isXAxisRestoringRef = useRef(false);

    // X Axis Scroll INDEX STORING REF
    const initializedXAxisRef = useRef(new Set());

    // CONTROLING THE VISIBILITY OF VIEWER AFTER OPENING FEED Y Axis
    const [isScrollCompleted, setIsScrollCompleted] = useState(false);

    // TRACKING VISIBILITY OF SKELETON FOR X AXIS
    const [isXAxisLooping, setIsXAxisLooping] = useState(false);

    // STORING PARENT FEED SLUG
    const parentFeedSlugRef = useRef(null);

    // ITEM HEIGHT AND WIDTH REF FOR CACHING AND PREVENTING TO GET AGAIn AND AGAIn On TICKER
    const itemHeightRef = useRef(null);
    const itemWidthRef = useRef({});

    // LOCAL FEED REFS JUST TO SYNC AND SHOW DATA INSTANTLY
    const localRelatedFeedRef = useRef(null);

    // FEED REFS  TO SYNC DATA CORRECTLY
    const feedRef = useRef(feed);
    const localFeedRef = useRef(localFeed);

    const isDarkMode = useDarkMode();

    // Video Player Control Zustand Hook Methods
    const setActiveVideo = useVideoStore((state) => state.setActiveVideo);
    const pauseAll = useVideoStore((state) => state.pauseAll);
    const initAutoplay = useVideoStore((state) => state.initAutoplay);

    // Helper Function to Get Related Feed Count
    // const getRelatedCount = (slug) => {
    //     if (!slug || !localRelatedFeedRef.current) return 0;
    //     const arr = localRelatedFeedRef.current[slug];
    //     return arr ? arr.length : 0;
    // };

    // Helper function to get related items for a feed item
    const relatedItemsCache = useRef(new Map());

    const getRelatedItems = (item) => {
        if (!item) return [];

        const cached = relatedItemsCache.current.get(item.id);
        if (cached) return cached;

        const relatedItems = localRelatedFeedRef.current?.[item.slug] || [];
        const result = [item, ...relatedItems];

        relatedItemsCache.current.set(item.id, result);

        return result;
    };

    // Helper Function to Render Feed Skeleton before Showing Actual Feed After Opening
    const RenderFeedItemSkeleton = ({ index }) => {
        return (
            <div
                key={`skeleton-${index}`}
                className="pointer-events-none relative min-w-full cursor-not-allowed snap-start"
                inert=""
                style={{
                    height: '100%',
                    scrollSnapAlign: 'start',
                    scrollSnapStop: 'always',
                    pointerEvents: 'none',
                    touchAction: 'none',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    msUserSelect: 'none',
                    contain: 'layout paint',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                }}
                onTouchStart={(e) => e.preventDefault()}
                onTouchMove={(e) => e.preventDefault()}
                onTouchEnd={(e) => e.preventDefault()}
            >
                {/* HEADER SKELETON */}
                <div className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-4 pb-2 pt-3">
                    {/* Tag skeleton */}
                    <div className="h-5 w-20 animate-pulse rounded bg-gray-200 dark:bg-zinc-700" />

                    {/* Three dots skeleton */}
                    <div className="h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-zinc-700" />
                </div>

                {/* MEDIA AREA SKELETON */}
                <div className="relative h-full w-full overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-full w-full animate-pulse bg-gray-200 object-cover dark:bg-zinc-700" />
                    </div>
                </div>

                {/*  OVERLAY BOTTOM SKELETON (IMMERVIEW STYLE)  */}
                <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/50 via-black/20 to-transparent px-4 pb-[90px] pt-6">
                    <div className="flex items-center justify-between gap-3">
                        {/* Text skeleton */}
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-zinc-700" />
                            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-zinc-700" />
                        </div>

                        {/* Button skeleton */}
                        <div className="h-[30px] w-[90px] shrink-0 animate-pulse rounded-lg bg-gray-200 dark:bg-zinc-700" />
                    </div>
                </div>
            </div>
        );
    };

    // Helper Function to Render Feed CONTENT Skeleton before Showing Actual ITEM
    const RenderFeedItemContentSkeleton = () => {
        return (
            <div className="relative h-full w-full overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-full w-full animate-pulse bg-gray-200 object-cover dark:bg-zinc-700" />
                </div>
            </div>
        );
    };

    // State And Effect For Tracking The height Of Feed Item To Adjust Window
    const [feedItemHeight, setFeedItemHeight] = useState(() => {
        // On iOS, use visualViewport if available for accurate height
        if (isIOS && window.visualViewport) {
            return window.visualViewport.height;
        }
        return window.innerHeight;
    });

    useEffect(() => {
        const container = scrollContainerRef.current;

        const updateHeight = () => {
            if (!container) return;

            //  Store current scroll position BEFORE resize
            const oldHeight = feedItemHeight;
            const currentScrollTop = container.scrollTop;

            // Calculate which item we're currently viewing
            const currentItemIndex = Math.round(currentScrollTop / oldHeight);

            // Update to new height
            const newHeight = window.visualViewport?.height;
            setFeedItemHeight(newHeight);

            // Restore scroll position after height updates
            requestAnimationFrame(() => {
                if (container && hasInitializedScroll.current) {
                    // Account for dummy item at top (index 0)
                    const targetScroll = currentItemIndex * newHeight;

                    container.style.scrollBehavior = 'auto';
                    container.scrollTop = targetScroll;

                    // Re-enable smooth scrolling
                    requestAnimationFrame(() => {
                        container.style.scrollBehavior = 'smooth';
                    });
                }
            });
        };

        // Debounce resize to avoid excessive updates
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateHeight, 150);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        return () => {
            clearTimeout(resizeTimeout);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
        };
    }, [feedItemHeight]);

    // Helper Function To Render Dummy items WithActual Related Feed To Perform Looping

    const wrapWithHorizontalDummies = useMemo(() => {
        return (items) => {
            if (!items || items.length === 0 || !parentFeedSlugRef.current) return items;

            // const slug = parentFeedSlugRef.current;
            // const relatedCount = getRelatedCount(slug);

            // No related items, return as-is
            // if (relatedCount < 1) return items;

            // Has related items, add dummies
            return [{ __dummy: 'left' }, ...items, { __dummy: 'right' }];
        };
    }, [localRelatedFeedRef.current]);

    const toPlainPreview = (html) => {
        if (typeof html !== 'string' || !html) return '';
        return html
            .replace(/<head[\s\S]*?<\/head>/gi, ' ') // drop <head> (title, meta, scripts)
            .replace(/<script[\s\S]*?<\/script>/gi, ' ') // drop inline scripts
            .replace(/<style[\s\S]*?<\/style>/gi, ' ') // drop inline styles
            .replace(/<!--[\s\S]*?-->/g, ' ') // drop comments
            .replace(/<[^>]+>/g, ' ') // drop remaining tags
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, '&')
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, ' ') // collapse whitespace
            .trim();
    };

    // Helper function to render a single feed item (used for both main and related items)
    const renderFeedItem = useCallback(
        (item, isRelated = false, index) => {
            if (item?.__dummy) {
                return (
                    <div
                        key={`dummy-skeleton-${index}`}
                        className="min-w-full snap-start"
                        style={{
                            height: feedItemHeight,
                            scrollSnapAlign: 'start',
                            scrollSnapStop: 'always',
                            pointerEvents: 'none',
                            userSelect: 'none',
                        }}
                        aria-hidden="true"
                    >
                        <RenderFeedItemSkeleton index={index} />
                    </div>
                );
            }

            const plain = toPlainPreview(item?.content);

            // Text Post Logic Starts
            const isText =
                (item.type === 'posts' &&
                    item.post_image_urls?.length === 0 &&
                    item.post_video_urls?.length === 0) ||
                (item.type === 'smartphones' &&
                    item.smartphone_image_urls?.length === 0 &&
                    item.smartphone_video_urls?.length === 0);

            // View More Button Height
            const viewMoreHeightPx = 100;

            // approx line height for: text-sm + leading-relaxed
            const lineHeightPx = 18;

            // 80% of screen height
            const maxHeightPx = windowSize.height * 0.7 - viewMoreHeightPx;

            // how many lines fit
            const maxLines = Math.floor(maxHeightPx / lineHeightPx);

            // average characters per line
            // const avgCharsPerLine = windowSize.width < 480 ? 28 : 40;

            // total characters allowed in visible area
            // const maxCharsAllowed = maxLines * avgCharsPerLine;

            // should we show "View More"?
            // const shouldShowMore =
            //     isText && plain.length > maxCharsAllowed;

            const shouldShowMore = true;
            // Text Post Logic Ends

            const isCurrent = item?.slug === manualFeedGalleryItem?.slug;

            const currentIndex = localFeed.findIndex((f) => f.slug === manualFeedGalleryItem?.slug);
            const thisItemIndex = localFeed.findIndex((f) => f.slug === item?.slug);
            const isAdjacent = Math.abs(currentIndex - thisItemIndex) <= 1;

            const shouldEagerLoad = isCurrent || isAdjacent;

            const hasVideo =
                item.type === 'posts'
                    ? item.post_video_urls?.length > 0 && !item?.post_image_urls?.[0]
                    : item.type === 'smartphones'
                      ? item.smartphone_video_urls?.length > 0 && !item?.smartphone_image_urls?.[0]
                      : false;

            const hasPoster =
                hasVideo &&
                (item.type === 'posts'
                    ? item.post_video_urls?.[0]?.thumbnail_url
                    : item.type === 'smartphones'
                      ? item.smartphone_video_urls?.[0]?.thumbnail_url
                      : null);

            const BottomOffset = hasVideo ? 105 : 70;

            const isLoaded = isText || loadedItems.has(item?.slug) || hasPoster;

            const handleOnLoad = () => {
                if (item?.slug) {
                    setLoadedItems((prev) => new Set(prev).add(item.slug));
                }
            };

            return (
                <div
                    key={index}
                    className="feed-page min-w-full snap-start"
                    style={{
                        height: feedItemHeight,
                        scrollSnapAlign: 'start',
                        scrollSnapStop: 'always',
                        contain: isIOS ? 'style' : 'layout',
                        willChange: 'transform',
                        margin: 0,
                        padding: 0,
                        border: 'none',
                        display: 'block',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        lineHeight: 0,
                        ...(isIOS && {
                            // iOS: Force explicit dimensions
                            minHeight: feedItemHeight,
                            maxHeight: feedItemHeight,
                        }),
                    }}
                >
                    {/* Header: Tag + Three Dots */}
                    <div
                        className={`absolute left-0 right-0 top-2 z-20 flex items-center justify-between px-4 pt-4 ${isText ? 'text-main-text-light dark:text-main-text-dark' : 'text-main-text-dark'}`}
                    >
                        <button
                            onClick={() => {
                                setFeedGallery(null);
                                setFeedOpen(false);
                            }}
                            className="text-[18px] font-semibold"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="size-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 19.5 8.25 12l7.5-7.5"
                                />
                            </svg>
                        </button>

                        <button
                            onClick={() => {
                                shouldCleanupBrowserHistoryRef.current = false;
                                navigateToHashtag(item.tag);
                            }}
                            className="text-[18px] font-semibold"
                        >
                            {item.tag_display ?? item.tag}
                        </button>
                    </div>

                    {!isLoaded && <RenderFeedItemContentSkeleton />}

                    {/* Image + Videos - Takes remaining space */}
                    <div
                        className="absolute inset-0 h-full w-full"
                        style={{
                            lineHeight: 0,
                            display: 'block',
                            overflow: 'hidden',
                        }}
                    >
                        {!isText && (
                            <>
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
                            </>
                        )}

                        {item.type === 'smartphones' && (
                            <>
                                {item?.smartphone_image_urls?.length > 0 ? (
                                    <img
                                        key={item.id}
                                        src={item.smartphone_image_urls[0] || placeholderImage}
                                        alt={item.title}
                                        className="h-full w-full rounded-none object-cover object-center"
                                        loading={shouldEagerLoad ? 'eager' : 'lazy'}
                                        fetchpriority={shouldEagerLoad ? 'high' : 'low'}
                                        decoding="async"
                                        style={{
                                            display: 'block',
                                            verticalAlign: 'top',
                                        }}
                                        onLoad={handleOnLoad}
                                        onError={(e) => {
                                            handleOnLoad();
                                            if (e.target.src !== placeholderImage) {
                                                e.target.src = placeholderImage;
                                            }
                                        }}
                                    />
                                ) : item.smartphone_video_urls.length > 0 ? (
                                    <InstagramStyledVideoPlayer
                                        slug={item.slug}
                                        videoUrl={item.smartphone_video_urls[0].url}
                                        thumbnail={item.smartphone_video_urls[0]?.thumbnail_url}
                                        className="h-full w-full object-cover object-center"
                                        OnLoadedMetaData={() => {
                                            if (item.slug)
                                                setLoadedItems((prev) =>
                                                    new Set(prev).add(item.slug),
                                                );
                                        }}
                                        Preload={shouldEagerLoad ? 'metadata' : 'none'}
                                        timelinePadding={70}
                                        isMainFeed={true}
                                    />
                                ) : (
                                    isText && (
                                        <div className="absolute inset-0 overflow-hidden px-4 pb-40 pt-20">
                                            <div
                                                className="line-clamp-[var(--text-lines)] whitespace-pre-line break-words text-sm leading-relaxed text-main-text-light dark:text-main-text-dark"
                                                style={{ '--text-lines': maxLines }}
                                                dangerouslySetInnerHTML={{
                                                    __html: plain,
                                                }}
                                            />
                                        </div>
                                    )
                                )}
                            </>
                        )}

                        {item.type === 'posts' && (
                            <>
                                {item?.post_image_urls?.length > 0 ? (
                                    <img
                                        key={item.id}
                                        src={item.post_image_urls[0] || placeholderImage}
                                        alt={item.title}
                                        className="h-full w-full rounded-none object-cover object-center"
                                        loading={shouldEagerLoad ? 'eager' : 'lazy'}
                                        fetchpriority={shouldEagerLoad ? 'high' : 'low'}
                                        decoding="async"
                                        style={{
                                            display: 'block',
                                            verticalAlign: 'top',
                                        }}
                                        onLoad={handleOnLoad}
                                        onError={(e) => {
                                            handleOnLoad();
                                            if (e.target.src !== placeholderImage) {
                                                e.target.src = placeholderImage;
                                            }
                                        }}
                                    />
                                ) : item.post_video_urls.length > 0 ? (
                                    <InstagramStyledVideoPlayer
                                        slug={item.slug}
                                        videoUrl={item.post_video_urls[0].url}
                                        thumbnail={item.post_video_urls[0]?.thumbnail_url}
                                        className="h-full w-full object-cover object-center"
                                        OnLoadedMetaData={() => {
                                            if (item.slug)
                                                setLoadedItems((prev) =>
                                                    new Set(prev).add(item.slug),
                                                );
                                        }}
                                        Preload={shouldEagerLoad ? 'metadata' : 'none'}
                                        timelinePadding={70}
                                        isMainFeed={true}
                                    />
                                ) : (
                                    isText && (
                                        <div className="absolute inset-0 overflow-hidden px-4 pb-40 pt-20">
                                            <div
                                                className="line-clamp-[var(--text-lines)] whitespace-pre-line break-words text-sm leading-relaxed text-main-text-light dark:text-main-text-dark"
                                                style={{ '--text-lines': maxLines }}
                                                dangerouslySetInnerHTML={{
                                                    __html: plain,
                                                }}
                                            />
                                        </div>
                                    )
                                )}
                            </>
                        )}
                    </div>

                    {/* Bottom */}
                    {item.type === 'smartphones' && (
                        <div
                            className={`absolute left-0 right-0 z-20 px-5 pt-3 text-main-text-dark`}
                            style={{ bottom: `${BottomOffset}px` }}
                        >
                            <div className="w-full">
                                {isText ? (
                                    shouldShowMore && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={
                                                        item.is_sold_out
                                                            ? 'text-main-text-light line-through decoration-2 dark:text-main-text-dark'
                                                            : ''
                                                    }
                                                >
                                                    <DisplayPrice
                                                        usdAmount={item.selling_info?.total_price}
                                                        showEstimatedLabel={false}
                                                        className="text-[20px] font-semibold text-main-text-light dark:text-main-text-dark"
                                                    />
                                                </span>

                                                {item.is_sold_out && (
                                                    <span className="inline-flex items-center rounded bg-red-600 px-2 py-0.5 text-[11px] font-semibold leading-none text-white no-underline">
                                                        {__('Sold Out')}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setManualFeedGalleryItem(item);
                                                    setMobileFeedGalleryOpening(true);

                                                    setTimeout(() => {
                                                        setMobileFeedGalleryOpen(true);
                                                        setMobileFeedGalleryOpening(false);
                                                    }, 500);
                                                }}
                                                className="flex h-[30px] shrink-0 items-center justify-center gap-2 rounded-full bg-transparent text-[14px] font-semibold text-main-text-light transition-colors dark:text-main-text-dark"
                                            >
                                                {mobileFeedGalleryOpening ? (
                                                    <Spinner customSize={'size-3'} />
                                                ) : (
                                                    <>
                                                        <div className="flex items-center gap-1">
                                                            <span>{__('View More')}</span>

                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={1.5}
                                                                stroke="currentColor"
                                                                className="h-4 w-4"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                                                                />
                                                            </svg>
                                                        </div>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={
                                                    item.is_sold_out
                                                        ? 'text-main-text-light line-through decoration-2 dark:text-main-text-dark'
                                                        : ''
                                                }
                                            >
                                                <DisplayPrice
                                                    usdAmount={item.selling_info?.total_price}
                                                    showEstimatedLabel={false}
                                                    className="text-[20px] font-semibold text-main-text-light dark:text-main-text-dark"
                                                    MobileFeedPriceClass={'text-main-text-dark'}
                                                />
                                            </span>

                                            {item.is_sold_out && (
                                                <span className="inline-flex items-center rounded bg-red-600 px-2 py-0.5 text-[11px] font-semibold leading-none text-white no-underline">
                                                    {__('Sold Out')}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => {
                                                setManualFeedGalleryItem(item);
                                                setMobileFeedGalleryOpening(true);

                                                setTimeout(() => {
                                                    setMobileFeedGalleryOpen(true);
                                                    setMobileFeedGalleryOpening(false);
                                                }, 500);
                                            }}
                                            className="flex h-[30px] shrink-0 items-center justify-center gap-2 rounded-full bg-transparent text-[14px] font-semibold text-main-text-dark transition-colors"
                                        >
                                            {mobileFeedGalleryOpening ? (
                                                <Spinner customSize={'size-3'} />
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-1">
                                                        <span>{__('View More')}</span>

                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="h-4 w-4"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                                                            />
                                                        </svg>
                                                    </div>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className={`mb-1 flex items-center justify-between gap-3`}>
                                {/* CHECKING IF MEDIA IS EMPTY THAN ITS TEXT ONLY SMARTPHONE SO THIS WONT SHOW BECAUSE WE ALREADY SHOWED In CONTENT */}
                                {item?.smartphone_image_urls?.length === 0 &&
                                item?.smartphone_video_urls?.length === 0 ? (
                                    <p></p>
                                ) : (
                                    <p className="] min-w-0 flex-1 text-[15px] font-medium leading-relaxed text-main-text-dark">
                                        <span
                                            className="!display-['-webkit-box'] line-clamp-2 break-all [&_*]:inline"
                                            dangerouslySetInnerHTML={{
                                                __html: plain,
                                            }}
                                        />
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {item.type === 'posts' && (
                        <div
                            className={`absolute left-0 right-0 z-20 px-5 pt-3 text-main-text-dark`}
                            style={{ bottom: `${BottomOffset}px` }}
                        >
                            <div className="flex items-center justify-end">
                                {isText ? (
                                    shouldShowMore && (
                                        <button
                                            onClick={() => {
                                                setManualFeedGalleryItem(item);
                                                setMobileFeedGalleryOpening(true);

                                                setTimeout(() => {
                                                    setMobileFeedGalleryOpen(true);
                                                    setMobileFeedGalleryOpening(false);
                                                }, 500);
                                            }}
                                            className="flex h-[30px] shrink-0 items-center justify-center gap-2 rounded-full bg-transparent text-[14px] font-semibold text-main-text-light transition-colors dark:text-main-text-dark"
                                        >
                                            {mobileFeedGalleryOpening ? (
                                                <Spinner customSize={'size-3'} />
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-1">
                                                        <span>{__('View More')}</span>

                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="h-4 w-4"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                                                            />
                                                        </svg>
                                                    </div>
                                                </>
                                            )}
                                        </button>
                                    )
                                ) : (
                                    <button
                                        onClick={() => {
                                            setManualFeedGalleryItem(item);
                                            setMobileFeedGalleryOpening(true);

                                            setTimeout(() => {
                                                setMobileFeedGalleryOpen(true);
                                                setMobileFeedGalleryOpening(false);
                                            }, 500);
                                        }}
                                        className="flex h-[30px] shrink-0 items-center justify-center gap-2 rounded-full bg-transparent text-[14px] font-semibold text-main-text-dark transition-colors"
                                    >
                                        {mobileFeedGalleryOpening ? (
                                            <Spinner customSize={'size-3'} />
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-1">
                                                    <span>{__('View More')}</span>

                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="h-4 w-4"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                                                        />
                                                    </svg>
                                                </div>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            <div className={`mb-1 flex items-center justify-between gap-3`}>
                                {/* CHECKING IF MEDIA IS EMPTY THAN ITS TEXT ONLY POST SO THIS WONT SHOW BECAUSE WE ALREADY SHOWED In CONTENT */}
                                {item?.post_image_urls?.length === 0 &&
                                item?.post_video_urls?.length === 0 ? (
                                    <p></p>
                                ) : (
                                    <p className="] min-w-0 flex-1 text-[15px] font-medium leading-relaxed text-main-text-dark">
                                        <span
                                            className="!display-['-webkit-box'] line-clamp-2 break-all [&_*]:inline"
                                            dangerouslySetInnerHTML={{
                                                __html: plain,
                                            }}
                                        />
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            );
        },
        [mobileFeedGalleryOpening, isDarkMode, loadedItems, localFeed],
    );

    // Tracking GLobal Filter Open Or Not
    const isFilterOpenRef = useRef(false);

    // subscribing to filter store
    useEffect(() => {
        return useFilterStore.subscribe((state) => {
            isFilterOpenRef.current = state.isOpen;
        });
    }, []);

    // Not Needed RN He Said To Remove It
    //  Hide bottom bar when MobileFeed mounts, show when unmounts
    // useEffect(() => {

    //     setBottomBarVisible(false);

    //     return () => {
    //         setBottomBarVisible(true);
    //     };
    // }, [setBottomBarVisible]);

    // Syncing FeedGallery With Manual FeedGallery State
    useEffect(() => {
        setManualFeedGalleryItem(feedGallery);
    }, [feedGallery]);

    // Syncing the ref when prop changes
    useEffect(() => {
        isFeedOpeningDirectlyRef.current = isFeedOpeningDirectly;
    }, [isFeedOpeningDirectly]);

    useEffect(() => {
        isMobileFeedGalleryOpenRef.current = MobileFeedGalleryOpen;
    }, [MobileFeedGalleryOpen]);

    useEffect(() => {
        relatedItemsCache.current.clear();
    }, [relatedFeed]);

    // SYNCING WITH FEED REFS
    useEffect(() => {
        feedRef.current = feed;
    }, [feed]);

    useEffect(() => {
        localFeedRef.current = localFeed;
    }, [localFeed]);

    // SETTING THE PARENT SLUG ON MOUNT
    useEffect(() => {
        if (!feedGallery) return;
        parentFeedSlugRef.current = feedGallery?.slug;
        setManualFeedGalleryItem(feedGallery);
    }, []);

    // SETTING ACTUAL FEED In THIS JUST TO APPEND OR PREPEND FEED WHEN LOOPING So IT WONT DISTRUB ACTUAL FEED
    useEffect(() => {
        setLocalFeed(feed);
    }, [feed]);

    // SETTING ACTUAl RELATED FEED IN THIS JUST TO APPEND OR PREPEND FEED WHEN LOOPING So IT WONT DISTRUB ACTUAL FEED
    useEffect(() => {
        localRelatedFeedRef.current = relatedFeed;
    }, [relatedFeed]);

    // Force Re-layout on IOS
    useEffect(() => {
        if (!isIOS) return;

        // Force iOS to recalculate layout after mount
        const forceLayout = () => {
            const container = scrollContainerRef.current;
            if (!container) return;

            // Trigger reflow
            void container.offsetHeight;

            // Force repaint
            container.style.transform = 'translateZ(0)';

            requestAnimationFrame(() => {
                // Ensure height is correct
                const correctHeight = window.visualViewport?.height || window.innerHeight;
                if (Math.abs(feedItemHeight - correctHeight) > 10) {
                    setFeedItemHeight(correctHeight);
                }
            });
        };

        // Run immediately and after a safety delay
        forceLayout();
        const timeoutId = setTimeout(forceLayout, 100);

        return () => clearTimeout(timeoutId);
    }, [isIOS, feedItemHeight]);

    // Scroll to the currently selected feed item on mount or index change In Y Axis
    useEffect(() => {
        if (isYSuspendedRef.current) return;

        if (!feedGallery || feedIndex < 0) return;
        const container = scrollContainerRef.current;
        if (!container) return;

        const rafCleanups = new Set();
        const timeoutCleanups = new Set();
        const alignToIndex = () => {
            if (!container || hasInitializedScroll.current) return;

            // iOS: Wait for layout to stabilize
            const itemHeight = isIOS
                ? feedItemHeight
                : container.firstElementChild?.offsetHeight || window.innerHeight;

            const targetScroll = (feedIndex + 1) * itemHeight;

            // iOS: Using 'auto' instead of 'instant'
            container.style.scrollBehavior = isIOS ? 'auto' : 'instant';

            // iOS: Force layout recalculation
            if (isIOS) {
                void container.offsetHeight;
            }

            container.scrollTop = targetScroll;

            // iOS: Verify scroll position was set
            if (isIOS) {
                requestAnimationFrame(() => {
                    const currentScroll = container.scrollTop;
                    if (Math.abs(currentScroll - targetScroll) > 10) {
                        container.scrollTop = targetScroll;
                    }
                });
            }

            hasInitializedScroll.current = true;
            setIsScrollCompleted(true);

            const raf1 = requestAnimationFrame(() => {
                container.style.scrollBehavior = 'smooth';
            });

            rafCleanups.add(raf1);
        };

        // iOS: extra delay for layout stabilization
        const initialDelay = isIOS ? 150 : 0;

        const raf2 = requestAnimationFrame(() => {
            const timeout = setTimeout(alignToIndex, initialDelay);
            timeoutCleanups.add(timeout);
        });
        rafCleanups.add(raf2);

        return () => {
            rafCleanups.forEach((raf) => cancelAnimationFrame(raf));
            timeoutCleanups.forEach((timeout) => clearTimeout(timeout));
            rafCleanups.clear();
            timeoutCleanups.clear();
        };
    }, [feedIndex, feedItemHeight, isIOS]);

    // MODIFIED: Fallback X-axis alignment - only run for NEW rows
    useEffect(() => {
        if (!isScrollCompleted) return;

        const currentItem = localFeed[feedIndex];
        if (!currentItem) return;

        // If already initialized, restore position
        if (initializedXAxisRef.current.has(currentItem.id)) {
            hasInitializedHorizontalRef.current = true;

            const row = horizontalRefs.current[feedIndex];
            if (row && preserveXAxisScrollRef.current[feedIndex] !== undefined) {
                // Block ticker during restoration
                isXAxisRestoringRef.current = true;

                requestAnimationFrame(() => {
                    row.style.scrollBehavior = 'auto';

                    const storedPosition = preserveXAxisScrollRef.current[feedIndex];
                    const itemWidth = row.offsetWidth;
                    const relatedItems = getRelatedItems(currentItem);
                    const totalItems = relatedItems.length;

                    // Safe zone for ALL feeds (now they all have dummies)
                    const minSafe = itemWidth * 1.2;
                    const maxSafe = itemWidth * (totalItems - 0.2);

                    const safePosition = Math.max(minSafe, Math.min(maxSafe, storedPosition));

                    row.scrollLeft = safePosition;

                    requestAnimationFrame(() => {
                        row.style.scrollBehavior = 'smooth';

                        setTimeout(() => {
                            isXAxisRestoringRef.current = false;
                        }, 150);
                    });
                });
            }
            return;
        }

        // Initialize ALL feeds the same way
        const row = horizontalRefs.current[feedIndex];
        if (!row) return;

        const checkAndAlign = () => {
            if (row.children.length < 2) {
                requestAnimationFrame(checkAndAlign);
                return;
            }

            const firstReal = row.children[1];
            if (!firstReal) {
                requestAnimationFrame(checkAndAlign);
                return;
            }

            const width = firstReal.offsetWidth;
            if (width === 0) {
                requestAnimationFrame(checkAndAlign);
                return;
            }

            row.style.scrollBehavior = 'auto';
            row.scrollLeft = width; // ALL feeds start at index 1 now

            preserveXAxisScrollRef.current[feedIndex] = width;

            initializedXAxisRef.current.add(currentItem.id);
            hasInitializedHorizontalRef.current = true;
        };

        checkAndAlign();
    }, [feedIndex, isScrollCompleted, localFeed]);

    // Y-Axis scroll tracking with GSAP ticker
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        let itemHeight = window.innerHeight;
        let lastScrollTop = container.scrollTop;
        let scrollTimeout = null;
        let isFirstCheck = true;
        let initialScrollTop = 0;

        //  Tracking all async operations
        const rafIds = new Set();
        const timeoutIds = new Set();

        const scrollTick = () => {
            if (isLoopingRef.current) return;
            if (isMobileFeedGalleryOpenRef.current) {
                return;
            }

            const firstRealItem = container.children[1];
            if (firstRealItem) {
                itemHeightRef.current ||= firstRealItem.getBoundingClientRect().height;
                itemHeight = itemHeightRef.current;
            }
            if (
                isProcessingRef.current ||
                isLockedRef.current ||
                isYSuspendedRef.current ||
                !hasInitializedScroll.current
            )
                return;

            const currentScrollTop = container.scrollTop;

            // Stop if scroll didn’t change
            if (Math.abs(currentScrollTop - lastScrollTop) < 1) return;

            if (isFirstCheck) {
                isFirstCheck = false;
                initialScrollTop = currentScrollTop;
            } else if (!hasUserInteractedRef.current) {
                hasUserInteractedRef.current = true;
            }

            // LOOPING LOGIC
            const currentIndex = ((currentScrollTop + itemHeight * 0.5) / itemHeight) | 0;
            const realCount = localFeedRef.current.length;
            const DUMMY_TOP_INDEX = 0;
            const FIRST_REAL_INDEX = 1;
            const LAST_REAL_INDEX = realCount;
            const DUMMY_BOTTOM_INDEX = realCount + 1;

            if (localFeedRef.current.length > 1) {
                // BOTTOM TO TOP
                if (currentIndex === DUMMY_BOTTOM_INDEX && !isLoopingRef.current) {
                    isLoopingRef.current = true;
                    setIsScrollCompleted(false);

                    const raf1 = requestAnimationFrame(() => {
                        container.style.scrollBehavior = 'auto';

                        const target = itemHeight * FIRST_REAL_INDEX;
                        container.scrollTop = target;
                        lastScrollTop = target;

                        const firstItem = localFeedRef.current[0];
                        flushSync(() => {
                            setFeedIndex(0);
                            setFeedGallery(firstItem);
                        });

                        lastUpdateRef.current = {
                            id: firstItem.id,
                            index: 0,
                        };

                        const timeout1 = setTimeout(() => {
                            container.style.scrollBehavior = 'smooth';
                            const timeout2 = setTimeout(() => {
                                setIsScrollCompleted(true);
                            }, 500);
                            timeoutIds.add(timeout2);
                            const raf2 = requestAnimationFrame(() => {
                                const currentPos = container.scrollTop;
                                const snapTarget = Math.round(currentPos / itemHeight) * itemHeight;
                                if (Math.abs(currentPos - snapTarget) > 1) {
                                    container.scrollTop = snapTarget;
                                }
                                isLoopingRef.current = false;
                            });
                            rafIds.add(raf2);
                        }, 100);
                        timeoutIds.add(timeout1);
                    });

                    rafIds.add(raf1);
                    return;
                }

                // TOP TO BOTTOM
                if (currentIndex === DUMMY_TOP_INDEX && !isLoopingRef.current) {
                    setIsScrollCompleted(false);

                    isLoopingRef.current = true;

                    const raf1 = requestAnimationFrame(() => {
                        container.style.scrollBehavior = 'auto';

                        const target = itemHeight * LAST_REAL_INDEX;
                        container.scrollTop = target;
                        lastScrollTop = target;

                        const lastItem = localFeedRef.current[localFeedRef.current.length - 1];
                        const lastFeedIndex = localFeedRef.current.length - 1;

                        flushSync(() => {
                            setFeedIndex(lastFeedIndex);
                            setFeedGallery(lastItem);
                        });

                        lastUpdateRef.current = {
                            id: lastItem.id,
                            index: lastFeedIndex,
                        };

                        const timeout1 = setTimeout(() => {
                            container.style.scrollBehavior = 'smooth';
                            const timeout2 = setTimeout(() => {
                                setIsScrollCompleted(true);
                            }, 500);
                            timeoutIds.add(timeout2);
                            const raf2 = requestAnimationFrame(() => {
                                const currentPos = container.scrollTop;
                                const snapTarget = Math.round(currentPos / itemHeight) * itemHeight;
                                if (Math.abs(currentPos - snapTarget) > 1) {
                                    container.scrollTop = snapTarget;
                                }
                                isLoopingRef.current = false;
                            });
                            rafIds.add(raf2);
                        }, 100);
                        timeoutIds.add(timeout1);
                    });
                    rafIds.add(raf1);
                    return;
                }
            }
            // LOOPING LOGIC

            // Update scrollPos
            lastScrollTop = currentScrollTop;

            // Debounce to detect actual feed change
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
                timeoutIds.delete(scrollTimeout);
            }

            scrollTimeout = setTimeout(() => {
                isProcessingRef.current = true;

                let newIndex = Math.round(currentScrollTop / itemHeight);

                if (newIndex < FIRST_REAL_INDEX || newIndex > LAST_REAL_INDEX) {
                    isProcessingRef.current = false;
                    return;
                }

                // Convert to REAL feed index
                const feedIndexReal = newIndex - 1; // because feed[0] = index 1
                const currentFeed = localFeedRef.current;
                const newFeedItem = currentFeed[feedIndexReal];

                if (!newFeedItem) {
                    isProcessingRef.current = false;
                    return;
                }

                const isNewItem = newFeedItem.id !== lastUpdateRef.current.id;
                const isNewPosition = feedIndexReal !== lastUpdateRef.current.index;

                if (!isNewItem && !isNewPosition) {
                    isProcessingRef.current = false;
                    return;
                }

                // Update tracking refs
                lastUpdateRef.current = {
                    id: newFeedItem.id,
                    index: feedIndexReal,
                };

                const rowXAxisData = lastHorizontalUpdateRef.current[feedIndexReal];
                let itemToUse = newFeedItem; // Default to parent

                if (rowXAxisData && rowXAxisData.id) {
                    // This row has X-axis scroll history
                    const relatedItems = getRelatedItems(newFeedItem);
                    const xAxisItem = relatedItems.find((item) => item.id === rowXAxisData.id);

                    if (xAxisItem && !xAxisItem.__dummy) {
                        itemToUse = xAxisItem; // Using X-axis scrolled item
                    }
                }

                // URL updates
                if (itemToUse.type === 'smartphones') {
                    const url = generateSmartphoneURL(itemToUse);
                    window.history.replaceState({}, '', url);
                } else if (itemToUse.type === 'posts') {
                    const fullUrl = route('home') + generateURL(itemToUse);
                    window.history.replaceState({}, '', fullUrl);
                }

                // Find global index
                const globalIndex = feedRef.current.findIndex((item) => item.id === newFeedItem.id);

                const targetIndex = globalIndex >= 0 ? globalIndex : feedIndexReal;

                // Update state
                flushSync(() => {
                    setFeedIndex(targetIndex);
                    setFeedGallery(itemToUse);
                });

                parentFeedSlugRef.current = newFeedItem.slug;

                // Fetch more Y-axis (unchanged)
                const total = feedRef.current.length;
                const remaining = total - globalIndex - 1;

                if (
                    remaining <= 5 &&
                    nextPageUrl !== null &&
                    !isfetchingMoreYAxisFeed &&
                    !isLoopingRef.current
                ) {
                    fetchMoreYAxis();
                }

                isProcessingRef.current = false;
            }, 100);

            timeoutIds.add(scrollTimeout);
        };

        // Add to GSAP ticker
        gsap.ticker.add(scrollTick);

        return () => {
            gsap.ticker.remove(scrollTick);
            timeoutIds.forEach((id) => clearTimeout(id));
            if (scrollTimeout) clearTimeout(scrollTimeout);

            rafIds.forEach((id) => cancelAnimationFrame(id));

            timeoutIds.clear();
            rafIds.clear();

            isProcessingRef.current = false;
            isLoopingRef.current = false;
            isLockedRef.current = false;
        };
    }, []);

    // X-Axis scroll tracking with GSAP ticker
    useEffect(() => {
        if (!horizontalRefs.current || horizontalRefs.current.length === 0) return;

        const tickers = [];
        const timeouts = new Set();
        const rafIds = new Set();

        horizontalRefs.current.forEach((rowContainer, rowIndex) => {
            if (!rowContainer) return;

            let itemWidth = 0;
            let lastScrollLeft = rowContainer.scrollLeft;
            let scrollTimeout = null;
            let lastLoopTime = 0;

            const scrollTick = () => {
                if (isXAxisRestoringRef.current) {
                    return;
                }

                if (isMobileFeedGalleryOpenRef.current) {
                    return;
                }

                if (isFilterOpenRef.current) {
                    return;
                }

                if (useHomeNavStore.getState().navigatingHome) {
                    return;
                }

                if (
                    isXLoopingRef.current ||
                    isProcessingRef.current ||
                    !hasInitializedScroll.current ||
                    !hasInitializedHorizontalRef.current
                )
                    return;

                const children = rowContainer.children;
                if (!children || children.length < 2) return;

                const firstReal = children[1];

                if (firstReal) {
                    itemWidth =
                        itemWidthRef.current[rowIndex] ||
                        (itemWidthRef.current[rowIndex] = rowContainer.offsetWidth);
                }

                if (!itemWidth) return;

                const currentScrollLeft = rowContainer.scrollLeft;

                if (Math.abs(currentScrollLeft - lastScrollLeft) < 1) return;

                const parentFeedItem = localFeedRef.current[rowIndex];
                if (!parentFeedItem) return;

                if (isFeedOpeningDirectlyRef.current && !hasUserInteractedRef.current) {
                    const currentParentSlug = parentFeedSlugRef.current;
                    const thisRowParentSlug = parentFeedItem.slug;

                    if (currentParentSlug !== thisRowParentSlug) {
                        return;
                    }
                }

                const relatedItems = getRelatedItems(parentFeedItem);
                const totalItems = relatedItems.length;
                const relatedOnlyCount = totalItems - 1; // Parent + related items

                const FIRST_REAL = 1;
                const LAST_REAL = totalItems;

                const SL = currentScrollLeft;

                // For single-item feeds (relatedOnlyCount === 0), loop immediately
                const leftLimit = relatedOnlyCount === 0 ? itemWidth * 0.5 : itemWidth * 0.3;
                const rightLimit =
                    relatedOnlyCount === 0 ? itemWidth * 1.5 : itemWidth * (totalItems + 0.7);

                const now = Date.now();
                if (now - lastLoopTime < 300) return;

                // RIGHT LOOP (same for all feeds now)
                if (SL >= rightLimit) {
                    lastLoopTime = now;
                    isXLoopingRef.current = true;
                    setIsXAxisLooping(true);

                    const raf1 = requestAnimationFrame(() => {
                        rowContainer.style.scrollBehavior = 'auto';
                        rowContainer.style.scrollSnapType = 'none';
                        rowContainer.parentElement.style.scrollSnapType = 'none';
                        rowContainer.style.pointerEvents = 'none';

                        void rowContainer.offsetHeight;

                        const target = itemWidth;
                        rowContainer.scrollLeft = target;
                        lastScrollLeft = target;

                        preserveXAxisScrollRef.current[rowIndex] = target;

                        const firstItem = relatedItems[0];
                        lastHorizontalUpdateRef.current[rowIndex] = { id: firstItem.id, index: 0 };

                        // Update URL
                        if (firstItem.type === 'smartphones') {
                            const url = generateSmartphoneURL(firstItem);
                            window.history.replaceState({}, '', url);
                        } else {
                            const fullUrl = route('home') + generateURL(firstItem);
                            window.history.replaceState({}, '', fullUrl);
                        }

                        setFeedGallery(firstItem);

                        const timeout1 = setTimeout(() => {
                            rowContainer.style.scrollSnapType = '';
                            rowContainer.parentElement.style.scrollSnapType = '';

                            if (isIOS) {
                                const currentPos = rowContainer.scrollLeft;
                                const snapTarget = Math.round(currentPos / itemWidth) * itemWidth;
                                if (Math.abs(currentPos - snapTarget) > 5) {
                                    rowContainer.scrollLeft = snapTarget;
                                }

                                requestAnimationFrame(() => {
                                    rowContainer.style.scrollBehavior = 'smooth';
                                    rowContainer.style.pointerEvents = '';
                                });
                            } else {
                                rowContainer.style.scrollBehavior = 'smooth';
                                rowContainer.style.pointerEvents = '';
                            }
                        }, 100);

                        timeouts.add(timeout1);

                        isXLoopingRef.current = false;
                        const timeout2 = setTimeout(() => {
                            setIsXAxisLooping(false);
                        }, 1000);
                        timeouts.add(timeout2);
                    });
                    rafIds.add(raf1);

                    return;
                }

                // LEFT LOOP (same for all feeds now)
                if (SL <= leftLimit) {
                    lastLoopTime = now;
                    isXLoopingRef.current = true;
                    setIsXAxisLooping(true);

                    const raf1 = requestAnimationFrame(() => {
                        rowContainer.style.scrollBehavior = 'auto';
                        rowContainer.style.scrollSnapType = 'none';
                        rowContainer.parentElement.style.scrollSnapType = 'none';
                        rowContainer.style.pointerEvents = 'none';

                        const target = itemWidth * totalItems;
                        rowContainer.scrollLeft = target;
                        lastScrollLeft = target;

                        preserveXAxisScrollRef.current[rowIndex] = target;

                        const lastItem = relatedItems[relatedItems.length - 1];
                        lastHorizontalUpdateRef.current[rowIndex] = {
                            id: lastItem.id,
                            index: relatedItems.length - 1,
                        };

                        // Update URL
                        if (lastItem.type === 'smartphones') {
                            const url = generateSmartphoneURL(lastItem);
                            window.history.replaceState({}, '', url);
                        } else {
                            const fullUrl = route('home') + generateURL(lastItem);
                            window.history.replaceState({}, '', fullUrl);
                        }

                        setFeedGallery(lastItem);

                        const timeout1 = setTimeout(() => {
                            rowContainer.style.scrollSnapType = '';
                            rowContainer.parentElement.style.scrollSnapType = '';
                            rowContainer.style.scrollBehavior = 'smooth';
                            rowContainer.style.pointerEvents = '';
                        }, 50);
                        timeouts.add(timeout1);
                        isXLoopingRef.current = false;

                        const timeout2 = setTimeout(() => {
                            setIsXAxisLooping(false);
                        }, 1000);
                        timeouts.add(timeout2);
                    });
                    rafIds.add(raf1);
                    return;
                }

                // Rest of ticker logic stays the same...
                lastScrollLeft = currentScrollLeft;

                if (scrollTimeout) {
                    clearTimeout(scrollTimeout);
                    timeouts.delete(scrollTimeout);
                }

                scrollTimeout = setTimeout(() => {
                    isProcessingRef.current = true;

                    const newIndex = Math.round(currentScrollLeft / itemWidth);

                    if (newIndex < FIRST_REAL || newIndex > LAST_REAL) {
                        isProcessingRef.current = false;
                        return;
                    }

                    const arrayIndex = newIndex - 1;
                    const newItem = relatedItems[arrayIndex];

                    if (!newItem) {
                        isProcessingRef.current = false;
                        return;
                    }

                    const lastUpdate = lastHorizontalUpdateRef.current[rowIndex] || {};
                    const isNewItem = lastUpdate.id !== newItem.id;
                    const isNewIndex = lastUpdate.index !== arrayIndex;

                    if (!isNewItem && !isNewIndex) {
                        isProcessingRef.current = false;
                        return;
                    }

                    lastHorizontalUpdateRef.current[rowIndex] = {
                        id: newItem.id,
                        index: arrayIndex,
                    };

                    preserveXAxisScrollRef.current[rowIndex] = currentScrollLeft;
                    if (newItem.type === 'smartphones') {
                        const url = generateSmartphoneURL(newItem);
                        window.history.replaceState({}, '', url);
                    } else if (newItem.type === 'posts') {
                        const fullUrl = route('home') + generateURL(newItem);
                        window.history.replaceState({}, '', fullUrl);
                    }

                    flushSync(() => {
                        setFeedGallery(newItem);
                    });

                    const slug = parentFeedItem.slug;
                    const relatedFeedItems = localRelatedFeedRef.current[slug] || [];
                    const remaining = relatedFeedItems.length - arrayIndex;

                    if (remaining <= 3) {
                        const nextUrls = relatedFeedNextUrlsRef.current;

                        const doesNotExist = !nextUrls.hasOwnProperty(slug);
                        const existsButNull =
                            nextUrls.hasOwnProperty(slug) && nextUrls[slug] === null;
                        const existsAndNotNull =
                            nextUrls.hasOwnProperty(slug) && nextUrls[slug] !== null;

                        if (relatedFeedItems.length > 4) {
                            if (doesNotExist || existsAndNotNull) {
                                fetchRelatedFeed(slug);
                            }
                        }
                    }

                    isProcessingRef.current = false;
                }, 100);

                //  push scrollTimeout in global timeouts
                timeouts.add(scrollTimeout);
            };

            gsap.ticker.add(scrollTick);
            tickers.push(scrollTick);
        });

        return () => {
            tickers.forEach((t) => gsap.ticker.remove(t));
            timeouts.forEach((timeout) => clearTimeout(timeout));
            rafIds.forEach((raf) => cancelAnimationFrame(raf));

            timeouts.clear();
            rafIds.clear();

            isXLoopingRef.current = false;
            isXAxisRestoringRef.current = false;
            hasInitializedHorizontalRef.current = false;
        };
    }, [isScrollCompleted, localFeed]);

    // INITIALIZING AUTOPLAY FROM COOKIE (ON MOUNT)
    useEffect(() => {
        initAutoplay();
    }, [initAutoplay]);

    // MAIN VIDEO CONTROL  SET ACTIVE VIDEO
    // This runs whenever feedGallery changes (Y-axis OR X-axis scroll)

    useEffect(() => {
        // only trigger after feedGallery is stable
        const timeoutId = setTimeout(() => {
            if (!feedGallery) {
                setActiveVideo(null);
                return;
            }

            // Only set active if current item is a video post
            if (feedGallery.type === 'posts' && feedGallery.post_video_urls?.length > 0) {
                setActiveVideo(feedGallery.slug);
            } else {
                setActiveVideo(null);
            }
        }, 200);

        // Cleanup timeout if feedGallery changes again quickly
        return () => clearTimeout(timeoutId);
    }, [feedGallery, setActiveVideo]);

    // PAUSE ALL WHEN GALLERY OPENS
    useEffect(() => {
        if (MobileFeedGalleryOpen) {
            pauseAll();
        }
    }, [MobileFeedGalleryOpen, pauseAll]);

    // Cleanups
    useEffect(() => {
        return () => {
            const refAllowsCleanup = shouldCleanupBrowserHistoryRef.current;
            const storeAllowsCleanup = useFeedCleanupStore.getState().shouldCleanupBrowserHistory;

            if (refAllowsCleanup && storeAllowsCleanup) {
                window.history.replaceState({}, '', '/');
            }

            // Reset store flag for the next feed mount (defensive reset)
            useFeedCleanupStore.getState().setShouldCleanupBrowserHistory(true);

            setFeedGallery(null);
            setFeedOpen(false);
            setIsScrollCompleted(false);
            setLocalFeed(null);

            // Clear caches
            relatedItemsCache.current.clear();
            initializedXAxisRef.current.clear();

            // Reset refs
            preserveXAxisScrollRef.current = {};
            lastHorizontalUpdateRef.current = {};
            itemWidthRef.current = {};
            localFeedRef.current = [];
            feedRef.current = [];
            localRelatedFeedRef.current = null;

            // Reset flags
            isLoopingRef.current = false;
            isXLoopingRef.current = false;
            isProcessingRef.current = false;
            isLockedRef.current = false;
            isYSuspendedRef.current = false;
            isXAxisRestoringRef.current = false;
            hasInitializedScroll.current = false;
            hasInitializedHorizontalRef.current = false;
            hasUserInteractedRef.current = false;

            parentFeedSlugRef.current = null;
            itemHeightRef.current = null;
            isSinglePageRef.current = false;

            // Reset stateful memory holders
            setLoadedItems(new Set());
        };
    }, []);

    return (
        <>
            {createPortal(
                <div className="fixed inset-0 z-50 overflow-hidden bg-backgroundLight text-main-text-light scrollbar-none dark:bg-backgroundDark dark:text-main-text-dark">
                    {(!isScrollCompleted || isXAxisLooping) && <RenderFeedItemSkeleton index={0} />}
                    <div
                        className={`${MobileFeedGalleryOpen ? 'overflow-hidden' : ''} scrollbar-none`}
                        ref={scrollContainerRef}
                        style={{
                            height: '100%',
                            overflowY: MobileFeedGalleryOpen ? 'hidden' : 'auto',
                            scrollSnapType: MobileFeedGalleryOpen ? 'none' : 'y mandatory',
                            overscrollBehavior: 'contain',
                            WebkitOverflowScrolling: 'touch',
                            contain: isIOS ? 'style' : 'size layout style',
                            overflowX: 'hidden',
                            margin: 0,
                            padding: 0,
                            display: 'block',
                            ...(isIOS && {
                                transform: 'translateZ(0)',
                                WebkitTransform: 'translateZ(0)',
                                minHeight: '100%',
                            }),
                        }}
                    >
                        {/* DUMMY Y Axis TOP CLONE */}
                        {localFeed.length > 1 && (
                            <div
                                className="min-w-full snap-start"
                                style={{
                                    height: feedItemHeight,
                                    scrollSnapAlign: 'start',
                                    scrollSnapStop: 'always',
                                    pointerEvents: 'none',
                                    userSelect: 'none',
                                }}
                                aria-hidden="true"
                            >
                                <RenderFeedItemSkeleton index={0} />
                            </div>
                        )}

                        {localFeed.map((item, index) => {
                            const relatedItems = wrapWithHorizontalDummies(getRelatedItems(item));
                            return (
                                <div
                                    key={`feed-${item.id}`}
                                    className="feed-page min-w-full snap-start"
                                    style={{
                                        height: feedItemHeight,
                                        contentVisibility: isIOS ? 'visible' : 'auto',
                                        contain: isIOS ? 'style' : 'layout',
                                        willChange: 'scroll-position',
                                        ...(isIOS && {
                                            minHeight: feedItemHeight,
                                            maxHeight: feedItemHeight,
                                            position: 'relative',
                                        }),
                                    }}
                                >
                                    <div
                                        className="flex w-full snap-x snap-mandatory overflow-x-auto scrollbar-none"
                                        ref={(el) => {
                                            horizontalRefs.current[index] = el;

                                            if (!el) return;

                                            // Skip if no related items or already initialized
                                            if (initializedXAxisRef.current.has(item.id)) return;

                                            // Try immediate alignment
                                            const tryAlign = () => {
                                                const firstReal = el.children[1];
                                                if (!firstReal) return false;

                                                const width = firstReal.offsetWidth;
                                                if (width === 0) return false;

                                                el.style.scrollBehavior = 'auto';
                                                el.scrollLeft = width;
                                                initializedXAxisRef.current.add(item.id);

                                                if (index === feedIndex) {
                                                    hasInitializedHorizontalRef.current = true;
                                                }

                                                return true;
                                            };

                                            // Try immediate alignment
                                            if (!tryAlign()) {
                                                // If failed, try again after a frame
                                                requestAnimationFrame(() => {
                                                    tryAlign();
                                                });
                                            }
                                        }}
                                        style={{
                                            width: '100%',
                                            height: feedItemHeight,
                                            maxWidth: '100%',
                                            overflowY: 'hidden',
                                            touchAction: 'pan-y pan-x',
                                            WebkitOverflowScrolling: 'touch',
                                            display: 'flex',
                                            flexDirection: 'row',
                                            willChange: 'transform',
                                            contain: 'layout',
                                        }}
                                    >
                                        {relatedItems.map((relatedItem, relatedIndex) =>
                                            renderFeedItem(
                                                relatedItem,
                                                relatedIndex > 0,
                                                `${item.id}-rel-${relatedIndex}`,
                                            ),
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* DUMMY Y Axis BOTTOM CLONE */}
                        {localFeed.length > 1 && (
                            <div
                                className="min-w-full snap-start"
                                style={{
                                    height: feedItemHeight,
                                    scrollSnapAlign: 'start',
                                    scrollSnapStop: 'always',
                                    pointerEvents: 'none',
                                    userSelect: 'none',
                                }}
                                aria-hidden="true"
                            >
                                <RenderFeedItemSkeleton index={1} />
                            </div>
                        )}
                    </div>

                    {/*  TOGGLE BUTTON - Only visible in MobileFeed */}
                    {/* <BottomBarToggle /> */}
                </div>,
                document.getElementById('modal-root') || document.body,
            )}

            {MobileFeedGalleryOpen && (
                <MobileFeedGallery
                    feedGallery={
                        manualFeedGalleryItem?.slug === feedGallery?.slug
                            ? feedGallery
                            : manualFeedGalleryItem
                    }
                    setShowQrCode={setShowQrCode}
                    setLinkCopied={setLinkCopied}
                    auth={auth}
                    currency={currency}
                    navigateToHashtag={navigateToHashtag}
                    placeholderImage={placeholderImage}
                    generateURL={generateURL}
                    generateSmartphoneURL={generateSmartphoneURL}
                    showErrorMessage={showErrorMessage}
                    showInfoMessage={showInfoMessage}
                    ErrorMessage={ErrorMessage}
                    InfoMessage={InfoMessage}
                    setInfoMessage={setInfoMessage}
                    setShowInfoMessage={setShowInfoMessage}
                    setErrorMessage={setErrorMessage}
                    setShowErrorMessage={setShowErrorMessage}
                    setBookmarkStatusChanged={setBookmarkStatusChanged}
                    isDarkMode={isDarkMode}
                    setMobileFeedGalleryOpen={setMobileFeedGalleryOpen}
                    shouldCleanupBrowserHistoryRef={shouldCleanupBrowserHistoryRef}
                    spatiotemporalInfoModal={spatiotemporalInfoModal}
                    setSpatiotemporalInfoModal={setSpatiotemporalInfoModal}
                    __={__}
                />
            )}
        </>
    );
};

export default memo(MobileFeed);
