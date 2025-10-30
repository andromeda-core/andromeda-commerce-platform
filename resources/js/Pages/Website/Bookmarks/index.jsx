import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, router } from '@inertiajs/react';
import QRCode from 'react-qr-code';
import { toast } from 'react-toastify';
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import LinkCopiedModal from '@/Components/LinkCopiedModal';
import useWindowSize from '@/Hooks/useWindowSize';
import Toast from '@/Components/Toast';
import getCookie from '@/Hooks/useGetCookie';

export default function index() {
    const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
    const [nextPageUrl, setNextPageUrl] = useState(null);

    const [showQrCode, setShowQrCode] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const loaderRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const [ErrorMessage, setErrorMessage] = useState(null);
    const [showErrorMessage, setShowErrorMessage] = useState(false);

    const windowSize = useWindowSize();

    const generateURL = (post) => {
        return (
            `?slug=${encodeURIComponent(post?.slug)}&planet=earth${post?.latitude != null ? '&lat=' + encodeURIComponent(post?.latitude) : ''}` +
            `${post?.longitude != null ? '&lng=' + encodeURIComponent(post?.longitude) : ''}` +
            `${post?.location_name != null ? '&location_name=' + encodeURIComponent(post?.location_name) : ''}` +
            `&timestamp=${encodeURIComponent(post?.created_at)}` +
            `${post?.floor_id != null ? '&floor=' + encodeURIComponent(post?.floor?.name) : ''}`
        );
    };

    const isFetchingRef = useRef(false);

    const fetchBookmarkedPosts = async () => {
        try {
            const cookieValue = getCookie('post_preferences');
            let parsed = null;

            if (cookieValue && cookieValue !== 'null' && cookieValue !== 'undefined') {
                try {
                    parsed = JSON.parse(decodeURIComponent(cookieValue));
                } catch (error) {
                    console.warn('⚠️ Invalid post_preferences cookie. Using defaults.', error);
                    parsed = null;
                }
            }

            const defaultPreferences = {
                text: true,
                videos: true,
                images: true,
                show_posts: true,
                show_products: true,
            };

            const finalPreferences =
                parsed && typeof parsed === 'object'
                    ? { ...defaultPreferences, ...parsed }
                    : defaultPreferences;

            const res = await axios.get(route('website.bookmarks.get-bookmarked-posts'), {
                params: finalPreferences,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
            });

            setBookmarkedPosts(res.data.posts);
            setNextPageUrl(res.data.next_page_url);
        } catch (error) {
            setErrorMessage(error.message);
            setShowErrorMessage(true);
        } finally {
            setIsLoaded(true);
        }
    };

    useEffect(() => {
        fetchBookmarkedPosts();
    }, []);

    const fetchMoreBookmarkedPosts = async () => {
        if (isFetchingRef.current) return;
        try {
            isFetchingRef.current = true;
            const res = await axios.get(nextPageUrl, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
            });

            setBookmarkedPosts((prev) => {
                const newPosts = res.data.posts;

                const uniqueNewPosts = newPosts.filter(
                    (newPost) => !prev.some((existingPost) => existingPost.id === newPost.id),
                );

                return [...prev, ...uniqueNewPosts];
            });
            setNextPageUrl(res.data.next_page_url);
        } catch (error) {
            console.error('Error fetching more posts:', error);
        } finally {
            isFetchingRef.current = false;
        }
    };

    // Infinite Scroll Observer
    useEffect(() => {
        if (!loaderRef.current || !nextPageUrl) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isFetchingRef.current) {
                    fetchMoreBookmarkedPosts();
                }
            },
            { threshold: 1 },
        );

        observer.observe(loaderRef.current);

        return () => {
            if (loaderRef.current) observer.unobserve(loaderRef.current);
        };
    }, [nextPageUrl]);

    const handleOpenPost = (post) => {
        const url = generateURL(post);
        router.visit(route('home') + url, {
            replace: false,
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                if (windowSize.width > 1024) {
                    window.history.pushState({ modal: 'post-viewer' }, '');
                } else {
                    window.history.pushState(
                        {
                            modal: 'post-gallery',
                        },
                        '',
                    );
                }
            },
        });
    };

    return (
        <MainLayout>
            <Head title="Bookmarks" />

            {showErrorMessage && <Toast flash={{ error: ErrorMessage }} />}

            {!isLoaded && (
                <div className="flex items-center justify-center gap-2 py-10 text-center text-gray-700 transition-all duration-100 animate-pulse dark:text-white/80">
                    <div className="flex items-center justify-center">
                        <div role="status">
                            <svg
                                aria-hidden="true"
                                className="w-5 h-5 text-gray-200 animate-spin fill-indigo-600 dark:text-white/80"
                                viewBox="0 0 100 101"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="currentColor"
                                />
                                <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="currentFill"
                                />
                            </svg>
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                    Please Wait While We Load Bookmarked Posts...
                </div>
            )}

            {/* Masonry Layout */}
            {isLoaded && (
                <div className="pb-20 sm:pb-20">
                    <div className="mx-auto max-w-8xl sm:px-6 lg:px-8">
                        {/* Compact Masonry */}
                        <div className="columns-1 gap-1 [column-fill:_balance] min-[300px]:columns-2 lg:columns-4">
                            {bookmarkedPosts.map((post, index) => {
                                return (
                                    <article
                                        key={post?.id}
                                        className="relative mb-1 overflow-hidden transition-all duration-300 rounded-none shadow-md cursor-pointer group break-inside-avoid hover:-translate-y-1 hover:shadow-xl"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                        onClick={() => handleOpenPost(post)}
                                    >
                                        {post?.images ? (
                                            <div className="relative">
                                                <img
                                                    src={post?.images[0]?.url}
                                                    alt={post?.title}
                                                    loading="lazy"
                                                    className="w-full object-cover text-[10px] text-gray-700 transition-all duration-500 group-hover:scale-105 dark:text-white/80 dark:opacity-80"
                                                />

                                                {/* Title */}
                                                <div className="absolute left-3 top-3">
                                                    <h2 className="line-clamp-2 text-[8px] font-semibold text-white drop-shadow-lg sm:text-[9px] md:text-[10px] lg:text-lg">
                                                        {post?.title.length > 20
                                                            ? post?.title.slice(0, 20) + '...'
                                                            : post?.title}
                                                    </h2>
                                                </div>

                                                {/* Share Button */}
                                                <button
                                                    className="absolute text-white right-3 top-3 opacity-80 drop-shadow-lg hover:opacity-100"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const url =
                                                            route('home') + generateURL(post);
                                                        navigator.clipboard.writeText(url.trim());

                                                        setLinkCopied(true);
                                                    }}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="size-3 lg:size-5"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                                                        />
                                                    </svg>
                                                </button>

                                                {/* Title + Meta */}
                                                <div className="absolute inset-x-0 bottom-0 p-4">
                                                    <div className="mt-1 flex items-center justify-between text-[6px] font-bold text-gray-200 drop-shadow-sm sm:text-[7px] md:text-[8px] lg:text-xs">
                                                        <span className="text-white drop-shadow-md">
                                                            {post?.tag}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-white drop-shadow-md lg:gap-2">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={1.5}
                                                                stroke="currentColor"
                                                                className="size-2 md:size-3 lg:size-4"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                                />
                                                            </svg>
                                                            {post?.added_at}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Text-only */
                                            <div className="relative flex flex-col justify-between p-5 text-white bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 dark:from-gray-500 dark:via-gray-600 dark:to-gray-800">
                                                {/* Share Button */}
                                                <button
                                                    className="absolute text-white right-3 top-3 opacity-80 hover:opacity-100"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const url =
                                                            route('home') + generateURL(post);
                                                        navigator.clipboard.writeText(url.trim());

                                                        setLinkCopied(true);
                                                    }}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="size-3 lg:size-5"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                                                        />
                                                    </svg>
                                                </button>

                                                <div>
                                                    <h2 className="mb-2 line-clamp-2 text-[10px] font-semibold text-white drop-shadow-lg sm:text-[9px] md:text-[10px] lg:text-lg">
                                                        {post?.title}
                                                    </h2>
                                                    <p className="line-clamp-4 text-[10px] opacity-90 lg:text-sm">
                                                        {post.content.length > 200 ? (
                                                            <span
                                                                dangerouslySetInnerHTML={{
                                                                    __html:
                                                                        post?.content.substring(
                                                                            0,
                                                                            200,
                                                                        ) + '...',
                                                                }}
                                                            ></span>
                                                        ) : (
                                                            <span
                                                                dangerouslySetInnerHTML={{
                                                                    __html: post?.content,
                                                                }}
                                                            ></span>
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="mt-2 flex items-center justify-between text-[7px] font-bold text-gray-200 drop-shadow-sm sm:text-[7px] md:text-[8px] lg:text-xs">
                                                    <span className="text-white drop-shadow-md">
                                                        {post?.tag}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-white drop-shadow-md lg:gap-2">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="size-2 md:size-3 lg:size-4"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                            />
                                                        </svg>
                                                        {post?.added_at}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </article>
                                );
                            })}
                        </div>

                        {bookmarkedPosts?.length === 0 && (
                            <div className="flex items-center justify-center px-6 py-8 bg-white border border-gray-200 shadow-sm rounded-xl dark:border-gray-700 dark:bg-deepcharcoal">
                                <div className="flex flex-col items-center gap-3">
                                    {/* Icon */}
                                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full dark:bg-gray-700">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-6 h-6 text-gray-500 dark:text-gray-400"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                                            />
                                        </svg>
                                    </div>

                                    {/* Text */}
                                    <div className="text-center">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            No Bookmarks Found
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            Start bookmarking your favorite Posts to see them here
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Loader */}
                        {bookmarkedPosts?.length > 0 && (
                            <>
                                {nextPageUrl && (
                                    <div
                                        ref={loaderRef}
                                        className="flex items-center justify-center gap-2 py-10 text-center text-gray-700 transition-all duration-100 animate-pulse dark:text-white/80"
                                    >
                                        <div className="flex items-center justify-center">
                                            <div role="status">
                                                <svg
                                                    aria-hidden="true"
                                                    className="w-5 h-5 text-gray-200 animate-spin fill-blue-600 dark:text-gray-600"
                                                    viewBox="0 0 100 101"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                        fill="currentColor"
                                                    />
                                                    <path
                                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                        fill="currentFill"
                                                    />
                                                </svg>
                                                <span className="sr-only">Loading...</span>
                                            </div>
                                        </div>
                                        Loading more...
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* QR CODE */}
            {showQrCode &&
                createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center">
                        {/* Overlay */}
                        <div
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setShowQrCode(false)}
                        ></div>

                        {/* Modal */}
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="qrCodeTitle"
                            className={`relative z-[101] w-full max-w-sm rounded-2xl bg-white/50 p-6 text-gray-900 shadow-xl sm:max-w-md`}
                        >
                            <div className="flex justify-end">
                                <button onClick={() => setShowQrCode(false)}>✕</button>
                            </div>
                            <div className="text-center">
                                <h2 id="qrCodeTitle" className="mb-3 text-base font-semibold">
                                    Scan QR Code
                                </h2>
                                <div className="flex justify-center">
                                    <QRCode
                                        className="size-48 sm:size-52 md:size-60"
                                        value={route('home') + generateURL(viewablePost)}
                                        viewBox="0 0 256 256"
                                        level="H"
                                        includeMargin
                                        bgColor="#ffffff"
                                        fgColor="#000000"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}

            {linkCopied && (
                <LinkCopiedModal linkCopied={linkCopied} setLinkCopied={setLinkCopied} />
            )}
        </MainLayout>
    );
}
