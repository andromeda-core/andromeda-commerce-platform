import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PostMediaViewer from './PostMediaViewer';
import { router } from '@inertiajs/react';
import GlobalSearch from '@/Components/GlobalSearch';
import useWindowSize from '@/Hooks/useWindowSize';
import useDarkMode from '@/Hooks/useDarkMode';

const PostDesktopModal = ({
    post,
    setShowQrCode,
    setShowErrorMessage,
    setLinkCopied,
    setBookmarkStatusChanged,
    setErrorMessage,
    setMediaItems,
    auth,
    generateURL,
    navigateToHashtag,
    Placeholder,
    setFeedGallery,
    setFeedOpen,
}) => {
    const isDarkMode = useDarkMode();
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
    const [showPostDesktopActionsDropdown, setShowPostDesktopActionsDropdown] = useState(false);
    const windowSize = useWindowSize();
    const mediaThumbRefs = useRef([]);

    // Checking Outside Click Of Elipsis Dropdown
    useEffect(() => {
        const handleResize = () => {
            setShowPostDesktopActionsDropdown(false);
        };
        const handleClickOutside = (e) => {
            const clickedDesktopPostActionsButton = e.target.closest('[data-post-actions-button]');
            const clickedDesktopPostActionsDropdown = e.target.closest(
                '[data-post-actions-dropdown]',
            );

            if (clickedDesktopPostActionsButton) {
                setShowPostDesktopActionsDropdown((prev) => !prev);
                return;
            }

            if (clickedDesktopPostActionsDropdown) {
                return;
            }

            setShowPostDesktopActionsDropdown(false);
        };
        window.addEventListener('resize', handleResize);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return createPortal(
        <>
            <div className="fixed inset-0 left-0 z-50 bg-white overscroll-contain dark:bg-zinc-950 lg:left-20">
                <div className="w-[50%] px-10 m-auto mb-3">
                    <GlobalSearch
                        additional_filters={false}
                    />
                </div>

                <button
                    onClick={() => {
                        setFeedGallery(null);
                        setFeedOpen(false);
                        window.history.replaceState({}, '', window.location.pathname);
                    }}
                    className="absolute z-50 p-2 text-gray-600 transition-colors rounded-full top-4 right-4 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                    aria-label="Close modal"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
                <div className="relative h-[calc(100vh-60px)] overflow-y-auto pb-24 scrollbar-none">
                    <div className="flex flex-col min-h-full lg:flex-row">
                        {post && (
                            <>
                                {((Array.isArray(post?.post_video_urls) &&
                                    post.post_video_urls.length > 0) ||
                                    (Array.isArray(post?.post_image_urls) &&
                                        post.post_image_urls.length > 0)) && (
                                        <div className="w-full flex-shrink-0 p-2 lg:w-[45%] lg:p-4">
                                            <div className="transition-all duration-500 ease-in-out transform translate-y-3">
                                                <PostMediaViewer
                                                    viewablePost={post}
                                                    setMediaItems={setMediaItems}
                                                    mediaThumbRefs={mediaThumbRefs}
                                                    selectedMediaIndex={selectedMediaIndex}
                                                    onSelectMediaIndex={setSelectedMediaIndex}
                                                    Placeholder={Placeholder}
                                                />
                                            </div>
                                        </div>
                                    )}

                                <div
                                    className={`w-full bg-transparent ${(Array.isArray(post?.post_video_urls) &&
                                        post.post_video_urls.length > 0) ||
                                        (Array.isArray(post?.post_image_urls) &&
                                            post.post_image_urls.length > 0)
                                        ? 'lg:w-1/2'
                                        : "w-full mx-auto space-y-4 max-w-[40rem] md:max-w-[60rem] lg:max-w-[70rem] xl:max-w-[100rem] px-4 md:px-10 lg:px-16 xl:px-24 "
                                        }`}
                                >
                                    {((!post?.post_video_urls?.length &&
                                        !post?.post_image_urls?.length) ||
                                        windowSize.width > 1024) && (
                                            <div className="w-full p-4 mx-auto space-y-4 md:px-10 lg:pl-6 lg:pr-10">

                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-md text-[#0090FF]">
                                                        <div>
                                                            {post?.tag && (
                                                                <button
                                                                    onClick={() => {
                                                                        navigateToHashtag(post?.tag);
                                                                    }}
                                                                >
                                                                    {post?.tag}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </span>

                                                    <div className="relative">
                                                        <button data-post-actions-button>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={1.5}
                                                                stroke="currentColor"
                                                                className="size-5 hover:text-black/80 dark:text-white/80 dark:hover:text-white sm:size-4 md:size-5 lg:size-8"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                                                                />
                                                            </svg>
                                                        </button>
                                                        {showPostDesktopActionsDropdown && (
                                                            <div
                                                                data-post-actions-dropdown
                                                                className="absolute right-0 z-50 w-48 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg top-full dark:border-gray-700 dark:bg-deepcharcoal"
                                                            >
                                                                <div className="py-1">
                                                                    <button
                                                                        onClick={() => {
                                                                            setShowQrCode(true);
                                                                            setShowPostDesktopActionsDropdown(
                                                                                false,
                                                                            );
                                                                        }}
                                                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
                                                                    >
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
                                                                                        post_id:
                                                                                            post?.id,
                                                                                    },
                                                                                    {
                                                                                        preserveScroll: true,
                                                                                        preserveUrl: true,
                                                                                        onSuccess:
                                                                                            () => {
                                                                                                post.is_bookmarked =
                                                                                                    !post.is_bookmarked;
                                                                                                setShowPostDesktopActionsDropdown(
                                                                                                    false,
                                                                                                );
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
                                                                                    post?.is_bookmarked
                                                                                        ? isDarkMode
                                                                                            ? '#fff'
                                                                                            : '#0340D1'
                                                                                        : 'none'
                                                                                }
                                                                                stroke={
                                                                                    post?.is_bookmarked
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
                                                                                {post?.is_bookmarked
                                                                                    ? 'Remove Bookmark'
                                                                                    : 'Bookmark'}
                                                                            </span>
                                                                        </button>
                                                                    )}

                                                                    <button
                                                                        onClick={(e) => {
                                                                            const url =
                                                                                route('home') +
                                                                                generateURL(post);
                                                                            navigator.clipboard.writeText(
                                                                                url.trim(),
                                                                            );
                                                                            setLinkCopied(true);
                                                                            setShowPostDesktopActionsDropdown(
                                                                                false,
                                                                            );
                                                                        }}
                                                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
                                                                    >
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

                                                <div
                                                    className="prose max-h-none min-h-[400px] max-w-[90vw] break-words text-[12px] text-gray-800 dark:prose-invert dark:text-white/80 sm:text-[14px] md:text-[15px] lg:max-w-none lg:text-[18px]"
                                                    dangerouslySetInnerHTML={{
                                                        __html: post?.content,
                                                    }}
                                                />

                                                <div className="flex flex-wrap gap-2 my-2 text-sm text-gray-700 dark:text-white/80">
                                                    <span className="flex items-center gap-2 rounded-full">
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

                                                <div className="h-32"></div>
                                            </div>
                                        )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>,
        document.getElementById('modal-root') || document.body,
    );
};

export default PostDesktopModal;
