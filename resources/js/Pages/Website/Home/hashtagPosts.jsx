import GlobalSearch from '@/Components/GlobalSearch';
import LinkCopiedModal from '@/Components/LinkCopiedModal';
import Toast from '@/Components/Toast';
import getCookie from '@/Hooks/useGetCookie';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import Placeholder from 'asset/assets/images/product/placeholder.jpg';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import useWindowSize from '@/Hooks/useWindowSize';
import Spinner from '@/Components/Spinner';
import { useTranslation } from '@/Hooks/useTranslation';
import DisplayPrice from '@/Components/DisplayPrice';

// Memoized result item component
const ResultItem = memo(
    ({ item, onCopyLink, generateURL, generateSmartphoneURL, activeView, width, __ }) => {
        // List View
        if (activeView === 'list') {
            return (
                <div
                    role={'button'}
                    onClick={() => {
                        const url =
                            item.type === 'posts'
                                ? route('home') + generateURL(item, true, true)
                                : route('home') + generateSmartphoneURL(item, true, true);

                        if (width > 1024) {
                            window.history.replaceState({}, '', route('home'));
                            window.open(url, '_blank');
                        } else {
                            router.visit(url, {
                                replace: true,
                            });
                        }
                    }}
                    className="no-touch-hover group flex cursor-pointer flex-wrap items-center gap-4 rounded-md py-4 transition-colors lg:hover:bg-surface-2-light lg:dark:hover:bg-surface-2-dark"
                >
                    {/* Thumbnail */}
                    <div className="ml-0 h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-surface-1-light dark:bg-surface-1-dark lg:ml-3">
                        {item?.image || item?.video_thumbnail ? (
                            <img
                                src={item.image || item?.video_thumbnail || Placeholder}
                                alt={item.title || item.name}
                                className="h-full w-full object-cover"
                                onError={(e) => (e.target.src = Placeholder)}
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-main-text-light dark:text-main-text-dark">
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
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate font-medium">{item.title || item.name}</h3>
                        <p className="truncate text-xs text-main-text-light dark:text-main-text-dark">
                            {item.type === 'posts' ? item.location_name || '' : item.capacity || ''}
                        </p>
                        {item.tag && (
                            <p className="truncate text-xs text-sub-text-light dark:text-sub-text-dark">
                                {item.tag}
                            </p>
                        )}
                        <p className="truncate text-xs text-sub-text-light dark:text-sub-text-dark">
                            {item.created_at}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="-mr-4 flex flex-shrink-0 items-center gap-2 opacity-100 transition-opacity duration-200 group-hover:opacity-100 lg:mr-5 lg:opacity-0">
                        <button
                            title={__('Copy Link')}
                            className="rounded-full p-4 text-main-text-light dark:text-main-text-dark lg:hover:bg-surface-3-light lg:dark:hover:bg-surface-3-dark"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const url =
                                    item.type === 'posts'
                                        ? route('home') + generateURL(item, true, true)
                                        : route('home') + generateSmartphoneURL(item, true, true);
                                onCopyLink(url);
                            }}
                        >
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
                                    d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            );
        }
        // Grid View
        return (
            <div
                role={'button'}
                onClick={() => {
                    const url =
                        item.type === 'posts'
                            ? route('home') + generateURL(item, true, true)
                            : route('home') + generateSmartphoneURL(item, true, true);

                    if (width > 1024) {
                        window.history.replaceState({}, '', route('home'));
                        window.open(url, '_blank');
                    } else {
                        router.visit(url, {
                            replace: true,
                        });
                    }
                }}
                className="group relative cursor-pointer break-inside-avoid overflow-hidden rounded-md transition-all duration-300"
            >
                {item?.image || item?.video_thumbnail ? (
                    <div className="relative">
                        <div className="aspect-[2/3] transition-transform duration-500 lg:group-hover:scale-105">
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

                            <img
                                src={item.image || item?.video_thumbnail || Placeholder}
                                alt={item.title || item.name}
                                loading="lazy"
                                decoding="async"
                                onError={(e) => (e.target.src = Placeholder)}
                                className="h-full w-full object-cover"
                            />
                        </div>

                        <div className="absolute left-3 top-3">
                            <span className="text-[14px] font-semibold text-white">
                                {item?.tag}
                            </span>
                        </div>

                        <div className="absolute inset-x-0 bottom-0 p-4">
                            {item?.type === 'smartphones' && (
                                <div className="flex flex-col items-start space-y-1 text-[14px] font-semibold">
                                    {item.selling_info?.total_price ? (
                                        <DisplayPrice
                                            usdAmount={item.selling_info.total_price}
                                            showEstimatedLabel={false}
                                            className="w-full overflow-hidden truncate text-white"
                                        />
                                    ) : (
                                        ''
                                    )}
                                    <p className="w-full overflow-hidden truncate text-white">
                                        {item.name.length > 20
                                            ? item.name.slice(0, 20) + '...'
                                            : item.name}{' '}
                                        (
                                        {item.capacity.length > 10
                                            ? item.capacity.slice(0, 10) + '...'
                                            : item.capacity}
                                        )
                                    </p>
                                </div>
                            )}

                            {item?.type === 'posts' && (
                                <div className="flex items-center justify-between text-[14px]">
                                    <p className="min-w-0 flex-1 font-semibold leading-relaxed text-white">
                                        <span
                                            className="line-clamp-2 break-words"
                                            dangerouslySetInnerHTML={{
                                                __html: item?.content
                                                    ?.replace(/<[^>]*>/g, ' ')
                                                    .replace(/\s+/g, ' ')
                                                    .trim(),
                                            }}
                                        />
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="relative flex aspect-[2/3] w-full flex-col bg-surface-2-light text-black transition-transform duration-500 dark:bg-surface-2-dark dark:text-white lg:group-hover:scale-[1.02]">
                        {/* Tag - Top Left */}
                        <div className="absolute left-4 top-3 z-10">
                            <span className="text-[14px] font-semibold text-black dark:text-white">
                                {item?.tag}
                            </span>
                        </div>

                        {/* Content Area */}
                        <div className="relative flex h-full flex-col overflow-hidden p-4 pt-12">
                            {item?.type === 'posts' ? (
                                // Posts - Simple text display
                                <div className="flex-1 overflow-hidden">
                                    <p className="line-clamp-[12] whitespace-pre-line break-words text-[14px] leading-relaxed opacity-90">
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: item?.content.trim(),
                                            }}
                                        ></span>
                                    </p>
                                </div>
                            ) : (
                                // Smartphones - Text with bottom price
                                <>
                                    {/* Text Content */}
                                    <div className="flex-1 overflow-hidden pb-12">
                                        <p className="line-clamp-[10] whitespace-pre-line break-words text-[14px] leading-relaxed opacity-90">
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: item?.content.trim(),
                                                }}
                                            ></span>
                                        </p>
                                    </div>

                                    {/* Price Bar  */}
                                    <div className="absolute inset-x-0 bottom-0 p-4 pt-6">
                                        <div className="flex flex-col items-start space-y-1 font-semibold">
                                            {item.selling_info?.total_price ? (
                                                <DisplayPrice
                                                    usdAmount={item.selling_info.total_price}
                                                    showEstimatedLabel={false}
                                                    className="w-full truncate text-[14px] text-main-text-light dark:text-main-text-dark"
                                                />
                                            ) : (
                                                ''
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    },
);

const hashtagPosts = ({ hashtag, google_map_api_key }) => {
    const [results, setResults] = useState([]);
    const [nextPageUrl, setNextPageUrl] = useState(null);

    const [allResults, setAllResults] = useState(results);

    const [linkCopied, setLinkCopied] = useState(false);

    // Translation Hook
    const { __ } = useTranslation();

    const loaderRef = useRef(null);

    // Posts
    const generateURL = (post, isDirect = false, isSinglePage = false) => {
        return `/post/${encodeURIComponent(post?.public_id)}/${encodeURIComponent(post?.slug)}`;
    };

    // Smartphones
    const generateSmartphoneURL = (smartphone, isDirect = false, isSinglePage = false) => {
        return `/product/${encodeURIComponent(smartphone?.public_id)}/${encodeURIComponent(smartphone?.slug)}`; //${isSinglePage ? '&single_page=true' : ''}${isDirect ? '&direct=true' : ''}`;
    };

    const { width } = useWindowSize();
    const [isLoaded, setIsLoaded] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [ErrorMessage, setErrorMessage] = useState('');
    const [showErrorMessage, setShowErrorMessage] = useState(false);

    // View UI State
    const [activeView, setActiveView] = useState('list');

    const fetchResults = async () => {
        const cookieValue = getCookie('post_preferences');
        let parsed = null;

        if (cookieValue && cookieValue !== 'null' && cookieValue !== 'undefined') {
            try {
                parsed = JSON.parse(decodeURIComponent(cookieValue));
            } catch (error) {
                console.warn('⚠️ ' + __('Invalid post_preferences cookie. Using defaults.'), error);
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

    const handleCopyLink = useCallback((url) => {
        setLinkCopied(true);
        navigator.clipboard.writeText(url);
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
                    console.warn(
                        '⚠️ ' + __('Invalid post_preferences cookie. Using defaults.'),
                        error,
                    );
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
            <Head title={__('HashTag')} />
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

            <div className="min-h-screen pb-20">
                <div className="mx-auto w-full max-w-6xl overflow-x-hidden px-4 text-main-text-light dark:text-main-text-dark sm:px-8">
                    <GlobalSearch google_map_api_key={google_map_api_key} searchPage={true} />

                    {/* Header */}
                    <div className="flex items-center justify-between py-4">
                        <div className="relative flex items-center gap-6">
                            <button
                                className={`relative scale-105 pb-2 text-sm transition-all duration-300 ease-in-out`}
                            >
                                <div
                                    className={`relative flex-shrink-0 whitespace-nowrap rounded-full bg-main-text-light px-4 py-2 text-sm font-semibold text-main-text-dark transition-all dark:bg-main-text-dark dark:text-main-text-light`}
                                >
                                    {__('All')}
                                    <span
                                        className={`ml-1 text-xs text-main-text-dark dark:text-main-text-light`}
                                    >
                                        ({allResults.length})
                                    </span>
                                </div>
                            </button>
                            <div className="border-gray-5 group relative mb-3 flex items-center justify-between rounded-md px-2 py-2 text-sm text-main-text-light transition-all dark:text-main-text-dark">
                                <div className="flex flex-wrap items-center gap-x-2">{hashtag}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            {/* List View Icon */}
                            <button
                                onClick={() => setActiveView('list')}
                                className={`rounded-lg p-1 transition-all duration-200 ${
                                    activeView === 'list'
                                        ? 'bg-surface-2-light dark:bg-surface-2-dark'
                                        : 'hover:bg-surface-2-light dark:hover:bg-surface-2-dark'
                                } `}
                                aria-label="List view"
                                title={__('List View')}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="size-7"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
                                    />
                                </svg>
                            </button>

                            {/* Grid View Icon */}
                            <button
                                onClick={() => setActiveView('grid')}
                                className={`rounded-lg p-1 transition-all duration-200 ${
                                    activeView === 'grid'
                                        ? 'bg-surface-2-light dark:bg-surface-2-dark'
                                        : 'hover:bg-surface-2-light dark:hover:bg-surface-2-dark'
                                } `}
                                aria-label="Grid view"
                                title={__('Grid View')}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="size-7"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Result List */}
                    {allResults.length === 0 ? (
                        <>
                            {!isLoaded ? (
                                <div className="flex animate-pulse items-center justify-center gap-2 py-10 text-center text-main-text-light transition-all duration-100 dark:text-main-text-dark">
                                    <Spinner />
                                    {__('Please Wait While We Load Data')}...
                                </div>
                            ) : (
                                <div className="py-10 text-center text-main-text-light dark:text-main-text-dark">
                                    {__('No results found')}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div
                                role="feed"
                                className={
                                    activeView === 'grid'
                                        ? 'mt-5 grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                                        : 'flex flex-col'
                                }
                            >
                                {allResults.map((item) => (
                                    <ResultItem
                                        key={`${item.type}-${item.id}`}
                                        item={item}
                                        onCopyLink={handleCopyLink}
                                        generateURL={generateURL}
                                        generateSmartphoneURL={generateSmartphoneURL}
                                        activeView={activeView}
                                        width={width}
                                        __={__}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {allResults.length > 0 && nextPageUrl && (
                        <div
                            ref={loaderRef}
                            className="flex animate-pulse items-center justify-center gap-2 py-10 text-center text-main-text-light transition-all duration-100 dark:text-main-text-dark"
                        >
                            <div className="flex items-center justify-center">
                                <Spinner />
                            </div>
                            {__('Loading More')}...
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
