import { router } from '@inertiajs/react';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import gsap from 'gsap';
import MobileFeedGallery from './MobileFeedGallery';
import useDarkMode from '@/Hooks/useDarkMode';
import Spinner from '@/Components/Spinner';
import { useFilterStore } from '@/Hooks/useFilterStore';
import { useVideoStore } from '@/Hooks/useVideoStore';
import { useHomeNavStore } from '@/Hooks/useHomeNavStore';
import InstagramStyledVideoPlayer from '@/Components/InstagramStyledVideoPlayer';
import { useBottomBarStore } from '@/Hooks/useBottomBarStore';
// import BottomBarToggle from '@/Components/BottomBarToggle';

const MobileFeed = ({
    feed,
    feedGallery,
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
    cart_items,
    currency,
    placeholderImage,
    relatedFeed,
    fetchRelatedFeed,
    relatedFeedNextUrlsRef,
    nextPageUrl,
    isfetchingMoreYAxisFeed,
    isFeedOpeningDirectly,

}) => {


    useEffect(() => {
        const url = new URL(window.location);
        window.history.pushState({}, '', url.toString());
    }, []);

    // Not Needed RN He Said To Remove It
    //  Get Zustand methods
    // const setBottomBarVisible = useBottomBarStore(state => state.setVisible);
    const { isVisible } = useBottomBarStore();

    // Local feed state for seamless looping
    const [localFeed, setLocalFeed] = useState([]);


    // Manually Passing Correct Feed To Feed Gallery To Open
    const [manualFeedGalleryItem, setManualFeedGalleryItem] = useState(null);

    const isFeedOpeningDirectlyRef = useRef(isFeedOpeningDirectly);
    const isMobileFeedGalleryOpenRef = useRef(MobileFeedGalleryOpen);
    const hasUserInteractedRef = useRef(false);

    // its for FEED ITEMS To TRACK WHIHC ITEMS LOADED OR WHICH ARENT To SHOW SKELETON
    const [loadedItems, setLoadedItems] = useState(new Set());

    const [mobileFeedGalleryOpening, setMobileFeedGalleryOpening] = useState(false);


    const scrollContainerRef = useRef(null);
    const actionDropdownRef = useRef(null);
    const [actionDropdownOpen, setActionDropdownOpen] = useState(null);


    // SCROLLING TRACKING REFS
    const hasInitializedScroll = useRef(false);
    const isLoopingRef = useRef(false);
    const lastUpdateRef = useRef({ id: null, index: null });
    const isLockedRef = useRef(false);
    const lockTimeoutRef = useRef(null);
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
    const setActiveVideo = useVideoStore(state => state.setActiveVideo);
    const pauseAll = useVideoStore(state => state.pauseAll);
    const videoAutoplay = useVideoStore(state => state.autoplay);
    const setAutoplay = useVideoStore(state => state.setAutoplay);
    const initAutoplay = useVideoStore(state => state.initAutoplay);



    // Helper Function to Get Related Feed Count
    const getRelatedCount = (slug) => {
        if (!slug || !localRelatedFeedRef.current) return 0;
        const arr = localRelatedFeedRef.current[slug];
        return arr ? arr.length : 0;
    };

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
    const RenderFeedItemSkeleton = (index) => {
        return (
            <div
                key={`skeleton-${index}`}
                className="relative min-w-full snap-start"
                style={{
                    height: '100%',
                    scrollSnapAlign: 'start',
                    scrollSnapStop: 'always',
                }}
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
                <div className="absolute bottom-0 left-0 right-0 px-4 pb-[90px] pt-6
                            z-30 bg-gradient-to-t from-black/50 via-black/20 to-transparent">

                    <div className="flex items-center justify-between gap-3">

                        {/* Text skeleton */}
                        <div className="flex-1 space-y-2">
                            <div className="w-full h-4 bg-gray-200 rounded animate-pulse dark:bg-zinc-700" />
                            <div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse dark:bg-zinc-700" />
                        </div>

                        {/* Button skeleton */}
                        <div className="h-[30px] w-[90px] shrink-0 rounded-lg bg-gray-200 animate-pulse dark:bg-zinc-700" />
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
        const container = scrollContainerRef.current;

        const updateHeight = () => {
            if (!container) return;

            //  Store current scroll position BEFORE resize
            const oldHeight = feedItemHeight;
            const currentScrollTop = container.scrollTop;

            // Calculate which item we're currently viewing
            const currentItemIndex = Math.round(currentScrollTop / oldHeight);

            // Update to new height
            const newHeight = window.innerHeight;
            setFeedItemHeight(newHeight);

            // Restore scroll position after height updates
            requestAnimationFrame(() => {
                if (container && hasInitializedScroll.current) {
                    // Account for dummy item at top (index 0)
                    const targetScroll = (currentItemIndex) * newHeight;

                    container.style.scrollBehavior = "auto";
                    container.scrollTop = targetScroll;

                    // Re-enable smooth scrolling
                    requestAnimationFrame(() => {
                        container.style.scrollBehavior = "smooth";
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

        window.addEventListener("resize", handleResize);
        window.addEventListener("orientationchange", handleResize);

        return () => {
            clearTimeout(resizeTimeout);
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("orientationchange", handleResize);
        };
    }, [feedItemHeight]);




    // Helper Function To Render Dummy items WithActual Related Feed To Perform Looping

    const wrapWithHorizontalDummies = useMemo(() => {
        return (items) => {
            if (!items || items.length === 0 || !parentFeedSlugRef.current) return items;

            const slug = parentFeedSlugRef.current;
            // const relatedCount = getRelatedCount(slug);

            // No related items, return as-is
            // if (relatedCount < 1) return items;

            // Has related items, add dummies
            return [
                { __dummy: "left" },
                ...items,
                { __dummy: "right" },
            ];
        };
    }, [localRelatedFeedRef.current]);



    // Helper function to render a single feed item (used for both main and related items)
    const renderFeedItem = useCallback((item, isRelated = false, index) => {

        // const relatedCount = getRelatedCount(parentFeedSlugRef.current);

        const headerHeight = 0.;


        // if (relatedCount < 1 && item?.__dummy) {
        //     return (
        //         <div
        //             key={index}
        //             className="min-w-full snap-start"
        //             style={{
        //                 height: "100%",
        //                 opacity: 0,
        //                 pointerEvents: "none",
        //                 userSelect: "none",
        //             }}
        //             aria-hidden="true"
        //         />
        //     );
        // }
        if (item?.__dummy) {
            return (
                <div
                    key={index}
                    className="min-w-full snap-start"
                    style={{
                        height: "100%",
                        opacity: 0,
                        pointerEvents: "none",
                        userSelect: "none",
                    }}
                    aria-hidden="true"
                />
            );
        }



        const plain = item?.content ? item.content.replace(/<[^>]+>/g, '') : null;

        const charsPerLine = 80;
        const clampLimit = 18 * charsPerLine;
        const shouldShowMore = plain?.length > clampLimit;


        const isTextPost = item.type === 'posts' &&
            item.post_image_urls?.length === 0 &&
            item.post_video_urls?.length === 0;




        const isCurrent = item?.slug === manualFeedGalleryItem?.slug;


        const currentIndex = localFeed.findIndex(f => f.slug === manualFeedGalleryItem?.slug);
        const thisItemIndex = localFeed.findIndex(f => f.slug === item?.slug);
        const isAdjacent = Math.abs(currentIndex - thisItemIndex) <= 1;




        const shouldEagerLoad = isCurrent || isAdjacent;



        const hasVideo = item.type === 'posts' && item.post_video_urls?.length > 0;
        const hasPoster = hasVideo && item.post_video_urls[0]?.thumbnail_url;


        const isLoaded = isTextPost ||
            loadedItems.has(item?.slug) ||
            hasPoster;

        const handleOnLoad = () => {
            if (item?.slug) {
                setLoadedItems(prev => new Set(prev).add(item.slug));
            }
        };

        return (
            <div
                key={index}
                className="min-w-full feed-page snap-start "
                style={{
                    height: feedItemHeight,
                    scrollSnapAlign: 'start',
                    scrollSnapStop: 'always',
                    contain: 'layout style paint',
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
                <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between  px-4 pt-6 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] text-white ">
                    <button
                        onClick={() => navigateToHashtag(item.tag)}
                        className="text-sm font-bold"
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
                            className='font-bold'
                            data-dropdown-toggle="true"
                            onClick={(e) => {

                                e.stopPropagation();
                                setActionDropdownOpen(
                                    actionDropdownOpen === index ? null : index,
                                );
                            }
                            }
                        >
                            <svg

                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                stroke="currentColor"
                                className="w-5 h-5"

                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                                />
                            </svg>
                        </button>

                        {actionDropdownOpen === index && (
                            <div
                                data-dropdown-menu="true"
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg top-8 dark:border-gray-700 dark:bg-deepcharcoal">
                                <div className="py-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowQrCode(true);
                                            setActionDropdownOpen(null);
                                        }}
                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
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
                                        <span>QR Code</span>
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
                                                                post_id:
                                                                    item?.id,
                                                            },
                                                            {
                                                                preserveScroll: true,
                                                                preserveUrl: true,
                                                                onSuccess:
                                                                    () => {
                                                                        item.is_bookmarked =
                                                                            !item.is_bookmarked;

                                                                        setBookmarkStatusChanged(
                                                                            true,
                                                                        );
                                                                    },
                                                                onError: (
                                                                    e,
                                                                ) => {
                                                                    setShowErrorMessage(
                                                                        true,
                                                                    );
                                                                    setErrorMessage(
                                                                        e.message,
                                                                    );
                                                                },
                                                            },
                                                        );
                                                    }}
                                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill={
                                                            item?.is_bookmarked
                                                                ? isDarkMode
                                                                    ? '#fff'
                                                                    : '#0340D1'
                                                                : 'none'
                                                        }
                                                        stroke={
                                                            item?.is_bookmarked
                                                                ? isDarkMode
                                                                    ? '#fff'
                                                                    : '#0340D1'
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
                                                            ? 'Remove Bookmark'
                                                            : 'Bookmark'}
                                                    </span>
                                                </button>
                                            )}


                                            <button
                                                onClick={() => {
                                                    const url =
                                                        route('home') +
                                                        generateURL(item);

                                                    navigator.clipboard.writeText(
                                                        url.trim(),
                                                    );
                                                    setLinkCopied(true);
                                                    setActionDropdownOpen(null);
                                                }}
                                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
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
                                                <span>Copy Link</span>
                                            </button>

                                            <button
                                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setAutoplay(!videoAutoplay);


                                                }}
                                            >
                                                {videoAutoplay ? (
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
                                                            d="M15.75 5.25v13.5m-7.5-13.5v13.5"
                                                        />
                                                    </svg>
                                                ) : (
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
                                                            d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                                                        />
                                                    </svg>
                                                )}
                                                {videoAutoplay
                                                    ? 'Off Auto Play '
                                                    : 'On Auto Play '}
                                            </button>
                                        </>
                                    )}

                                    {item.type === 'smartphones' && (
                                        <button
                                            onClick={() => {
                                                const url =
                                                    route('home') +
                                                    '?m-slug=' +
                                                    item.slug;
                                                navigator.clipboard.writeText(
                                                    url.trim(),
                                                );
                                                setLinkCopied(true);
                                                setActionDropdownOpen(null);
                                            }}
                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
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
                                            <span>Copy Link</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {!isLoaded && <RenderFeedItemContentSkeleton />}

                <div style={{
                    display: isLoaded ? 'flex' : 'none',
                    flexDirection: 'column',
                    flex: 1,
                    minHeight: 0,
                    overflow: 'hidden'
                }}>

                    {/* Image + Videos - Takes remaining space */}
                    <div className="relative w-full overflow-hidden"
                        style={{ height: feedItemHeight - headerHeight, lineHeight: 0, display: 'block', }}>
                        {item.type === 'smartphones' && (
                            <>
                                {item?.images?.length > 0 && (
                                    <img
                                        key={item.id}
                                        src={item.images[0] || placeholderImage}
                                        alt={item.name}
                                        className="object-cover object-center w-full h-full rounded-none will-change-transform"
                                        loading={shouldEagerLoad ? "eager" : "lazy"}
                                        fetchpriority={shouldEagerLoad ? "high" : "low"}
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
                                        loading={shouldEagerLoad ? "eager" : "lazy"}
                                        fetchpriority={shouldEagerLoad ? "high" : "low"}
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
                                        className="object-cover object-center w-full h-full"
                                        OnLoadedMetaData={() => {
                                            if (item.slug) setLoadedItems(prev => new Set(prev).add(item.slug));
                                        }}
                                        Preload={shouldEagerLoad ? "metadata" : "none"}
                                        timelinePadding={!isVisible ? 35 : 70}
                                    />


                                ) : (
                                    item.post_image_urls.length === 0 &&
                                    item.post_video_urls.length === 0 && (
                                        <div className="px-4 pt-3 pb-2 overflow-y-auto text-gray-700 mt-14"
                                            style={{
                                                contain: 'layout style paint',
                                            }}
                                        >
                                            <div
                                                className="line-clamp-[18] text-sm leading-relaxed text-gray-700 dark:text-white/80"
                                                style={{

                                                    minHeight: '200px',
                                                }}
                                                dangerouslySetInnerHTML={{
                                                    __html: item.content,
                                                }}
                                            />
                                        </div>
                                    )
                                )}
                            </>
                        )}
                    </div>

                </div>

                {/* Bottom */}
                {item.type === 'smartphones' && (
                    <div className={`absolute left-0 right-0 z-20 px-4 pt-6 text-white ${isVisible ? 'bottom-28' : 'bottom-14'}`}>
                        <div className="flex items-center justify-between gap-3 truncate">
                            <p className="flex-1 text-sm leading-relaxed break-words text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                                {item?.content && item.content.length > 30 ? (
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                item.content.substring(0, 30) +
                                                '...',
                                        }}
                                    />
                                ) : (
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: item?.content,
                                        }}
                                    />
                                )}
                            </p>

                            <button
                                onClick={() => {
                                    setManualFeedGalleryItem(item);
                                    setMobileFeedGalleryOpening(true);

                                    setTimeout(() => {
                                        setMobileFeedGalleryOpen(true);
                                        setMobileFeedGalleryOpening(false);
                                    }, 500);
                                }}
                                className="h-[30px] w-[120px] shrink-0 rounded-lg px-6 text-xs font-bold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]  transition-colors flex gap-2 items-center justify-center  "
                            >

                                {mobileFeedGalleryOpening ? <Spinner customSize={"size-3"} /> : 'Shop Now'}
                            </button>
                        </div>
                    </div>
                )}

                {item.type === 'posts' && (
                    <div className={`absolute left-0 right-0 z-20 px-4 pt-6 text-white ${isVisible ? 'bottom-28' : 'bottom-14'}`}>
                        <div className={`flex items-center justify-between gap-3 truncate `}>
                            {/* CHECKING IF MEDIA IS EMPTY THAN ITS TEXT ONLY POST SO THIS WONT SHOW BECAUSE WE ALREADY SHOWED In CONTENT */}
                            {item?.post_image_urls?.length === 0 &&
                                item?.post_video_urls?.length === 0 ? (
                                <p></p>
                            ) : (
                                <p className="flex-1 text-sm leading-relaxed text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] ">
                                    {item?.content && item.content.length > 30 ? (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    item.content.substring(0, 30) +
                                                    '...',
                                            }}
                                        />
                                    ) : (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: item?.content,
                                            }}
                                        />
                                    )}
                                </p>
                            )}

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
                                        className="h-[30px] w-[90px] shrink-0 rounded-lg  px-6 text-xs font-bold text-gray-700 transition-colors flex gap-2 items-center justify-center dark:text-white/80 "
                                    >
                                        {mobileFeedGalleryOpening ? <Spinner customSize={"size-3"} /> : 'More'}
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
                                    className="h-[30px] w-[90px] shrink-0 rounded-lg  px-6 text-xs font-bold text-white transition-colors flex gap-2 items-center justify-center drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] "
                                >
                                    {mobileFeedGalleryOpening ? <Spinner customSize={"size-3"} /> : 'More'}
                                </button>
                            )}


                        </div>
                    </div>
                )}


            </div>
        );
    }, [videoAutoplay, mobileFeedGalleryOpening, actionDropdownOpen, isDarkMode, loadedItems, localFeed, isVisible]);


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

    // DROPDOWN Auto Closing LOGIC
    useEffect(() => {
        if (!scrollContainerRef.current) return;

        const container = scrollContainerRef.current;

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
            if (
                actionDropdownRef.current &&
                actionDropdownRef.current.contains(event.target)
            ) {
                return; // Ignore clicks inside dropdown
            }


            // Close dropdown for any other clicks
            setActionDropdownOpen(null);
        };

        container.addEventListener("mousedown", handleClick);
        return () => container.removeEventListener("mousedown", handleClick);
    }, [actionDropdownOpen]);

    // Scroll to the currently selected feed item on mount or index change In Y Axis
    useEffect(() => {

        if (isYSuspendedRef.current) return;

        if (!feedGallery || feedIndex < 0) return;
        const container = scrollContainerRef.current;
        if (!container) return;

        const alignToIndex = () => {
            if (!container || hasInitializedScroll.current) return;


            const itemHeight = container.firstElementChild?.offsetHeight || window.innerHeight;
            const targetScroll = (feedIndex + 1) * itemHeight;

            container.style.scrollBehavior = "instant";

            container.scrollTop = targetScroll;
            hasInitializedScroll.current = true;
            setIsScrollCompleted(true);

            requestAnimationFrame(() => {
                container.style.scrollBehavior = "smooth";
            });
        };



        requestAnimationFrame(() => {
            setTimeout(alignToIndex, 0);

        });
    }, []);

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
                    row.style.scrollBehavior = "auto";

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
                        row.style.scrollBehavior = "smooth";

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

            row.style.scrollBehavior = "auto";
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


        const scrollTick = () => {

            if (isLoopingRef.current) return;

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
            ) return;

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

                    requestAnimationFrame(() => {
                        container.style.scrollBehavior = "auto";

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
                            index: 0
                        };


                        setTimeout(() => {
                            container.style.scrollBehavior = "smooth";
                            setTimeout(() => {
                                setIsScrollCompleted(true);
                            }, 500);


                            requestAnimationFrame(() => {
                                const currentPos = container.scrollTop;
                                const snapTarget = Math.round(currentPos / itemHeight) * itemHeight;
                                if (Math.abs(currentPos - snapTarget) > 1) {
                                    container.scrollTop = snapTarget;
                                }
                                isLoopingRef.current = false;
                            });
                        }, 100);
                    });

                    return;
                }

                // TOP TO BOTTOM
                if (currentIndex === DUMMY_TOP_INDEX && !isLoopingRef.current) {
                    setIsScrollCompleted(false);

                    isLoopingRef.current = true;

                    requestAnimationFrame(() => {
                        container.style.scrollBehavior = "auto";


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
                            index: lastFeedIndex
                        };


                        setTimeout(() => {
                            container.style.scrollBehavior = "smooth";
                            setTimeout(() => {
                                setIsScrollCompleted(true);
                            }, 500);


                            requestAnimationFrame(() => {
                                const currentPos = container.scrollTop;
                                const snapTarget = Math.round(currentPos / itemHeight) * itemHeight;
                                if (Math.abs(currentPos - snapTarget) > 1) {
                                    container.scrollTop = snapTarget;
                                }
                                isLoopingRef.current = false;
                            });
                        }, 100);
                    });

                    return;
                }

            }
            // LOOPING LOGIC

            // Update scrollPos
            lastScrollTop = currentScrollTop;

            // Debounce to detect actual feed change
            if (scrollTimeout) clearTimeout(scrollTimeout);

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
                    index: feedIndexReal
                };


                const rowXAxisData = lastHorizontalUpdateRef.current[feedIndexReal];
                let itemToUse = newFeedItem; // Default to parent

                if (rowXAxisData && rowXAxisData.id) {
                    // This row has X-axis scroll history
                    const relatedItems = getRelatedItems(newFeedItem);
                    const xAxisItem = relatedItems.find(item => item.id === rowXAxisData.id);

                    if (xAxisItem && !xAxisItem.__dummy) {
                        itemToUse = xAxisItem; // Using X-axis scrolled item
                    }
                }



                // URL updates
                if (itemToUse.type === 'smartphones') {
                    const url = new URL(window.location.origin + window.location.pathname);
                    url.searchParams.set('m-slug', itemToUse.slug);
                    window.history.replaceState({}, '', url.toString());
                } else if (itemToUse.type === 'posts') {
                    const fullUrl = route('home') + generateURL(itemToUse);
                    window.history.replaceState({}, '', fullUrl);
                }

                // Find global index
                const globalIndex = feedRef.current.findIndex(
                    item => item.id === newFeedItem.id
                );


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

                if (remaining <= 5 && nextPageUrl !== null && !isfetchingMoreYAxisFeed) {
                    fetchMoreYAxis();
                }

                isProcessingRef.current = false;

            }, 100);

        };


        // Add to GSAP ticker
        gsap.ticker.add(scrollTick);

        return () => {
            gsap.ticker.remove(scrollTick);
            clearTimeout(lockTimeoutRef.current);
            if (scrollTimeout) clearTimeout(scrollTimeout);
        };
    }, []);

    // X-Axis scroll tracking with GSAP ticker
    useEffect(() => {
        if (!horizontalRefs.current || horizontalRefs.current.length === 0) return;

        const tickers = [];

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
                ) return;

                const children = rowContainer.children;
                if (!children || children.length < 2) return;

                const firstReal = children[1];

                if (firstReal) {
                    itemWidth = itemWidthRef.current[rowIndex]
                        || (itemWidthRef.current[rowIndex] = rowContainer.offsetWidth);
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

                // ALL feeds now have dummies, so loop logic applies to all
                const rawIndex = currentScrollLeft / itemWidth;
                const currentIndex =
                    Math.abs(rawIndex - Math.round(rawIndex)) < 0.08
                        ? Math.round(rawIndex)
                        : Math.floor(rawIndex + 0.0001);

                const FIRST_REAL = 1;
                const LAST_REAL = totalItems;

                const SL = currentScrollLeft;

                // For single-item feeds (relatedOnlyCount === 0), loop immediately
                const leftLimit = relatedOnlyCount === 0 ? itemWidth * 0.5 : itemWidth * 0.3;
                const rightLimit = relatedOnlyCount === 0 ? itemWidth * 1.5 : itemWidth * (totalItems + 0.7);

                const now = Date.now();
                if (now - lastLoopTime < 300) return;

                // RIGHT LOOP (same for all feeds now)
                if (SL >= rightLimit) {
                    lastLoopTime = now;
                    isXLoopingRef.current = true;
                    setIsXAxisLooping(true);

                    requestAnimationFrame(() => {
                        rowContainer.style.scrollBehavior = "auto";
                        rowContainer.style.scrollSnapType = "none";
                        rowContainer.parentElement.style.scrollSnapType = "none";
                        rowContainer.style.pointerEvents = "none";

                        const target = itemWidth;
                        rowContainer.scrollLeft = target;
                        lastScrollLeft = target;

                        preserveXAxisScrollRef.current[rowIndex] = target;

                        const firstItem = relatedItems[0];
                        lastHorizontalUpdateRef.current[rowIndex] = { id: firstItem.id, index: 0 };

                        // Update URL
                        if (firstItem.type === "smartphones") {
                            const url = new URL(window.location.origin + window.location.pathname);
                            url.searchParams.set("m-slug", firstItem.slug);
                            window.history.replaceState({}, "", url.toString());
                        } else {
                            const fullUrl = route("home") + generateURL(firstItem);
                            window.history.replaceState({}, "", fullUrl);
                        }

                        setFeedGallery(firstItem);

                        setTimeout(() => {
                            rowContainer.style.scrollSnapType = "";
                            rowContainer.parentElement.style.scrollSnapType = "";
                            rowContainer.style.scrollBehavior = "smooth";
                            rowContainer.style.pointerEvents = "";
                        }, 50);

                        isXLoopingRef.current = false;
                        setTimeout(() => {
                            setIsXAxisLooping(false)
                        }, 1000);
                    });

                    return;
                }

                // LEFT LOOP (same for all feeds now)
                if (SL <= leftLimit) {
                    lastLoopTime = now;
                    isXLoopingRef.current = true;
                    setIsXAxisLooping(true);

                    requestAnimationFrame(() => {
                        rowContainer.style.scrollBehavior = "auto";
                        rowContainer.style.scrollSnapType = "none";
                        rowContainer.parentElement.style.scrollSnapType = "none";
                        rowContainer.style.pointerEvents = "none";

                        const target = itemWidth * totalItems;
                        rowContainer.scrollLeft = target;
                        lastScrollLeft = target;

                        preserveXAxisScrollRef.current[rowIndex] = target;

                        const lastItem = relatedItems[relatedItems.length - 1];
                        lastHorizontalUpdateRef.current[rowIndex] = {
                            id: lastItem.id,
                            index: relatedItems.length - 1
                        };

                        // Update URL
                        if (lastItem.type === "smartphones") {
                            const url = new URL(window.location.origin + window.location.pathname);
                            url.searchParams.set("m-slug", lastItem.slug);
                            window.history.replaceState({}, "", url.toString());
                        } else {
                            const fullUrl = route("home") + generateURL(lastItem);
                            window.history.replaceState({}, "", fullUrl);
                        }

                        setFeedGallery(lastItem);

                        setTimeout(() => {
                            rowContainer.style.scrollSnapType = "";
                            rowContainer.parentElement.style.scrollSnapType = "";
                            rowContainer.style.scrollBehavior = "smooth";
                            rowContainer.style.pointerEvents = "";
                        }, 50);

                        isXLoopingRef.current = false;

                        setTimeout(() => {
                            setIsXAxisLooping(false)
                        }, 1000);
                    });

                    return;
                }

                // Rest of ticker logic stays the same...
                lastScrollLeft = currentScrollLeft;

                if (scrollTimeout) clearTimeout(scrollTimeout);

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


                    if (newItem.type === "smartphones") {
                        const url = new URL(window.location.origin + window.location.pathname);
                        url.searchParams.set("m-slug", newItem.slug);
                        window.history.replaceState({}, "", url.toString());
                    } else if (newItem.type === "posts") {
                        const fullUrl = route("home") + generateURL(newItem);
                        window.history.replaceState({}, "", fullUrl);
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
                        const existsButNull = nextUrls.hasOwnProperty(slug) && nextUrls[slug] === null;
                        const existsAndNotNull = nextUrls.hasOwnProperty(slug) && nextUrls[slug] !== null;


                        if (relatedFeedItems.length > 4) {
                            if (doesNotExist || existsAndNotNull) {
                                fetchRelatedFeed(slug);
                            }
                        }
                    }

                    isProcessingRef.current = false;

                }, 100);
            };

            gsap.ticker.add(scrollTick);
            tickers.push(scrollTick);
        });

        return () => {
            tickers.forEach(t => gsap.ticker.remove(t));
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


    return (
        <>
            {createPortal(
                <div className="fixed inset-0 z-50 text-gray-700 bg-white scrollbar-none dark:bg-deepcharcoal dark:text-white/80">
                    {(!isScrollCompleted || isXAxisLooping) && (
                        <RenderFeedItemSkeleton index={0} />
                    )}
                    <div className='scrollbar-none'
                        ref={scrollContainerRef}
                        style={{
                            height: '100%',
                            overflowY: 'scroll',
                            scrollSnapType: 'y mandatory',
                            overscrollBehavior: 'contain',
                            WebkitOverflowScrolling: 'touch',
                            willChange: 'transform',
                            transform: 'translate3d(0, 0, 0)',
                            overflowX: 'hidden',
                            margin: 0,
                            padding: 0,
                            display: 'block',
                        }}
                    >

                        {/* DUMMY Y Axis TOP CLONE */}
                        {localFeed.length > 1 && (
                            <div
                                className="min-w-full feed-page snap-start"
                                style={{
                                    opacity: 0,
                                    pointerEvents: 'none',
                                    userSelect: 'none',
                                }}
                                aria-hidden="true"
                            />
                        )}

                        {localFeed.map((item, index) => {
                            const relatedItems = wrapWithHorizontalDummies(getRelatedItems(item));
                            return (
                                <div
                                    key={`feed-${item.id}`}
                                    className="min-w-full feed-page snap-start"
                                    style={{
                                        height: feedItemHeight,
                                        contentVisibility: "auto",
                                        contain: 'layout',
                                        willChange: 'scroll-position',
                                    }}
                                >
                                    <div
                                        className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-none"

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

                                                el.style.scrollBehavior = "auto";
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
                                            width: "100%",
                                            height: feedItemHeight,
                                            maxWidth: "100%",
                                            overflowY: "hidden",
                                            touchAction: "pan-y pan-x",
                                            WebkitOverflowScrolling: "touch",
                                            display: "flex",
                                            flexDirection: 'row',
                                            willChange: 'transform',
                                            transform: 'translate3d(0, 0, 0)',
                                            contain: 'layout style paint',
                                        }}
                                    >


                                        {relatedItems.map((relatedItem, relatedIndex) =>
                                            renderFeedItem(
                                                relatedItem,
                                                relatedIndex > 0,
                                                `${item.id}-rel-${relatedIndex}`,

                                            )
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* DUMMY Y Axis BOTTOM CLONE */}
                        {localFeed.length > 1 && (
                            <div
                                className="min-w-full feed-page snap-start"
                                style={{
                                    opacity: 0,
                                    pointerEvents: 'none',
                                    userSelect: 'none',
                                }}
                                aria-hidden="true"
                            />
                        )}

                    </div>

                    {/*  TOGGLE BUTTON - Only visible in MobileFeed */}
                    {/* <BottomBarToggle /> */}
                </div >,
                document.getElementById('modal-root') || document.body,
            )}

            {
                MobileFeedGalleryOpen && (
                    <MobileFeedGallery
                        feedGallery={manualFeedGalleryItem?.slug === feedGallery?.slug ? feedGallery : manualFeedGalleryItem}
                        setShowQrCode={setShowQrCode}
                        setLinkCopied={setLinkCopied}
                        auth={auth}
                        currency={currency}
                        cart_items={cart_items}
                        navigateToHashtag={navigateToHashtag}
                        placeholderImage={placeholderImage}
                        generateURL={generateURL}

                    />
                )
            }
        </>
    );
};

export default memo(MobileFeed);
