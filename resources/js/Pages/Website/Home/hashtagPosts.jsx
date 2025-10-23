import GlobalSearch from '@/Components/GlobalSearch';
import useWindowSize from '@/Hooks/useWindowSize';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, router } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

const hashtagPosts = ({ posts, next_page_url, hashtag, google_map_api_key }) => {
    const [allResults, setAllResults] = useState(posts);
    const [nextPageUrl, setNextPageUrl] = useState(next_page_url || null);

    const windowSize = useWindowSize();
    const loaderRef = useRef(null);

    const generateURL = (post) => {
        return (
            `?slug=${post?.slug}&planet=earth${post?.latitude != null ? '&lat=' + post?.latitude : ''}` +
            `${post?.longitude != null ? '&lng=' + post?.longitude : ''}` +
            `${post?.location_name != null ? '&location_name=' + post?.location_name : ''}` +
            `&timestamp=${post?.timestamp}` +
            `${post?.floor != null ? '&floor=' + post?.floor : ''}`
        );
    };

    const fetchMoreResults = async () => {
        if (!nextPageUrl) return;

        try {
            const res = await axios.get(nextPageUrl, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const { backend_retuned_posts, backend_retuned_next_page_url } = res.data;

            setAllResults((prev) => {
                const existingKeys = new Set(prev.map((item) => `${item.type}-${item.id}`));

                const filteredNew = backend_retuned_posts.filter(
                    (item) => !existingKeys.has(`${item.type}-${item.id}`),
                );

                return [...prev, ...filteredNew];
            });

            setNextPageUrl(backend_retuned_next_page_url);
        } catch (err) {
            toast.error('Error fetching post ' + err);
        }
    };
    // Infinite Scroll Observer
    useEffect(() => {
        if (!loaderRef.current || !nextPageUrl) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchMoreResults();
                }
            },
            { threshold: 1 },
        );

        observer.observe(loaderRef.current);

        return () => {
            if (loaderRef.current) observer.unobserve(loaderRef.current);
        };
    }, [nextPageUrl]);

    return (
        <MainLayout>
            <Head title="HashTag" />

            <GlobalSearch
                google_map_api_key={google_map_api_key}
                additional_filters={false}
                hashtagPage={true}
                hashtag={hashtag}
            />

            <div className="pb-20 sm:px-6 sm:pb-20 lg:px-8">
                <div className="rounded-xl bg-white px-3 text-gray-900 dark:bg-deepcharcoal dark:text-gray-100 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-slate-700">
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
                                className="border-gray-5 group relative mb-3 mt-2 flex items-center justify-between rounded-lg px-2 py-2 text-sm text-indigo-600 transition-all dark:text-indigo-400"
                                title="Click to modify filters"
                            >
                                <div className="flex flex-wrap items-center gap-x-2">{hashtag}</div>
                            </div>
                        </div>
                    </div>

                    {/* Result List */}
                    <div className="divide-y divide-gray-200 dark:divide-slate-700">
                        {allResults.length === 0 ? (
                            <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                                No results found
                            </div>
                        ) : (
                            allResults.map((item) => (
                                <div
                                    key={item.id}
                                    className="group flex cursor-pointer items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/80"
                                >
                                    {/* Thumbnail */}
                                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-indigo-600 dark:bg-indigo-500">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.title || item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-sm text-white/80">
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
                                        <h3 className="truncate">{item.title || item.name}</h3>
                                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                            {item?.location_name || ''}
                                        </p>

                                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                            {item?.tag}
                                        </p>
                                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                            {item.created_at}
                                        </p>
                                    </div>

                                    {/* Right Info */}
                                    <div className="flex flex-wrap items-center justify-center gap-2 opacity-0 transition-all duration-200 group-hover:opacity-100 lg:flex-nowrap">
                                        <button
                                            title="Copy Link"
                                            className="flex h-8 w-8 items-center justify-center rounded-full p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                                            onClick={() => {
                                                navigator.clipboard.writeText(
                                                    route('home') + generateURL(item),
                                                );
                                                toast.success('Link copied to clipboard');
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

                                        <a
                                            title="Open"
                                            href={route('home') + generateURL(item)}
                                            {...(windowSize.width > 1024 && { target: '_blank' })}
                                            className="flex h-8 w-full items-center justify-center gap-2 rounded-full p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
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
                                                    d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                                                />
                                            </svg>
                                            <span className="text-xs">New Tab</span>
                                        </a>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {allResults.length > 0 && nextPageUrl && (
                        <div
                            ref={loaderRef}
                            className="flex animate-pulse items-center justify-center gap-2 py-10 text-center text-gray-700 transition-all duration-100 dark:text-white/80"
                        >
                            <div className="flex items-center justify-center">
                                <div role="status">
                                    <svg
                                        aria-hidden="true"
                                        className="h-5 w-5 animate-spin fill-indigo-600 text-gray-200 dark:text-gray-600"
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
        </MainLayout>
    );
};

export default hashtagPosts;
