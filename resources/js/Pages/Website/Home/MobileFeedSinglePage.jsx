import { router } from '@inertiajs/react';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import MobileFeedGallery from './MobileFeedGallery';
import useDarkMode from '@/Hooks/useDarkMode';
import Spinner from '@/Components/Spinner';
import { useFilterStore } from '@/Hooks/useFilterStore';
import { useVideoStore } from '@/Hooks/useVideoStore';
import InstagramStyledVideoPlayer from '@/Components/InstagramStyledVideoPlayer';

const MobileFeedSinglePage = ({
    feedGallery,
    setShowQrCode,
    setLinkCopied,
    setBookmarkStatusChanged,
    auth,
    generateURL,
    navigateToHashtag,
    MobileFeedGalleryOpen,
    setMobileFeedGalleryOpen,
    cart_items,
    currency,
    placeholderImage,
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
    setFeedGallery,
    setFeedOpen,
    setMediaItems,
    setFeedIndex,
    __,
}) => {
    useEffect(() => {
        const url = new URL(window.location);
        window.history.pushState({}, '', url.toString());
    }, []);


    const containerRef = useRef(null);
    // Manually Passing Correct Feed To Feed Gallery To Open
    const [manualFeedGalleryItem, setManualFeedGalleryItem] = useState(null);

    const isFeedOpeningDirectlyRef = useRef(isFeedOpeningDirectly);
    const isMobileFeedGalleryOpenRef = useRef(MobileFeedGalleryOpen);

    const [mobileFeedGalleryOpening, setMobileFeedGalleryOpening] = useState(false);


    const actionDropdownRef = useRef(null);
    const [actionDropdownOpen, setActionDropdownOpen] = useState(null);


    const isDarkMode = useDarkMode();

    // Video Player Control Zustand Hook Methods
    const setActiveVideo = useVideoStore((state) => state.setActiveVideo);
    const pauseAll = useVideoStore((state) => state.pauseAll);
    const videoAutoplay = useVideoStore((state) => state.autoplay);
    const setAutoplay = useVideoStore((state) => state.setAutoplay);
    const initAutoplay = useVideoStore((state) => state.initAutoplay);



    // Helper Function to Render Feed Skeleton before Showing Actual Feed After Opening
    const RenderFeedItemSkeleton = (index) => {
        return (
            <div
                key={`skeleton-${index}`}
                className="relative min-w-full cursor-not-allowed pointer-events-none snap-start"
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
                }}
                onTouchStart={(e) => e.preventDefault()}
                onTouchMove={(e) => e.preventDefault()}
                onTouchEnd={(e) => e.preventDefault()}
            >
                {/* HEADER SKELETON */}
                <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-3 pb-2">
                    {/* Tag skeleton */}
                    <div className="w-20 h-5 bg-gray-200 rounded animate-pulse dark:bg-zinc-700" />

                    {/* Three dots skeleton */}
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse dark:bg-zinc-700" />
                </div>

                {/* MEDIA AREA SKELETON */}
                <div className="relative w-full h-full overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="object-cover w-full h-full bg-gray-200 animate-pulse dark:bg-zinc-700" />
                    </div>
                </div>

                {/*  OVERLAY BOTTOM SKELETON (IMMERVIEW STYLE)  */}
                <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/50 via-black/20 to-transparent px-4 pb-[90px] pt-6">
                    <div className="flex items-center justify-between gap-3">
                        {/* Text skeleton */}
                        <div className="flex-1 space-y-2">
                            <div className="w-full h-4 bg-gray-200 rounded animate-pulse dark:bg-zinc-700" />
                            <div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse dark:bg-zinc-700" />
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
            <div className="relative w-full h-full overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="object-cover w-full h-full bg-gray-200 animate-pulse dark:bg-zinc-700" />
                </div>
            </div>
        );
    };

    // State And Effect For Tracking The height Of Feed Item To Adjust Window
    const [feedItemHeight, setFeedItemHeight] = useState(window.innerHeight);

    useEffect(() => {
        const container = containerRef.current;

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
                if (container) {

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


    // Helper function to render a single feed item (used for both main and related items)
    const renderFeedItem = useCallback(
        (item, isRelated = false, index) => {

            const plain = item?.content
                ? item.content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
                : '';

            // Text Post Logic Starts
            const isTextPost =
                item.type === 'posts' &&
                item.post_image_urls?.length === 0 &&
                item.post_video_urls?.length === 0;


            // View More Button Height
            const viewMoreHeightPx = 100;

            // approx line height for: text-sm + leading-relaxed
            const lineHeightPx = 18;

            // 80% of screen height
            const maxHeightPx =
                windowSize.height * 0.7 - viewMoreHeightPx;

            // how many lines fit
            const maxLines = Math.floor(maxHeightPx / lineHeightPx);

            // average characters per line
            const avgCharsPerLine = windowSize.width < 480 ? 28 : 40;

            // total characters allowed in visible area
            const maxCharsAllowed = maxLines * avgCharsPerLine;

            // should we show "View More"?
            const shouldShowMore =
                isTextPost && plain.length > maxCharsAllowed;
            // Text Post Logic Ends

            const shouldEagerLoad = true;

            const hasVideo = item.type === 'posts' && item.post_video_urls?.length > 0;
            const hasPoster = hasVideo && item.post_video_urls[0]?.thumbnail_url;

            const isLoaded = isTextPost || hasPoster;



            return (
                <div
                    key={index}
                    className="min-w-full feed-page snap-start"
                    style={{
                        height: feedItemHeight,
                        scrollSnapAlign: 'start',
                        scrollSnapStop: 'always',
                        contain: 'layout',
                        willChange: 'transform',
                        margin: 0,
                        padding: 0,
                        border: 'none',
                        display: 'block',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        lineHeight: 0,
                    }}
                >
                    {/* Header: Tag + Three Dots */}
                    <div
                        className={`absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-4 pt-4 ${isTextPost ? 'text-main-text-light dark:text-main-text-dark' : 'text-main-text-dark '}`}
                    >
                        <button
                            onClick={() => navigateToHashtag(item.tag)}
                            className="text-[18px] font-semibold"
                        >
                            {item.tag}
                        </button>

                        <div
                            className="relative"
                            ref={(el) => {
                                if (actionDropdownOpen === index) {
                                    actionDropdownRef.current = el;
                                }
                            }}
                        >
                            <button
                                className="font-semibold"
                                data-dropdown-toggle="true"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActionDropdownOpen(
                                        actionDropdownOpen === index ? null : index,
                                    );
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2.5}
                                    stroke="currentColor"
                                    className="h-7 w-7"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="
      M3.5 12a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0
      M12 12a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0
      M20.5 12a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0
    "
                                    />
                                </svg>
                            </button>

                            {actionDropdownOpen === index && (
                                <div
                                    data-dropdown-menu="true"
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 z-50 w-56 border rounded-md top-full border-surface-3-light bg-backgroundLight dark:border-surface-3-dark dark:bg-surface-1-dark"
                                >
                                    <div className="py-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowQrCode(true);
                                                setActionDropdownOpen(null);
                                            }}
                                            className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light hover:bg-surface-2-light dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="w-5 h-5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"
                                                />
                                            </svg>
                                            <span>{__('QR Code')}</span>
                                        </button>

                                        {item.type === 'posts' && (
                                            <>
                                                {auth?.user && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.put(
                                                                route(
                                                                    'website.posts.bookmark',
                                                                    item?.id,
                                                                ),

                                                                {
                                                                    post_id: item?.id,
                                                                },
                                                                {
                                                                    preserveScroll: true,
                                                                    preserveUrl: true,
                                                                    onSuccess: () => {
                                                                        item.is_bookmarked =
                                                                            !item.is_bookmarked;

                                                                        setBookmarkStatusChanged(
                                                                            true,
                                                                        );
                                                                    },
                                                                    onError: (e) => {
                                                                        setShowErrorMessage(true);
                                                                        setErrorMessage(e.message);
                                                                    },
                                                                },
                                                            );
                                                        }}
                                                        className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light hover:bg-surface-2-light dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill={
                                                                item?.is_bookmarked
                                                                    ? isDarkMode
                                                                        ? '#fff'
                                                                        : '#222'
                                                                    : 'none'
                                                            }
                                                            stroke={
                                                                item?.is_bookmarked
                                                                    ? isDarkMode
                                                                        ? '#fff'
                                                                        : '#222'
                                                                    : 'currentColor'
                                                            }
                                                            strokeWidth={1.5}
                                                            viewBox="0 0 24 24"
                                                            className="size-5"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                                                            />
                                                        </svg>
                                                        <span>
                                                            {item?.is_bookmarked
                                                                ? __('Remove Bookmarker')
                                                                : __('Bookmarker')}
                                                        </span>
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => {
                                                        const url =
                                                            route('home') + generateURL(item);

                                                        navigator.clipboard.writeText(url.trim());
                                                        setLinkCopied(true);
                                                        setActionDropdownOpen(null);
                                                    }}
                                                    className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light hover:bg-surface-2-light dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="w-5 h-5"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                                                        />
                                                    </svg>
                                                    <span>{__('Copy Link')}</span>
                                                </button>

                                            </>
                                        )}

                                        {item.type === 'smartphones' && (
                                            <button
                                                onClick={() => {
                                                    const url =
                                                        route('home') + '?m-slug=' + item.slug + '&single_page=true&direct=true';
                                                    navigator.clipboard.writeText(url.trim());
                                                    setLinkCopied(true);
                                                    setActionDropdownOpen(null);
                                                }}
                                                className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light hover:bg-surface-2-light dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="w-5 h-5"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                                                    />
                                                </svg>
                                                <span>{__('Copy Link')}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {!isLoaded && <RenderFeedItemContentSkeleton />}

                    {/* Image + Videos - Takes remaining space */}
                    <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                            lineHeight: 0,
                            display: 'block',
                            overflow: 'hidden',
                        }}
                    >
                        {!isTextPost && (
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
                                {item?.images?.length > 0 && (
                                    <img
                                        key={item.id}
                                        src={item.images[0] || placeholderImage}
                                        alt={item.name}
                                        className="object-cover object-center w-full h-full rounded-none"
                                        loading={shouldEagerLoad ? 'eager' : 'lazy'}
                                        fetchpriority={shouldEagerLoad ? 'high' : 'low'}
                                        decoding="async"
                                        style={{
                                            display: 'block',
                                            verticalAlign: 'top',
                                        }}

                                        onError={(e) => {

                                            if (e.target.src !== placeholderImage) {
                                                e.target.src = placeholderImage;
                                            }
                                        }}
                                    />
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
                                        className="object-cover object-center w-full h-full rounded-none"
                                        loading={shouldEagerLoad ? 'eager' : 'lazy'}
                                        fetchpriority={shouldEagerLoad ? 'high' : 'low'}
                                        decoding="async"
                                        style={{
                                            display: 'block',
                                            verticalAlign: 'top',
                                        }}

                                        onError={(e) => {

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
                                        className="object-cover object-center w-full h-full"

                                        Preload={shouldEagerLoad ? 'metadata' : 'none'}
                                        timelinePadding={70}
                                        isMainFeed={true}
                                    />
                                ) : (
                                    isTextPost && (
                                        <div className="absolute inset-0 px-4 pt-20 pb-40 overflow-hidden">
                                            <div
                                                className="
                whitespace-pre-line
                break-words
                text-sm
                leading-relaxed
                text-main-text-light
                dark:text-main-text-dark
                line-clamp-[var(--text-lines)]
            "
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
                            className={`absolute left-0 right-0 z-20 px-5 pt-3 text-main-text-dark bottom-20`}
                        >
                            <div className="mb-1 flex items-center justify-between text-[14px] font-semibold">
                                <span className="text-[20px]">
                                    {currency?.symbol}
                                    {item.selling_info?.total_price}
                                </span>

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
                                                <span>{__('Shop Now')}</span>

                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="w-4 h-4"
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

                            <div className="flex items-center justify-between gap-3 mb-1">
                                <p className="min-w-0 flex-1 text-[15px] font-semibold leading-relaxed text-main-text-dark">
                                    <span
                                        className="!display-['-webkit-box'] line-clamp-2 break-all [&_*]:inline"
                                        dangerouslySetInnerHTML={{
                                            __html: plain
                                        }}
                                    />
                                </p>
                            </div>
                        </div>
                    )}

                    {item.type === 'posts' && (
                        <div
                            className={`absolute left-0 right-0 z-20 px-5 pt-3 text-main-text-dark bottom-20 ${hasVideo ? 'bottom-[100px]' : ''}`}
                        >
                            <div className="flex items-center justify-end mb-1">
                                {isTextPost ? (
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
                                            className="flex h-[30px] shrink-0 items-center justify-center gap-2 rounded-full bg-transparent text-[14px] font-semibold dark:text-main-text-dark text-main-text-light transition-colors"
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
                                                            className="w-4 h-4"
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
                                                        className="w-4 h-4"
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
                                                __html: plain
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
        [
            videoAutoplay,
            mobileFeedGalleryOpening,
            actionDropdownOpen,
            isDarkMode,
        ],
    );

    // Tracking GLobal Filter Open Or Not
    const isFilterOpenRef = useRef(false);

    // subscribing to filter store
    useEffect(() => {
        return useFilterStore.subscribe((state) => {
            isFilterOpenRef.current = state.isOpen;
        });
    }, []);


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


    // SETTING THE PARENT SLUG ON MOUNT
    useEffect(() => {
        if (!feedGallery) return;;
        setManualFeedGalleryItem(feedGallery);
    }, []);

    // DROPDOWN Auto Closing LOGIC
    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        const handleClick = (event) => {
            const clickedToggle = event.target.closest('[data-dropdown-toggle]');
            if (clickedToggle) {
                return; // Let the toggle button handler deal with it
            }

            // Check if click is inside any dropdown menu
            const clickedInsideDropdown = event.target.closest('[data-dropdown-menu]');
            if (clickedInsideDropdown) {
                return; // Ignore clicks inside dropdown
            }

            // Check if click is inside dropdown content
            if (actionDropdownRef.current && actionDropdownRef.current.contains(event.target)) {
                return; // Ignore clicks inside dropdown
            }

            // Close dropdown for any other clicks
            setActionDropdownOpen(null);
        };

        container.addEventListener('mousedown', handleClick);
        return () => container.removeEventListener('mousedown', handleClick);
    }, [actionDropdownOpen]);


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


    // cleanup
    useEffect(() => {

        return () => {
            window.history.replaceState(
                {},
                '',
                window.location.pathname,
            );
            setFeedGallery(null);
            setMediaItems([]);
            setFeedOpen(false);
            setFeedIndex(0);

        }

    }, [])

    return (
        <>
            {createPortal(
                <div className="fixed inset-0 z-50 bg-backgroundLight text-main-text-light dark:bg-backgroundDark dark:text-main-text-dark">

                    {/* Optional skeleton */}
                    {!feedGallery && <RenderFeedItemSkeleton index={0} />}

                    {/* SINGLE FEED */}
                    {feedGallery && (
                        <div
                            ref={containerRef}
                            style={{
                                height: feedItemHeight,
                                width: '100%',
                                position: 'relative',
                            }}
                        >
                            {renderFeedItem(feedGallery, false, feedGallery.id)}
                        </div>
                    )}
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
                    cart_items={cart_items}
                    navigateToHashtag={navigateToHashtag}
                    placeholderImage={placeholderImage}
                    generateURL={generateURL}
                    showErrorMessage={showErrorMessage}
                    showInfoMessage={showInfoMessage}
                    ErrorMessage={ErrorMessage}
                    InfoMessage={InfoMessage}
                    setInfoMessage={setInfoMessage}
                    setShowInfoMessage={setShowInfoMessage}
                    setErrorMessage={setErrorMessage}
                    setShowErrorMessage={setShowErrorMessage}
                    __={__}
                />
            )}
        </>
    );
};

export default memo(MobileFeedSinglePage);
