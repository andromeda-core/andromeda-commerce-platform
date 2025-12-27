import GlobalSearch from '@/Components/GlobalSearch';
import LinkCopiedModal from '@/Components/LinkCopiedModal';
import Toast from '@/Components/Toast';
import getCookie from '@/Hooks/useGetCookie';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import Placeholder from 'asset/assets/images/product/placeholder.jpg';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import useWindowSize from '@/Hooks/useWindowSize';
import Spinner from '@/Components/Spinner';
import TextPlaceholder from 'asset/assets/images/product/textPlaceholder.webp';




// Memoized result item component
const ResultItem = memo(({ item, onCopyLink, generateURL, activeView, width }) => {
    const Tag = width > 1024 ? 'a' : Link;
    // List View
    if (activeView === 'list') {
        return (
            <Tag
                href={
                    item.type === 'posts'
                        ? route('home') + generateURL(item)
                        : route('home') + '?m-slug=' + item.slug
                }
                target={width > 1024 ? '_blank' : undefined}
                onClick={() =>
                    window.history.replaceState({}, '', route('home')
                    )}
                className="flex flex-wrap items-center gap-4 p-1 py-4 transition-colors rounded-md cursor-pointer group hover:bg-surface-2-light dark:hover:bg-surface-2-dark"
            >
                {/* Thumbnail */}
                <div className="flex-shrink-0 w-12 h-12 overflow-hidden rounded-lg bg-surface-1-light dark:bg-surface-1-dark">
                    {item?.image || item?.video_thumbnail ? (
                        <img
                            src={item.image || item?.video_thumbnail || Placeholder}
                            alt={item.title || item.name}
                            className="object-cover w-full h-full"
                            onError={(e) => e.target.src = Placeholder}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-sm text-main-text-light dark:text-main-text-dark ">
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
                    <h3 className="font-medium truncate">{item.title || item.name}</h3>
                    <p className="text-xs truncate text-main-text-light dark:text-main-text-dark">
                        {item.type === 'posts' ? item.location_name || '' : item.capacity || ''}
                    </p>
                    {item.tag && (
                        <p className="text-xs truncate text-sub-text-light dark:text-sub-text-dark ">{item.tag}</p>
                    )}
                    <p className="text-xs truncate text-sub-text-light dark:text-sub-text-dark">
                        {item.created_at}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center flex-shrink-0 gap-2 transition-opacity duration-200 opacity-0 group-hover:opacity-100">
                    <button
                        title="Copy Link"
                        className="p-4 rounded-full hover:bg-surface-3-light text-main-text-light dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const url =
                                item.type === 'posts'
                                    ? route('home') + generateURL(item)
                                    : route('home') + '?m-slug=' + item.slug;
                            onCopyLink(url);
                        }}
                    >
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
                                d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                            />
                        </svg>
                    </button>
                </div>
            </Tag>
        )
    }
    // Grid View
    return (
        <Tag
            href={
                item.type === 'posts'
                    ? route('home') + generateURL(item)
                    : route('home') + '?m-slug=' + item.slug
            }
            target={width > 1024 ? '_blank' : undefined}
            onClick={() => window.history.replaceState({}, '', route('home'))}
            // Removed grid-cols to allow for vertical card stacking in a parent grid
            className="flex flex-col gap-2 transition-all cursor-pointer group"
        >
            <div className="relative w-full overflow-hidden rounded-xl bg-white aspect-[2/3]">


                {item?.image || item?.video_thumbnail ? (
                    <img
                        src={item.image || item?.video_thumbnail || Placeholder}
                        alt={item.title || item.name}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => (e.target.src = Placeholder)}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />

                ) : (
                    <div className="relative w-full overflow-hidden rounded-xl bg-white aspect-[2/3]">
                        <img
                            src={TextPlaceholder}
                            alt={item.title}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => (e.target.src = Placeholder)}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                )}

                <div className="absolute left-3 top-3">
                    <span className="text-[8px] text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] sm:text-[9px] md:text-[10px] lg:text-[17px]">
                        {item?.tag}
                    </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="mt-1 flex items-center justify-between text-[8px] font-bold text-gray-200 drop-shadow-sm sm:text-[9px] md:text-[10px] lg:text-[17px]">
                        <p className="text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] overflow-hidden text-ellipsis whitespace-nowrap block">
                            {item?.content && item.content.length > 25 ? (
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            item.content.substring(0, 25) +
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

                    </div>
                </div>

            </div>

        </Tag>
    );

});


