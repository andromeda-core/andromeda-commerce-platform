import { useEffect, useMemo, useState } from 'react';
import debounce from 'lodash.debounce';

import axios from 'axios';
import { toast } from 'react-toastify';
function SearchDropdown({
    searchDropdown,
    setSearchDropdown,
    searchQuery,
    setSearchQuery,
    page,
    postPreferences,
}) {
    const [isVisible, setIsVisible] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchType, setSearchType] = useState('');
    const [activeType, setActiveType] = useState('all');

    const debouncedSearch = useMemo(
        () =>
            debounce(
                (query) =>
                    axios
                        .post(
                            route('website.global-search.search'),
                            { query: query, post_preferences: postPreferences, page: page },
                            { preserveScroll: true },
                        )
                        .then((res) => {
                            const data = res.data?.data || {};
                            const posts = Array.isArray(data.data) ? data.data : [];

                            if (posts.length > 0) {
                                setSearchResults(posts);
                            } else {
                                setSearchResults([]);
                            }
                            setSearchType(res.data.data?.type || '');
                            setShowLoader(false);
                        }),
                500,
            ),
        [],
    );

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    useEffect(() => {
        if (searchDropdown) {
            setIsVisible(true);
            setShowLoader(true);
            setTimeout(() => setAnimateIn(true), 10);
        } else {
            setAnimateIn(false);
            setSearchResults([]);

            const timeout = setTimeout(() => {
                setIsVisible(false);
                setShowLoader(false);
            }, 250);
            return () => clearTimeout(timeout);
        }
    }, [searchDropdown]);

    useEffect(() => {
        if (searchQuery?.trim()) {
            setShowLoader(true);
            debouncedSearch(searchQuery);
        }
    }, [searchQuery, debouncedSearch]);

    const generateURL = (post) => {
        return (
            `?slug=${post?.slug}&planet=earth${post?.latitude != null ? '&lat=' + post?.latitude : ''}` +
            `${post?.longitude != null ? '&lng=' + post?.longitude : ''}` +
            `${post?.location_name != null ? '&location_name=' + post?.location_name : ''}` +
            `&timestamp=${post?.created_at}` +
            `${post?.floor_id != null ? '&floor=' + post?.floor?.name : ''}`
        );
    };

    if (!isVisible) return null;

    return (
        <div className="relative">
            <div
                className={`absolute left-0 right-0 mt-2 w-full transform rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl transition-all duration-300 ease-out dark:border-gray-700 dark:bg-gray-900 ${animateIn ? 'animate-slideDown translate-y-0 opacity-100' : 'animate-slideUp -translate-y-3 opacity-0'} `}
            >
                {/* Top Bar */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {showLoader && searchQuery != '' && (
                            <div className="w-4 h-4 border-2 border-gray-400 rounded-full animate-spin border-t-transparent"></div>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            setSearchDropdown(false);
                            setSearchQuery('');
                        }}
                        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        Clear
                    </button>
                </div>

                {/* Skeleton Cards */}
                {showLoader && (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-3 border border-gray-100 animate-pulse rounded-xl dark:border-gray-800"
                            >
                                <div className="w-10 h-10 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
                                <div className="flex-1">
                                    <div className="w-2/3 h-3 mb-2 bg-gray-200 rounded dark:bg-gray-700"></div>
                                    <div className="w-1/3 h-3 bg-gray-200 rounded dark:bg-gray-700"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!showLoader && searchType == 'posts' && searchResults.length > 0 && (
                    <div className="max-h-[50vh] space-y-3 overflow-y-auto">
                        {searchResults.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between p-3 transition-all duration-200 border border-gray-100 group rounded-xl hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/40"
                            >
                                {/* Left side: icon/avatar + text */}
                                <div className="flex items-center gap-3">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="object-cover w-10 h-10 rounded-lg"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center w-10 h-10 text-blue-600 bg-blue-100 rounded-lg dark:bg-blue-600/20 dark:text-blue-400">
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

                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-800 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                                            {item.title_display ?? item.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {item.tag_display ?? item.tag}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {item.location_name} {item.floor}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {item.created_at}
                                        </p>
                                    </div>
                                </div>

                                {/* Right side: hover actions */}
                                <div className="flex flex-wrap items-center gap-2 transition-all duration-200 opacity-0 group-hover:opacity-100 lg:flex-nowrap">
                                    <button
                                        title="Copy Link"
                                        className="flex items-center justify-center w-8 h-8 p-2 text-gray-500 rounded-full hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                                        onClick={() => {
                                            navigator.clipboard.writeText(
                                                route('website.posts.index', generateURL(item)),
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
                                        href={route('website.posts.index', generateURL(item))}
                                        target="_blank"
                                        className="flex items-center justify-center w-full h-8 gap-2 p-2 text-gray-500 rounded-full hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
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
                        ))}
                    </div>
                )}

                {!showLoader && searchType === 'search' && searchResults.length > 0 && (
                    <>
                        {/* TYPE FILTER BAR */}
                        <div className="flex items-center gap-4 pb-2 mx-4 mb-3 border-b border-gray-100 dark:border-gray-700">
                            {[
                                { key: 'all', label: 'All', count: searchResults.length },
                                {
                                    key: 'posts',
                                    label: 'Posts',
                                    count: searchResults.filter((i) => i.type === 'posts').length,
                                },
                                {
                                    key: 'smartphones',
                                    label: 'Products',
                                    count: searchResults.filter((i) => i.type === 'smartphones')
                                        .length,
                                },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveType(tab.key)}
                                    className={`flex items-center gap-1 text-sm font-medium transition-all ${
                                        activeType === tab.key
                                            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    {tab.label}
                                    <span
                                        className={`ml-1 rounded-md px-1.5 text-xs ${
                                            activeType === tab.key
                                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-800/50 dark:text-blue-300'
                                                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                        }`}
                                    >
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="max-h-[50vh] space-y-5 overflow-y-auto">
                            {/* POSTS SECTION */}
                            {(activeType === 'all' || activeType === 'posts') &&
                                searchResults.some((item) => item.type === 'posts') && (
                                    <div>
                                        <h3 className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                            Posts
                                        </h3>
                                        <div className="space-y-3">
                                            {searchResults
                                                .filter((item) => item.type === 'posts')
                                                .map((item) => (
                                                    <div
                                                        key={`post-${item.id}`}
                                                        className="flex items-center justify-between p-3 transition-all duration-200 border border-gray-100 group rounded-xl hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/40"
                                                    >
                                                        {/* Left side: image/icon + text */}
                                                        <div className="flex items-center gap-3">
                                                            {item.image ? (
                                                                <img
                                                                    src={item.image}
                                                                    alt={item.title}
                                                                    className="object-cover w-10 h-10 rounded-lg"
                                                                />
                                                            ) : (
                                                                <div className="flex items-center justify-center w-10 h-10 text-blue-600 bg-blue-100 rounded-lg dark:bg-blue-600/20 dark:text-blue-400">
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

                                                            <div>
                                                                <h4 className="text-xs font-semibold text-gray-800 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                                                                    {item.title_display ?? item.title}
                                                                </h4>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {item.tag_display ?? item.tag}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {item.location_name}{' '}
                                                                    {item.floor}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {item.created_at}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Right side actions */}
                                                        <div className="flex flex-wrap items-center justify-center gap-2 transition-all duration-200 opacity-0 group-hover:opacity-100 lg:flex-nowrap">
                                                            <button
                                                                title="Copy Link"
                                                                className="flex items-center justify-center w-8 h-8 p-2 text-xs text-gray-500 rounded-full hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(
                                                                        route(
                                                                            'website.posts.index',
                                                                            generateURL(item),
                                                                        ),
                                                                    );
                                                                    toast.success(
                                                                        'Link copied to clipboard',
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

                                                            <a
                                                                title="Open"
                                                                href={route(
                                                                    'website.posts.index',
                                                                    generateURL(item),
                                                                )}
                                                                target="_blank"
                                                                className="flex items-center justify-center w-full h-8 gap-2 p-2 text-xs text-gray-500 rounded-full hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
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
                                                                <span className="text-xs">
                                                                    New Tab
                                                                </span>
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}

                            {/* Products SECTION */}
                            {(activeType === 'all' || activeType === 'smartphones') &&
                                searchResults.some((item) => item.type === 'smartphones') && (
                                    <div>
                                        <h3 className="mt-5 mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                            Products
                                        </h3>
                                        <div className="space-y-3">
                                            {searchResults
                                                .filter((item) => item.type === 'smartphones')
                                                .map((item) => (
                                                    <div
                                                        key={`phone-${item.id}`}
                                                        className="flex items-center justify-between p-3 transition-all duration-200 border border-gray-100 group rounded-xl hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/40"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-600/20 dark:text-emerald-400">
                                                                {item.image && (
                                                                    <img
                                                                        src={item.image}
                                                                        alt={item.name}
                                                                        className="object-cover w-10 h-10 rounded-lg"
                                                                    />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-xs font-semibold text-gray-800 group-hover:text-emerald-600 dark:text-gray-100 dark:group-hover:text-emerald-400">
                                                                    {item.name}
                                                                </h4>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {item.capacity}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex flex-wrap items-center justify-center gap-2 transition-all duration-200 opacity-0 group-hover:opacity-100 lg:flex-nowrap">
                                                            <button
                                                                title="Copy Link"
                                                                className="flex items-center justify-center w-8 h-8 p-2 text-xs text-gray-500 rounded-full hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(
                                                                        'Pending',
                                                                    );
                                                                    toast.success(
                                                                        'Link copied to clipboard',
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

                                                            <a
                                                                title="Open"
                                                                href={'#'}
                                                                target="_blank"
                                                                className="flex items-center justify-center w-full h-8 gap-2 p-2 text-xs text-gray-500 rounded-full hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
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
                                                                <span className="text-xs">
                                                                    New Tab
                                                                </span>
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </>
                )}

                {!showLoader && searchResults.length < 1 && (
                    <div className="pb-2 text-sm text-center text-gray-500 dark:text-gray-400">
                        No results found
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchDropdown;
