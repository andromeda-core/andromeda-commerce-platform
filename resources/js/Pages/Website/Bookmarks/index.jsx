import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, Link, router } from '@inertiajs/react';
import QRCode from 'react-qr-code';
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import LinkCopiedModal from '@/Components/LinkCopiedModal';
import Toast from '@/Components/Toast';
import getCookie from '@/Hooks/useGetCookie';
import Placeholder from 'asset/assets/images/product/placeholder.jpg';

export default function index() {
    const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
    const [nextPageUrl, setNextPageUrl] = useState(null);

    const [showQrCode, setShowQrCode] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const loaderRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const [ErrorMessage, setErrorMessage] = useState(null);
    const [showErrorMessage, setShowErrorMessage] = useState(false);


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
        window.history.replaceState(
            {},
            '',
            route('home'),
        )
        router.visit(route('home') + url, {
            replace: false,
            preserveState: true,
            preserveScroll: true,

        });
    };

    return (
        <MainLayout>
            <Head title="Bookmarks" />

            {showErrorMessage && (
                <Toast
                    flash={{ error: ErrorMessage }}
                    onClosed={(type) => {
                        if (type === 'error') {
                            setErrorMessage(null);
                            setShowErrorMessage(false);
                        }
                    }}
                />
            )}

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
                            {bookmarkedPosts.map((item, index) => {
                                return (
                                    <article
                                        key={item?.id}
                                        className="relative mb-1 overflow-hidden transition-all duration-300 rounded-none shadow-md cursor-pointer no-touch-hover group break-inside-avoid hover:-translate-y-1 hover:shadow-xl lg:mb-2"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                        onClick={() => {
                                            handleOpenPost(item);
                                        }}
                                    >
                                        {item?.images ? (
                                            <div className="relative">
                                                <img
                                                    src={item?.images[0]?.url}
                                                    alt={item?.title}
                                                    loading="lazy"
                                                    onError={(e) =>
                                                        (e.target.src = Placeholder)
                                                    }
                                                    className="w-full object-cover text-[10px] text-gray-700 transition-all duration-500 group-hover:scale-105 dark:text-white/80 dark:opacity-80"
                                                />

                                                {/* Title */}
                                                <div className="absolute left-3 top-3">
                                                    <span className="text-[8px] text-white drop-shadow-md sm:text-[9px] md:text-[10px] lg:text-[17px]">
                                                        {item?.tag}
                                                    </span>
                                                </div>

                                                {/* Title + Meta */}
                                                <div className="absolute inset-x-0 bottom-0 p-4">
                                                    <div className="mt-1 flex items-center justify-between text-[8px] font-bold text-gray-200 drop-shadow-sm sm:text-[9px] md:text-[10px] lg:text-[17px]">
                                                        <span className="text-white drop-shadow-md">
                                                            {item?.title.length > 25
                                                                ? item?.title.slice(
                                                                    0,
                                                                    25,
                                                                ) + '...'
                                                                : item?.title}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : !item?.images && item?.videos ? (
                                            <>
                                                <div className="relative">
                                                    <img
                                                        src={item?.videos[0]?.thumbnail_url || Placeholder}
                                                        alt={item?.title}
                                                        loading="lazy"
                                                        onError={(e) =>
                                                            (e.target.src = Placeholder)
                                                        }
                                                        className="w-full object-cover text-[10px] text-gray-700 transition-all duration-500 group-hover:scale-105 dark:text-white/80 dark:opacity-80"
                                                    />
                                                    {/* Title */}
                                                    <div className="absolute left-3 top-3">
                                                        <span className="text-[8px] text-white drop-shadow-md sm:text-[9px] md:text-[10px] lg:text-[17px]">
                                                            {item?.tag}
                                                        </span>
                                                    </div>

                                                    {/* Title + Meta */}
                                                    <div className="absolute inset-x-0 bottom-0 p-4">
                                                        <div className="mt-1 flex items-center justify-between text-[8px] font-bold text-gray-200 drop-shadow-sm sm:text-[9px] md:text-[10px] lg:text-[17px]">
                                                            <span className="text-white drop-shadow-md">
                                                                {item?.title.length > 25
                                                                    ? item?.title.slice(
                                                                        0,
                                                                        25,
                                                                    ) + '...'
                                                                    : item?.title}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                {/* /* Text-only */}
                                                <div className="relative flex flex-col justify-between bg-[#F2F2F2] p-5 text-gray-700 dark:bg-[#485260] dark:text-white/80">
                                                    <div className="flex items-center justify-between">
                                                        <span className="mb-3 text-[8px] drop-shadow-md sm:text-[9px] md:text-[10px] lg:text-[17px]">
                                                            {item?.tag}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <p className="line-clamp-5 text-[8px] opacity-90 sm:text-[9px] md:text-[10px] lg:text-[17px]">
                                                            {item.content.length >
                                                                400 ? (
                                                                <span
                                                                    dangerouslySetInnerHTML={{
                                                                        __html:
                                                                            item?.content.substring(
                                                                                0,
                                                                                400,
                                                                            ) + '...',
                                                                    }}
                                                                ></span>
                                                            ) : (
                                                                <span
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: item?.content,
                                                                    }}
                                                                ></span>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="mt-1 flex items-center justify-between text-[8px] font-medium drop-shadow-sm sm:text-[9px] md:text-[10px] lg:text-[17px]">
                                                        <span>
                                                            {item?.title.length > 20
                                                                ? item?.title.slice(
                                                                    0,
                                                                    20,
                                                                ) + '...'
                                                                : item?.title}
                                                        </span>
                                                    </div>
                                                </div>
                                            </>
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
                                        <p className="mt-1 mb-5 text-sm text-gray-500 dark:text-gray-400">
                                            Start bookmarking your favorite Posts to see them here
                                        </p>

                                        <Link
                                            href={route('home')}
                                            className="px-4 py-3 font-medium text-white transition-all bg-indigo-600 shadow-md rounded-xl hover:bg-indigo-500 hover:shadow-lg"
                                        >
                                            Let's Go
                                        </Link>
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
