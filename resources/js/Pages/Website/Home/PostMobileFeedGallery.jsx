import VideoWithThumbnail from '@/Components/VideoWithThumbnail';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';



const PostMobileFeedGallery = ({ post, setShowQrCode, setLinkCopied, navigateToHashtag, placeholderImage, generateURL }) => {



    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [actionDropdownOpen, setActionDropdownOpen] = useState(null);
    const actionDropdownRef = useRef(null);
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

    // Handle image scroll for pagination dots
    const handleScroll = (e) => {
        const container = e.target;
        const scrollLeft = container.scrollLeft;
        const itemWidth = container.offsetWidth;
        const newIndex = Math.round(scrollLeft / itemWidth);


        if (newIndex !== currentMediaIndex) {
            setCurrentMediaIndex(newIndex);


            handleStopNonVisibleVideos();
        }
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
            })) || [];

        return [...images, ...videos];
    }, [post]);



    // Calculate visible dots (max 5) with sliding window
    const getVisibleDots = () => {
        const totalMediaItems = mediaItems?.length || 0;
        if (totalMediaItems <= 5) {
            // Show all dots if 5 or fewer images
            return Array.from({ length: totalMediaItems }, (_, i) => i);
        }

        // Sliding window logic for more than 5 images
        const maxVisible = 5;
        let start = currentMediaIndex - 2;
        let end = currentMediaIndex + 2;

        // Adjust window at the beginning
        if (start < 0) {
            start = 0;
            end = maxVisible - 1;
        }

        // Adjust window at the end
        if (end >= totalMediaItems) {
            end = totalMediaItems - 1;
            start = totalMediaItems - maxVisible;
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };
    const visibleDots = getVisibleDots();



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
                <div className="fixed inset-0 z-[70] flex flex-col bg-white dark:bg-deepcharcoal overscroll-contain">
                    {/* Header - Keep intact as requested */}
                    <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
                        <button
                            onClick={() => navigateToHashtag(post.tag)}
                            className="text-sm font-semibold text-gray-700 dark:text-white/80"
                        >
                            {post.tag}
                        </button>
                        <div className="relative" ref={actionDropdownRef}>
                            <button
                                onClick={() => setActionDropdownOpen(!actionDropdownOpen)}
                                className="text-gray-700 dark:text-white/80"
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

                            {actionDropdownOpen && (
                                <div className="absolute right-0 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg top-8 dark:border-white/10 dark:bg-deepcharcoal">
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
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

                                        <button
                                            onClick={() => {
                                                const url =
                                                    route('home') + generateURL(post);
                                                navigator.clipboard.writeText(url.trim());
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
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 mx-auto overflow-y-auto scrollbar-none">
                        {mediaItems?.length > 0 && (
                            <div className="relative overflow-hidden">
                                {/* Horizontal Scroll Container - Swipeable */}
                                <div
                                    ref={scrollContainerRef}
                                    onScroll={handleScroll}
                                    className="flex overflow-x-auto snap-x snap-mandatory"
                                    style={{
                                        scrollbarWidth: 'none',
                                        msOverflowStyle: 'none',
                                        WebkitOverflowScrolling: 'touch',
                                        scrollSnapType: 'x mandatory',
                                        height: 'calc(100vh - 60px)'
                                    }}
                                >
                                    {mediaItems?.length > 0 && (
                                        <div className="flex flex-col ">
                                            {/* Horizontal Scroll Container - Swipeable */}
                                            <div
                                                ref={scrollContainerRef}
                                                onScroll={handleScroll}
                                                className="flex overflow-x-auto snap-x snap-mandatory"
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
                                                        className="flex items-center justify-center w-full h-full overflow-y-hidden shrink-0 snap-center snap-always"
                                                    >
                                                        {item.type === 'image' ? (
                                                            <img
                                                                src={item.url}
                                                                alt={`Media ${index}`}
                                                                className="will-change-transform "
                                                                loading={"eager"}
                                                                fetchpriority={"high"}
                                                                decoding="async"
                                                                onError={(e) => (e.target.src = placeholderImage)}
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center w-full h-full">
                                                                <VideoWithThumbnail
                                                                    type='instagram'
                                                                    className="object-cover"
                                                                    videoUrl={item.url}
                                                                    Preload='auto'
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>


                                        </div>
                                    )}
                                </div>

                                {/* Fixed Pagination Dots - Outside scroll container, stays in place */}
                                <div className="pointer-events-none absolute bottom-20 left-0 right-0 z-10 flex items-center justify-center gap-1.5">
                                    {visibleDots.map((dotIndex) => (
                                        <div
                                            key={dotIndex}
                                            className={`rounded-full shadow-lg transition-all duration-300 ${dotIndex === currentMediaIndex
                                                ? 'h-2 w-2 bg-black shadow-black/60 dark:bg-white'
                                                : 'h-1.5 w-1.5 bg-black/50 shadow-black/30 dark:bg-white/50'
                                                }`}
                                            style={{
                                                transitionProperty: 'all',
                                                transitionTimingFunction:
                                                    'cubic-bezier(0.4, 0, 0.2, 1)',
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Full Content - Scrollable, No Truncation */}
                        <div className="px-4">
                            <div className="mb-4">
                                {post?.content && (
                                    <div
                                        className="text-sm leading-relaxed prose text-gray-700 break-words dark:text-white/80"
                                        dangerouslySetInnerHTML={{
                                            __html: post.content,
                                        }}
                                    />
                                )}
                            </div>


                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-2 my-2 text-sm text-gray-700 dark:text-white/80">
                                    <span className="flex items-center gap-2 p-1 ">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="size-5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                            />
                                        </svg>
                                        <span>
                                            {post?.user?.name.length > 15
                                                ? post?.user?.name.substring(0, 15) +
                                                '...'
                                                : post?.user?.name || 'Unknown User'}
                                        </span>
                                    </span>
                                </div>


                            </div>
                        </div>
                    </div>


                </div>,
                document.getElementById('modal-root') || document.body,
            )}


        </>
    );
};

export default PostMobileFeedGallery;
