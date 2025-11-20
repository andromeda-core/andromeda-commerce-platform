import VideoWithThumbnail from '@/Components/VideoWithThumbnail';
import getCookie from '@/Hooks/useGetCookie';
import { router } from '@inertiajs/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import gsap from 'gsap';
import MobileFeedGallery from './MobileFeedGallery';
import useDarkMode from '@/Hooks/useDarkMode';
import Spinner from '@/Components/Spinner';
import { useFilterStore } from '@/Hooks/useFilterStore';
import { useHomeNavStore } from '@/Hooks/useHomeNavStore';


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
    const [videoAutoplay, setVideoAutoplay] = useState(false);

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

    const videoRefs = useRef({});

    // Pause all videos except the one in the current viewport
    const pauseAllVideosExceptCurrent = (currentIndex) => {
        const container = scrollContainerRef.current;
        if (!container) return;

        // Get all feed items
        const feedItems = container.querySelectorAll('.snap-start');

        feedItems.forEach((feedItem, index) => {
            const videos = feedItem.querySelectorAll('video');

            videos.forEach((video) => {
                // Pause videos that are not in the current feed item
                if (index !== currentIndex) {
                    video.pause();
                }
            });
        });
    };


    // Parent Function To Pause Video
    const pauseVideoAtSlug = (slug) => {

        const videoRef = videoRefs.current[slug];

        if (videoRef?.current) {
            videoRef.current.pause();
            return;
        }
        // console.warn(`⚠️ Ref not found, trying DOM query for: ${slug}`);
        // const container = scrollContainerRef.current;
        // if (container) {
        //     const videos = container.querySelectorAll('video');
        //     videos.forEach(video => {
        //         const videoContainer = video.closest('.feed-page');
        //         if (videoContainer) {
        //             if (!video.paused) {
        //                 video.pause();
        //             }
        //         }
        //     });
        // }
    };

    // const pauseAllVideos = () => {
    //     Object.keys(videoRefs.current).forEach(index => {
    //         pauseVideoAtIndex(parseInt(index));
    //     });
    // };

    // Function to pause current video (for gallery open)
    const pauseCurrentVideo = (slug) => {

        pauseVideoAtSlug(slug);
    };



    // Function Add Video Refs From render Feed
    const handleVideoRef = useCallback((itemKey) => {
        return (videoElement) => {


            if (!videoRefs.current[itemKey]) {
                videoRefs.current[itemKey] = { current: null };
            }
            videoRefs.current[itemKey].current = videoElement;


        };
    }, []);


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
                className="relative flex flex-col h-screen min-w-full snap-start"
                style={{
                    height: '100%',
                    scrollSnapAlign: 'start',
                    scrollSnapStop: 'always',
                }}
            >
                {/* Header: Tag + Three Dots Skeleton */}
                <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
                    {/* Tag skeleton */}
                    <div className="w-20 h-5 bg-gray-200 rounded animate-pulse dark:bg-zinc-700" />

                    {/* Three dots skeleton */}
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse dark:bg-zinc-700" />
                </div>

                {/* Image/Video Area Skeleton - Takes remaining space */}
                <div className="relative flex-1 overflow-hidden">
                    <div className="flex items-center justify-center w-full h-full p-4">
                        <div className="w-full h-full max-w-full max-h-full bg-gray-200 rounded-lg animate-pulse dark:bg-zinc-700" />
                    </div>
                </div>

                {/* Bottom Section Skeleton */}
                <div
                    className="px-4 pt-3 bg-white shrink-0 dark:bg-deepcharcoal"
                    style={{
                        paddingBottom: '5rem',
                    }}
                >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        {/* Content text skeleton */}
                        <div className="flex-1 space-y-2">
                            <div className="w-full h-4 bg-gray-200 rounded animate-pulse dark:bg-zinc-700" />
                            <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse dark:bg-zinc-700" />
                        </div>

                        {/* Button skeleton */}
                        <div className="h-[30px] w-[130px] shrink-0 rounded-lg bg-gray-200 animate-pulse dark:bg-zinc-700" />
                    </div>
                </div>
            </div>
        );
    };

    // Helper Function to Render Feed CONTENT Skeleton before Showing Actual ITEM
    const RenderFeedItemContentSkeleton = () => {
        return (
            <div className="flex flex-col h-full">

                {/* Content/Image Skeleton - Takes remaining space */}
                <div className="relative flex-1 min-h-0 overflow-hidden">
                    <div className="flex items-center justify-center w-full h-full p-4">
                        <div className="w-full h-full max-w-full max-h-full bg-gray-200 rounded-lg animate-pulse dark:bg-zinc-700" />
                    </div>
                </div>


            </div>
        );
    };



    // Helper Function To Render Dummy items WithActual Related Feed To Perform Looping

    const wrapWithHorizontalDummies = useMemo(() => {
        return (items) => {
            if (!items || items.length === 0 || !parentFeedSlugRef.current) return items;

            const slug = parentFeedSlugRef.current;
            const relatedCount = getRelatedCount(slug);

            // No related items, return as-is
            if (relatedCount < 1) return items;

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

        const relatedCount = getRelatedCount(parentFeedSlugRef.current);

        if (relatedCount < 1 && item?.__dummy) {
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



        const isLoaded = isTextPost || loadedItems.has(item?.slug);

        const isCurrent = item?.slug === manualFeedGalleryItem?.slug;

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
                    height: '100%',
                    scrollSnapAlign: 'start',
                    scrollSnapStop: 'always',
                    contain: 'layout style paint',
                    willChange: 'transform',
                }}
            >

                {/* Header: Tag + Three Dots */}
                <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
                    <button
                        onClick={() => navigateToHashtag(item.tag)}
                        className="text-sm font-semibold"
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
                                strokeWidth={1.5}
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
                                className="absolute right-0 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg top-8 dark:border-white/10 dark:bg-deepcharcoal">
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
                                                    setVideoAutoplay(
                                                        (prev) => !prev,
                                                    );
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
                    <div className="flex-1 min-h-0 overflow-hidden">
                        {item.type === 'smartphones' && (
                            <>
                                {item?.images?.length > 0 && (
                                    <div className="flex items-center justify-center w-full h-full p-4">
                                        <img
                                            key={item.id}
                                            src={item.images[0]}
                                            alt={item.name}
                                            className="max-w-full max-h-full rounded-lg will-change-transform"
                                            loading={isCurrent ? "eager" : "lazy"}
                                            fetchpriority={isCurrent ? "high" : "low"}
                                            decoding="async"
                                            onLoad={handleOnLoad}
                                            onError={(e) => {
                                                handleOnLoad();
                                                if (e.target.src !== placeholderImage) {
                                                    e.target.src = placeholderImage;
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        {item.type === 'posts' && (
                            <>
                                {item?.post_image_urls?.length > 0 ? (
                                    <div className="flex items-center justify-center w-full h-full p-4">
                                        <img
                                            key={item.id}
                                            src={item.post_image_urls[0]}
                                            alt={item.title}
                                            className="object-contain max-w-full max-h-full rounded-lg"
                                            loading={isCurrent ? "eager" : "lazy"}
                                            fetchpriority={isCurrent ? "high" : "low"}
                                            decoding="async"
                                            onLoad={handleOnLoad}
                                            onError={(e) => {
                                                handleOnLoad();
                                                if (e.target.src !== placeholderImage) {
                                                    e.target.src = placeholderImage;
                                                }
                                            }}
                                        />
                                    </div>
                                ) : item.post_video_urls.length > 0 ? (
                                    <div className="flex items-center justify-center w-full h-full p-4">
                                        <VideoWithThumbnail
                                            type='customized'
                                            videoUrl={item.post_video_urls[0]}
                                            className={
                                                'max-h-full w-full object-contain'
                                            }
                                            autoPlay={videoAutoplay}
                                            controls={true}
                                            OnLoadedMetaData={() => {
                                                if (item?.slug) {
                                                    setLoadedItems(prev => new Set(prev).add(item.slug));
                                                }
                                            }}
                                            videoElementRef={handleVideoRef(item.slug)}
                                            Preload={isCurrent ? 'auto' : 'metadata'}
                                        />
                                    </div>
                                ) : (
                                    item.post_image_urls.length === 0 &&
                                    item.post_video_urls.length === 0 && (
                                        <div className="px-4 pt-3 pb-2 overflow-y-auto text-gray-700"
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
                    <div
                        className="px-4 pt-3 pb-20 bg-white dark:bg-deepcharcoal shrink-0"

                    >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="flex-1 text-sm leading-relaxed text-gray-700 dark:text-white/80">
                                {item?.content && item.content.length > 35 ? (
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                item.content.substring(0, 35) +
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
                                className="h-[30px] w-[120px] shrink-0 rounded-lg px-6 text-xs font-bold text-gray-700 transition-colors flex gap-2 items-center justify-center dark:text-white/80 "
                            >

                                {mobileFeedGalleryOpening ? <Spinner customSize={"size-3"} /> : 'Shop Now'}
                            </button>
                        </div>
                    </div>
                )}

                {item.type === 'posts' && (
                    <div
                        className="px-4 pt-3 pb-20 bg-white shrink-0 dark:bg-deepcharcoal"

                    >
                        <div className={`flex items-center justify-between gap-3 flex-wrap`}>
                            {/* CHECKING IF MEDIA IS EMPTY THAN ITS TEXT ONLY POST SO THIS WONT SHOW BECAUSE WE ALREADY SHOWED In CONTENT */}
                            {item?.post_image_urls?.length === 0 &&
                                item?.post_video_urls?.length === 0 ? (
                                <p></p>
                            ) : (
                                <p className="flex-1 text-sm leading-relaxed text-gray-700 dark:text-white/80">
                                    {item?.content && item.content.length > 35 ? (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    item.content.substring(0, 35) +
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
                                            pauseCurrentVideo(item?.slug);
                                            setMobileFeedGalleryOpen(true);
                                            setMobileFeedGalleryOpening(false);
                                        }, 500);
                                    }}
                                    className="h-[30px] w-[90px] shrink-0 rounded-lg  px-6 text-xs font-bold text-gray-700 transition-colors flex gap-2 items-center justify-center dark:text-white/80 "
                                >
                                    {mobileFeedGalleryOpening ? <Spinner customSize={"size-3"} /> : 'More'}
                                </button>
                            )}


                        </div>
                    </div>
                )}


            </div>
        );
    }, [videoAutoplay, mobileFeedGalleryOpening, actionDropdownOpen, isDarkMode, loadedItems]);


    // Tracking GLobal Filter Open Or Not
    const isFilterOpenRef = useRef(false);

    // subscribing to filter store
    useEffect(() => {
        return useFilterStore.subscribe((state) => {
            isFilterOpenRef.current = state.isOpen;
        });
    }, []);




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


    // VIDEO AUTO PLAY COOKIE  FETCHING
    useEffect(() => {
        const saved = getCookie('video_autoplay');
        if (saved !== null) setVideoAutoplay(saved === 'true');
    }, []);

    // VIDEO AUTO PLAY COOKIE STORING AND SETTING
    useEffect(() => {
        const expires = new Date(Date.now() + 365 * 864e5).toUTCString();
        document.cookie = `${'video_autoplay'}=${encodeURIComponent(videoAutoplay)}; expires=${expires}; path=/`;
        window.dispatchEvent(new Event('videoAutoplayChanged'));
    }, [videoAutoplay]);

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


    // Fallback X-axis alignment + looping flag management
    useEffect(() => {

        if (!isScrollCompleted) return;


        const currentItem = localFeed[feedIndex];
        if (!currentItem) return;

        const relatedCount = getRelatedCount(currentItem.slug);
        if (relatedCount < 1) {
            // No related items, but still enable looping for future items
            hasInitializedHorizontalRef.current = true;
            return;
        }

        // If already initialized, just ensure looping is enabled
        if (initializedXAxisRef.current.has(currentItem.id)) {
            hasInitializedHorizontalRef.current = true;
            return;
        }


        const row = horizontalRefs.current[feedIndex];
        if (!row) return;

        // Wait for children to be ready
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
            row.scrollLeft = width;
            initializedXAxisRef.current.add(currentItem.id);
            hasInitializedHorizontalRef.current = true;
        };

        checkAndAlign();

    }, [feedIndex, isScrollCompleted, localFeed]);




    // PAUSE Previous Videos WHEN FEEDINDEX CHANGES
    useEffect(() => {
        pauseAllVideosExceptCurrent(feedIndex);
    }, [feedIndex]);


    // Y-Axis scroll tracking with GSAP ticker
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        let itemHeight = window.innerHeight;
        let lastScrollTop = container.scrollTop;
        let scrollTimeout = null;
        let isFirstCheck = true;


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
                // Blocking ticker if:
                // 1. Feed opened directly from URL/refresh AND
                // 2. User hasn't scrolled Y-axis yet
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
                    if (!itemWidthRef.current[rowIndex]) {
                        itemWidthRef.current[rowIndex] = firstReal.getBoundingClientRect().width;
                    }
                    itemWidth = itemWidthRef.current[rowIndex];

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
                const relatedOnlyCount = totalItems - 1;

                if (relatedOnlyCount < 1) {
                    lastScrollLeft = currentScrollLeft;
                    return;
                }

                const currentIndex = Math.round(currentScrollLeft / itemWidth);

                const DUMMY_LEFT = 0;
                const FIRST_REAL = 1;
                const LAST_REAL = totalItems;
                const DUMMY_RIGHT = totalItems + 1;


                const now = Date.now();
                if (now - lastLoopTime < 300) return;


                // RIGHT LOOP
                if (currentIndex === DUMMY_RIGHT && !isXLoopingRef.current) {
                    lastLoopTime = now;
                    isXLoopingRef.current = true;
                    setIsXAxisLooping(true);

                    requestAnimationFrame(() => {
                        rowContainer.style.scrollBehavior = "auto";

                        const target = FIRST_REAL * itemWidth;
                        rowContainer.scrollLeft = target;
                        lastScrollLeft = target;

                        const firstItem = relatedItems[0];

                        lastHorizontalUpdateRef.current[rowIndex] = {
                            id: firstItem.id,
                            index: 0,
                        };


                        if (firstItem.type === "smartphones") {
                            const url = new URL(window.location.origin + window.location.pathname);
                            url.searchParams.set("m-slug", firstItem.slug);
                            window.history.replaceState({}, "", url.toString());
                        } else if (firstItem.type === "posts") {
                            const fullUrl = route("home") + generateURL(firstItem);
                            window.history.replaceState({}, "", fullUrl);
                        }

                        setFeedGallery(firstItem);


                        requestAnimationFrame(() => {
                            rowContainer.style.scrollBehavior = "smooth";


                            setTimeout(() => {
                                const snapTarget = Math.round(rowContainer.scrollLeft / itemWidth) * itemWidth;
                                if (Math.abs(rowContainer.scrollLeft - snapTarget) > 1) {
                                    rowContainer.scrollLeft = snapTarget;
                                }
                                isXLoopingRef.current = false;
                                setTimeout(() => {
                                    setIsXAxisLooping(false);
                                }, 300);
                            }, 150);
                        });
                    });

                    return;
                }

                // LEFT LOOP
                if (currentIndex === DUMMY_LEFT && !isXLoopingRef.current) {
                    lastLoopTime = now;
                    isXLoopingRef.current = true;
                    setIsXAxisLooping(true);

                    requestAnimationFrame(() => {
                        rowContainer.style.scrollBehavior = "auto";

                        const target = LAST_REAL * itemWidth;
                        rowContainer.scrollLeft = target;
                        lastScrollLeft = target;

                        const lastItem = relatedItems[relatedItems.length - 1];


                        const lastIndex = relatedItems.length - 1;
                        lastHorizontalUpdateRef.current[rowIndex] = {
                            id: lastItem.id,
                            index: lastIndex,
                        };


                        if (lastItem.type === "smartphones") {
                            const url = new URL(window.location.origin + window.location.pathname);
                            url.searchParams.set("m-slug", lastItem.slug);
                            window.history.replaceState({}, "", url.toString());
                        } else if (lastItem.type === "posts") {
                            const fullUrl = route("home") + generateURL(lastItem);
                            window.history.replaceState({}, "", fullUrl);
                        }

                        setFeedGallery(lastItem);


                        requestAnimationFrame(() => {
                            rowContainer.style.scrollBehavior = "smooth";


                            setTimeout(() => {
                                const snapTarget = Math.round(rowContainer.scrollLeft / itemWidth) * itemWidth;
                                if (Math.abs(rowContainer.scrollLeft - snapTarget) > 1) {
                                    rowContainer.scrollLeft = snapTarget;
                                }
                                isXLoopingRef.current = false;
                                setTimeout(() => {
                                    setIsXAxisLooping(false);
                                }, 300);
                            }, 150);
                        });
                    });

                    return;
                }


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

                                        contentVisibility: "auto",
                                        contain: 'layout',
                                        willChange: 'scroll-position',
                                    }}
                                >
                                    <div
                                        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory "
                                        ref={(el) => {
                                            horizontalRefs.current[index] = el;

                                            if (!el) return;

                                            const relatedCount = getRelatedCount(item.slug);

                                            // Skip if no related items or already initialized
                                            if (initializedXAxisRef.current.has(item.id)) return;

                                            if (relatedCount < 1) {
                                                hasInitializedHorizontalRef.current = true;
                                                return;
                                            }
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

export default MobileFeed;
