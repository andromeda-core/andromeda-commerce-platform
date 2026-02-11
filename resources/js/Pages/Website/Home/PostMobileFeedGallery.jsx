import InstagramStyledVideoPlayer from '@/Components/InstagramStyledVideoPlayer';
import { router } from '@inertiajs/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import SpatiotemporalInfoModal from '@/Components/SpatiotemporalInfoModal';

const PostMobileFeedGallery = (
    { post, setShowQrCode, setLinkCopied, navigateToHashtag, placeholderImage, generateURL, __, auth, setBookmarkStatusChanged, isDarkMode, setMobileFeedGalleryOpen,
        setSpatiotemporalInfoModal,
        spatiotemporalInfoModal,
    }) => {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [actionDropdownOpen, setActionDropdownOpen] = useState(null);
    const actionDropdownRef = useRef(null);
    const thumbnailContainerRef = useRef(null);
    const scrollContainerRef = useRef(null);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (actionDropdownRef.current && !actionDropdownRef.current.contains(event.target)) {
                setActionDropdownOpen(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle Media scroll Post Media
    const handleScroll = (e) => {
        const container = e.target;
        const scrollLeft = container.scrollLeft;
        const itemWidth = container.offsetWidth;
        const newIndex = Math.round(scrollLeft / itemWidth);


        if (newIndex !== currentMediaIndex) {
            setCurrentMediaIndex(newIndex);
            handleStopNonVisibleVideos();


            const activeThumb = thumbnailContainerRef.current?.children[newIndex];
            activeThumb?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    };


    const handleThumbnailClick = (index) => {
        setCurrentMediaIndex(index);
        const targetMainItem = scrollContainerRef.current?.children[index];
        targetMainItem?.scrollIntoView({
            behavior: 'instant',
            block: 'nearest',
            inline: 'start'
        });
    };


    // Pause Non Visible Videos When Swipes
    const handleStopNonVisibleVideos = () => {
        const container = scrollContainerRef.current;
        if (!container) return;


        const allVideos = container.querySelectorAll('video');

        allVideos.forEach((video) => {
            const videoContainer = video.closest('.snap-center');

            if (videoContainer) {

                const rect = videoContainer.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();


                const isVisible = (
                    rect.left >= containerRect.left - 10 &&
                    rect.right <= containerRect.right + 10
                );


                if (!isVisible) {
                    video.pause();
                }
            }
        });
    };


    const mediaItems = useMemo(() => {
        const images =
            post?.images?.map((img) => ({
                type: 'image',
                url: img.url,
            })) || [];

        const videos =
            post?.videos?.map((vid) => ({
                type: 'video',
                url: vid.url,
                thumbnail_url: vid?.thumbnail_url
            })) || [];

        return [...images, ...videos];
    }, [post]);



    // LOCKING BODY WHEN MOUNT TO PREVENT SCROLLS BENEATH MODAL
    useEffect(() => {

        document.body.style.overflow = "hidden";
        document.body.style.touchAction = "none";

        return () => {
            // Restore scroll when modal closes
            document.body.style.overflow = "";
            document.body.style.touchAction = "";
        };
    }, []);



    return (
        <>
            {createPortal(
                <div className="fixed inset-0 z-[70] flex flex-col bg-backgroundLight dark:bg-backgroundDark overscroll-contain">
                    <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">


                        <button
                            onClick={() => {
                                setMobileFeedGalleryOpen(false);
                            }}
                            className="text-[18px] font-semibold"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6 text-main-text-light dark:text-main-text-dark">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                            </svg>

                        </button>

                        <button
                            onClick={() => navigateToHashtag(post.tag)}
                            className="text-[18px] font-semibold text-main-text-light dark:text-main-text-dark"

                        >
                            {post.tag}
                        </button>




                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 px-8 overflow-y-auto scrollbar-none">
                        {mediaItems?.length > 0 && (
                            <div className="relative">
                                {/* Horizontal Scroll Container - Swipeable */}
                                <div
                                    ref={scrollContainerRef}
                                    onScroll={handleScroll}
                                    className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
                                    style={{
                                        scrollbarWidth: 'none',
                                        msOverflowStyle: 'none',
                                        WebkitOverflowScrolling: 'touch',
                                        scrollSnapType: 'x mandatory',
                                        height: 'calc(100vh - 180px)'
                                    }}
                                >
                                    {mediaItems.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-center w-full h-full shrink-0 snap-center snap-always"
                                        >
                                            {item.type === 'image' ? (
                                                <img
                                                    src={item.url || placeholderImage}
                                                    alt={`Media ${index}`}
                                                    className="object-cover w-full h-full max-w-full max-h-full rounded-md"
                                                    loading="eager"
                                                    fetchpriority="high"
                                                    decoding="async"
                                                    onError={(e) => (e.target.src = placeholderImage)}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full">

                                                    <InstagramStyledVideoPlayer
                                                        thumbnail={item?.thumbnail_url || placeholderImage}
                                                        className="object-cover w-full h-full"
                                                        videoUrl={item.url}
                                                        Preload='metadata'
                                                        slug={item?.slug}
                                                        timelinePadding={2}

                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>




                            </div>
                        )}


                        {/* Thumbnail Refs */}
                        <div className="flex items-center justify-start gap-0 pt-4">
                            {/* Thumbnails */}
                            {((Array.isArray(
                                post?.post_video_urls,
                            ) &&
                                post.post_video_urls.length > 1) ||
                                (Array.isArray(
                                    post?.post_image_urls,
                                ) &&
                                    post.post_image_urls.length >
                                    1)) && (
                                    <div
                                        ref={thumbnailContainerRef}
                                        className="flex items-center gap-3 overflow-x-auto scrollbar-none"
                                        style={{ scrollBehavior: 'smooth' }}
                                    >
                                        {/* Render thumbnails */}
                                        {mediaItems.map(
                                            (mediaItem, index) => {

                                                return (
                                                    <button
                                                        key={index}

                                                        onClick={() => handleThumbnailClick(index)}
                                                        className={`aspect-square ${currentMediaIndex === index ? 'border-[3px] border-main-text-light dark:border-main-text-dark' : ''} w-[clamp(70px,5vw,70px)] flex-shrink-0 overflow-hidden rounded-md  transition-all`}
                                                    >
                                                        {mediaItem?.type ===
                                                            'image' ? (
                                                            <img
                                                                src={
                                                                    mediaItem?.url ||
                                                                    placeholderImage
                                                                }
                                                                alt={`Thumbnail ${index + 1}`}
                                                                className="object-cover w-full h-full"
                                                                loading={
                                                                    currentMediaIndex ===
                                                                        index
                                                                        ? 'eager'
                                                                        : 'lazy'
                                                                }
                                                                decoding="async"
                                                                fetchpriority={
                                                                    currentMediaIndex ===
                                                                        index
                                                                        ? 'high'
                                                                        : 'low'
                                                                }
                                                                onError={(
                                                                    e,
                                                                ) =>
                                                                (e.target.src =
                                                                    placeholderImage)
                                                                }
                                                            />
                                                        ) : (
                                                            <img
                                                                src={
                                                                    mediaItem?.thumbnail_url ||
                                                                    placeholderImage
                                                                }
                                                                alt={`Thumbnail ${index + 1}`}
                                                                className="object-cover w-full h-full"
                                                                loading={
                                                                    currentMediaIndex ===
                                                                        index
                                                                        ? 'eager'
                                                                        : 'lazy'
                                                                }
                                                                decoding="async"
                                                                fetchpriority={
                                                                    currentMediaIndex ===
                                                                        index
                                                                        ? 'high'
                                                                        : 'low'
                                                                }
                                                                onError={(
                                                                    e,
                                                                ) =>
                                                                (e.target.src =
                                                                    placeholderImage)
                                                                }
                                                            />
                                                        )}
                                                    </button>
                                                );
                                            },
                                        )}
                                    </div>
                                )}


                        </div>


                        {/* Full Content - Scrollable, No Truncation */}
                        <div className="mt-2 mb-10">
                            {mediaItems.length > 0 && (


                                <div className="flex items-center justify-end mb-4">
                                    <div className="relative" ref={actionDropdownRef}>


                                        <button
                                            className="text-main-text-light dark:text-main-text-dark"
                                            onClick={() => setActionDropdownOpen(!actionDropdownOpen)}
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

                                        {actionDropdownOpen && (
                                            <div className="absolute right-0 z-50 w-56 border rounded-md border-surface-3-light bg-backgroundLight dark:border-surface-3-dark top-full dark:bg-surface-1-dark">
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => {
                                                            setShowQrCode(true);
                                                            setActionDropdownOpen(null);
                                                        }}
                                                        className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light dark:text-main-text-dark"
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

                                                    {auth?.user && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                router.put(
                                                                    route(
                                                                        'website.posts.bookmark',
                                                                        post?.id,
                                                                    ),

                                                                    {
                                                                        post_id: post?.id,
                                                                    },
                                                                    {
                                                                        preserveScroll: true,
                                                                        preserveUrl: true,
                                                                        onSuccess: () => {
                                                                            post.is_bookmarked =
                                                                                !post.is_bookmarked;

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
                                                            className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light dark:text-main-text-dark "
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill={
                                                                    post?.is_bookmarked
                                                                        ? isDarkMode
                                                                            ? '#fff'
                                                                            : '#222'
                                                                        : 'none'
                                                                }
                                                                stroke={
                                                                    post?.is_bookmarked
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
                                                                {post?.is_bookmarked
                                                                    ? __('Remove Bookmarker')
                                                                    : __('Bookmarker')}
                                                            </span>
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => {
                                                            const url =
                                                                route('home') + generateURL(post, true, true);
                                                            navigator.clipboard.writeText(url.trim());
                                                            setLinkCopied(true);
                                                            setActionDropdownOpen(null);
                                                        }}
                                                        className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light dark:text-main-text-dark"
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



                                                    {/* Spatiotemporal Information */}
                                                    {(post?.latitude != null && post?.longitude != null) && (
                                                        <button
                                                            onClick={(e) => {
                                                                setSpatiotemporalInfoModal(true);
                                                                setActionDropdownOpen(null);
                                                            }}
                                                            className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light dark:text-main-text-dark"
                                                        >


                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                                            </svg>


                                                            <span className="font-normal">
                                                                {__('Spatiotemporal Info')}
                                                            </span>
                                                        </button>
                                                    )}

                                                    <span

                                                        className="flex items-center w-full gap-3 px-4 py-3 text-xs transition-colors rounded-md text-main-text-light dark:text-main-text-dark"
                                                    >

                                                        <span>{__('Post Created')}:
                                                            <p>
                                                                {post?.added_at} {post?.created_at_time}
                                                            </p>
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            )}

                            <div className="mb-4">
                                {post?.content && (
                                    <div
                                        className="text-[16px] font-medium  leading-[22px] prose break-words text-main-text-light dark:text-main-text-dark"

                                        dangerouslySetInnerHTML={{
                                            __html: post?.content,
                                        }}
                                    />
                                )}
                            </div>


                            <div
                                className=" z-[90] flex items-center justify-start my-4"
                            >

                                <div className="transition-all duration-200 rounded-full bg-[#efefef] text-[#595959] dark:text-main-text-dark dark:bg-surface-2-dark dark:hover:bg-surface-3-dark">
                                    <div className="flex items-center gap-2 p-2">

                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 text-[#595959] dark:text-main-text-dark">
                                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                                        </svg>

                                        <span className='text-[13px] font-medium truncate line-clamp-1'>
                                            {post?.user?.name}
                                        </span>
                                    </div>

                                </div>


                            </div>


                            {mediaItems.length === 0 && (


                                <div className="flex items-center justify-end mb-4">
                                    <div className="relative" ref={actionDropdownRef}>


                                        <button
                                            className="text-main-text-light dark:text-main-text-dark"
                                            onClick={() => setActionDropdownOpen(!actionDropdownOpen)}
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

                                        {actionDropdownOpen && (
                                            <div className="absolute right-0 z-50 w-56 border rounded-md border-surface-3-light bg-backgroundLight dark:border-surface-3-dark top-full dark:bg-surface-1-dark">
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => {
                                                            setShowQrCode(true);
                                                            setActionDropdownOpen(null);
                                                        }}
                                                        className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light dark:text-main-text-dark"
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

                                                    {auth?.user && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                router.put(
                                                                    route(
                                                                        'website.posts.bookmark',
                                                                        post?.id,
                                                                    ),

                                                                    {
                                                                        post_id: post?.id,
                                                                    },
                                                                    {
                                                                        preserveScroll: true,
                                                                        preserveUrl: true,
                                                                        onSuccess: () => {
                                                                            post.is_bookmarked =
                                                                                !post.is_bookmarked;

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
                                                            className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light dark:text-main-text-dark "
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill={
                                                                    post?.is_bookmarked
                                                                        ? isDarkMode
                                                                            ? '#fff'
                                                                            : '#222'
                                                                        : 'none'
                                                                }
                                                                stroke={
                                                                    post?.is_bookmarked
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
                                                                {post?.is_bookmarked
                                                                    ? __('Remove Bookmarker')
                                                                    : __('Bookmarker')}
                                                            </span>
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => {
                                                            const url =
                                                                route('home') + generateURL(post, true, true);
                                                            navigator.clipboard.writeText(url.trim());
                                                            setLinkCopied(true);
                                                            setActionDropdownOpen(null);
                                                        }}
                                                        className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light dark:text-main-text-dark"
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



                                                    {/* Spatiotemporal Information */}
                                                    {(post?.latitude != null && post?.longitude != null) && (
                                                        <button
                                                            onClick={(e) => {
                                                                setSpatiotemporalInfoModal(true);
                                                                setActionDropdownOpen(null);
                                                            }}
                                                            className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light dark:text-main-text-dark"
                                                        >


                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                                            </svg>


                                                            <span className="font-normal">
                                                                {__('Spatiotemporal Info')}
                                                            </span>
                                                        </button>
                                                    )}

                                                    <span

                                                        className="flex items-center w-full gap-3 px-4 py-3 text-xs transition-colors rounded-md text-main-text-light dark:text-main-text-dark"
                                                    >

                                                        <span>{__('Post Created')}:
                                                            <p>
                                                                {post?.added_at} {post?.created_at_time}
                                                            </p>
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            )}

                        </div>
                    </div>


                </div>,
                document.getElementById('modal-root') || document.body,
            )}

            {
                spatiotemporalInfoModal && (
                    <SpatiotemporalInfoModal
                        onClose={() => {
                            setSpatiotemporalInfoModal(false);
                        }}
                        post={post}
                    />
                )
            }

        </>
    );
};

export default PostMobileFeedGallery;
