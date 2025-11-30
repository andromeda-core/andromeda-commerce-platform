import GlobalSearch from '@/Components/GlobalSearch';
import LinkCopiedModal from '@/Components/LinkCopiedModal';
import Toast from '@/Components/Toast';
import getCookie from '@/Hooks/useGetCookie';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import Placeholder from 'asset/assets/images/product/placeholder.jpg';
import React, { useEffect, useRef, useState } from 'react';


const hashtagPosts = ({ hashtag, google_map_api_key, search_history }) => {
    const [results, setResults] = useState([]);
    const [nextPageUrl, setNextPageUrl] = useState(null);

    const [allResults, setAllResults] = useState(results);

    const [linkCopied, setLinkCopied] = useState(false);

    const loaderRef = useRef(null);

    const generateURL = (post) => {
        return (
            `?slug=${encodeURIComponent(post?.slug)}&planet=earth${post?.latitude != null ? '&lat=' + encodeURIComponent(post?.latitude) : ''}` +
            `${post?.longitude != null ? '&lng=' + encodeURIComponent(post?.longitude) : ''}` +
            `${post?.location_name != null ? '&location_name=' + encodeURIComponent(post?.location_name) : ''}` +
            `&timestamp=${encodeURIComponent(post?.timestamp)}` +
            `${post?.floor != null ? '&floor=' + encodeURIComponent(post?.floor) : ''}`
        );
    };

    const [isLoaded, setIsLoaded] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [ErrorMessage, setErrorMessage] = useState('');
    const [showErrorMessage, setShowErrorMessage] = useState(false);

    const fetchResults = async () => {
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

        try {
            const res = await axios.post(route('website.posts.hashtag-results'), {
                post_preferences: finalPreferences,
                hashtag: decodeURIComponent(hashtag),
            });

            if (res.data.status) {
                setAllResults(res.data.backend_retuned_results);
                setNextPageUrl(res.data.backend_retuned_next_page_url);
                setIsLoaded(true);
            } else {
                setErrorMessage(res.data.message);
                setShowErrorMessage(true);
            }
        } catch (err) {
            setErrorMessage(err.message);
            setShowErrorMessage(true);
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchMoreResults = async () => {
        if (!nextPageUrl || isFetchingMore) return;
        setIsFetchingMore(true);
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

            const res = await axios.post(nextPageUrl, {
                post_preferences: finalPreferences,
                hashtag: decodeURIComponent(hashtag),

                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const { backend_retuned_results, backend_retuned_next_page_url } = res.data;

            setAllResults((prev) => {
                const existingKeys = new Set(prev.map((item) => `${item.type}-${item.id}`));

                const filteredNew = backend_retuned_results.filter(
                    (item) => !existingKeys.has(`${item.type}-${item.id}`),
                );

                return [...prev, ...filteredNew];
            });

            setNextPageUrl(backend_retuned_next_page_url);
        } catch (err) {
            setErrorMessage(err.message);
            setShowErrorMessage(true);
        } finally {
            setIsFetchingMore(false);
        }
    };

    // Infinite Scroll Observer
    useEffect(() => {
        const interval = setInterval(() => {
            if (loaderRef.current && nextPageUrl) {
                const observer = new IntersectionObserver(
                    (entries) => {
                        if (entries[0].isIntersecting && !isFetchingMore) {
                            fetchMoreResults();
                        }
                    },
                    { rootMargin: '200px', threshold: 0.1 },
                );
                observer.observe(loaderRef.current);

                clearInterval(interval);

                return () => {
                    observer.disconnect();
                };
            }
        }, 200);

        return () => clearInterval(interval);
    }, [nextPageUrl, isFetchingMore]);

    return (
        <MainLayout>
            <Head title="HashTag" />
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

            <GlobalSearch
                google_map_api_key={google_map_api_key}
                additional_filters={false}
                search_history={search_history}
            />

            <div className="pb-20 sm:px-6 sm:pb-20 lg:px-8">
                <div className="px-3 text-gray-900 bg-white border border-gray-200 rounded-xl dark:bg-deepcharcoal dark:text-gray-100 sm:px-6 lg:px-8 dark:border-gray-700">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                        <div className="relative flex items-center gap-6">
                            <button
                                className={`relative scale-105 pb-2 text-sm text-indigo-600 transition-all duration-300 ease-in-out dark:text-indigo-400`}
                            >
                                <div className="flex items-center">
                                    All
                                    <span
                                        className={`ml-1 text-xs text-indigo-600 dark:text-indigo-400`}
                                    >
                                        ({allResults.length})
                                    </span>
                                </div>
                                <span
                                    className={`absolute bottom-0 left-0 h-[2px] w-full scale-x-100 rounded-full bg-indigo-500 opacity-100 transition-all duration-300 ease-in-out`}
                                ></span>
                            </button>
                            <div
                                className="relative flex items-center justify-between px-2 py-2 mt-2 mb-3 text-sm text-indigo-600 transition-all rounded-lg border-gray-5 group dark:text-indigo-400"
                                title="Click to modify filters"
                            >
                                <div className="flex flex-wrap items-center gap-x-2">{hashtag}</div>
                            </div>
                        </div>
                    </div>

                    {/* Result List */}
                    <div className="divide-y divide-gray-200 dark:divide-slate-700">
                        {allResults.length === 0 ? (
                            <>
                                {!isLoaded ? (
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
                                        Please Wait While We Load Data...
                                    </div>
                                ) : (
                                    <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                                        No results found
                                    </div>
                                )}
                            </>
                        ) : (
                            allResults.map((item) => (
                                <a
                                    href={
                                        item.type === 'posts'
                                            ? route('home') + generateURL(item)
                                            : route('home') + '?m-slug=' + item.slug
                                    }
                                    target='_blank'
                                    onClick={() => window.history.replaceState({}, '', route('home'))}

                                    key={item.id}
                                    className="flex items-center gap-4 px-6 py-4 transition-colors cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-800/80"
                                >
                                    {/* Thumbnail */}

                                    <div className="flex-shrink-0 w-12 h-12 overflow-hidden rounded-lg ">
                                        {item.image ? (
                                            <img
                                                src={item.image || Placeholder}
                                                alt={item.title || item.name}
                                                className="object-cover w-full h-full"
                                                onError={(e) => e.target.src = Placeholder}
                                            />
                                        ) : !item?.image && item?.video_thumbnail && item?.type === 'posts' ? (
                                            <img
                                                src={item?.video_thumbnail || Placeholder}
                                                alt={item?.title}
                                                loading="lazy"
                                                decoding="async"
                                                onError={(e) => (e.target.src = Placeholder)}
                                                className="w-full object-cover text-[10px] text-gray-700 transition-all duration-500 group-hover:scale-105 dark:text-white/80 dark:opacity-80"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-sm text-white/80">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="size-6"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="truncate">{item.title || item.name}</h3>
                                        <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                                            {item?.location_name || ''}
                                        </p>

                                        <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                                            {item?.capacity || ''}
                                        </p>

                                        <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                                            {item?.tag}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                                            {item.created_at}
                                        </p>
                                    </div>

                                    {/* Right Info */}
                                    <div className="flex flex-wrap items-center justify-center gap-2 transition-all duration-200 opacity-0 group-hover:opacity-100 lg:flex-nowrap">
                                        <button
                                            title="Copy Link"
                                            className="flex items-center justify-center w-8 h-8 p-2 text-gray-500 rounded-full hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setLinkCopied(true);
                                                item.type === 'posts'
                                                    ? navigator.clipboard.writeText(
                                                        route('home') + generateURL(item),
                                                    )
                                                    : navigator.clipboard.writeText(
                                                        route('home') + '?m-slug=' + item.slug,
                                                    );
                                            }}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="size-4"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                                                />
                                            </svg>
                                        </button>


                                    </div>
                                </a>
                            ))
                        )}
                    </div>

                    {allResults.length > 0 && nextPageUrl && (
                        <div
                            ref={loaderRef}
                            className="flex items-center justify-center gap-2 py-10 text-center text-gray-700 transition-all duration-100 animate-pulse dark:text-white/80"
                        >
                            <div className="flex items-center justify-center">
                                <div role="status">
                                    <svg
                                        aria-hidden="true"
                                        className="w-5 h-5 text-gray-200 animate-spin fill-indigo-600 dark:text-gray-600"
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
                </div>
            </div>

            {linkCopied && (
                <LinkCopiedModal linkCopied={linkCopied} setLinkCopied={setLinkCopied} />
            )}
        </MainLayout>
    );
};

export default hashtagPosts;