const hashtagPosts = ({ hashtag, google_map_api_key }) => {
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

            <div className="min-h-screen pb-20">

                <div className="w-full max-w-6xl px-4 mx-auto overflow-x-hidden text-main-text-light sm:px-8 dark:text-main-text-dark">

                    <GlobalSearch
                        google_map_api_key={google_map_api_key}
                        searchPage={true}
                    />


                    {/* Header */}
                    <div className="flex items-center justify-between py-4">
                        <div className="relative flex items-center gap-6">
                            <button
                                className={`relative scale-105 pb-2 text-sm  transition-all duration-300 ease-in-out`}
                            >
                                <div className={`relative flex-shrink-0 px-4 py-2 text-sm transition-all rounded-full whitespace-nowrap  bg-main-text-light text-main-text-dark dark:bg-main-text-dark dark:text-main-text-light font-semibold
                                                `}>
                                    All
                                    <span
                                        className={`ml-1 text-xs text-main-text-dark dark:text-main-text-light`}
                                    >
                                        ({allResults.length})
                                    </span>
                                </div>

                            </button>
                            <div
                                className="relative flex items-center justify-between px-2 py-2 mb-3 text-sm transition-all rounded-md text-main-text-light border-gray-5 group dark:text-main-text-dark"
                            >
                                <div className="flex flex-wrap items-center gap-x-2">{hashtag}</div>
                            </div>
                        </div>





                        <div className="flex items-center gap-1">
                            {/* List View Icon */}
                            <button
                                onClick={() => setActiveView('list')}
                                className={`
              p-1 rounded-lg transition-all duration-200
              ${activeView === 'list'
                                        ? 'bg-surface-1-light dark:bg-surface-1-dark'
                                        : 'hover:bg-surface-1-light dark:hover:bg-surface-1-dark'
                                    }
            `}
                                aria-label="List view"
                                title="List view"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1}
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
                                className={`
              p-1 rounded-lg transition-all duration-200
              ${activeView === 'grid'
                                        ? 'bg-surface-1-light dark:bg-surface-1-dark'
                                        : 'hover:bg-surface-1-light dark:hover:bg-surface-1-dark'
                                    }
            `}
                                aria-label="Grid view"
                                title="Grid view"
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
                                <div className="flex items-center justify-center gap-2 py-10 text-center transition-all duration-100 text-main-text-light animate-pulse dark:text-main-text-dark">
                                    <Spinner />
                                    Please Wait While We Load Data...
                                </div>
                            ) : (
                                <div className="py-10 text-center text-main-text-light dark:text-main-text-dark">
                                    No results found
                                </div>
                            )}
                        </>
                    ) : (

                        <>

                            <div
                                role="feed"
                                className={activeView === 'grid' ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 lg:grid-cols-4 gap-2 mt-5' : 'flex flex-col'}
                            >
                                {allResults.map((item) => (
                                    <ResultItem
                                        key={`${item.type}-${item.id}`}
                                        item={item}
                                        onCopyLink={handleCopyLink}
                                        generateURL={generateURL}
                                        activeView={activeView}
                                        width={width}
                                    />
                                ))}
                            </div>

                        </>

                    )}

                    {allResults.length > 0 && nextPageUrl && (
                        <div
                            ref={loaderRef}
                            className="flex items-center justify-center gap-2 py-10 text-center transition-all duration-100 text-main-text-light dark:text-main-text-dark animate-pulse "
                        >
                            <div className="flex items-center justify-center">
                                <Spinner />
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
