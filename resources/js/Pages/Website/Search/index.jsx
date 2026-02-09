import React, { useEffect, useMemo, useRef, useState, useCallback, memo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/Website/MainLayout';
import GlobalSearch from '@/Components/GlobalSearch';
import Toast from '@/Components/Toast';
import LinkCopiedModal from '@/Components/LinkCopiedModal';
import Placeholder from 'asset/assets/images/product/placeholder.jpg';
import { useConfirm } from '@/Hooks/useConfirm';
import useWindowSize from '@/Hooks/useWindowSize';
import Spinner from '@/Components/Spinner';
import { useTranslation } from '@/Hooks/useTranslation';

// Memoized result item component
const ResultItem = memo(({ item, onCopyLink, generateURL, generateSmartphoneURL, activeView, __, currency }) => {
    const { width } = useWindowSize();
    // List View
    if (activeView === 'list') {
        return (
            <div
                role={'button'}
                onClick={() => {

                    const url = item.type === 'posts'
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
                }
                }
                className="flex flex-wrap items-center gap-4 py-4 transition-colors rounded-md cursor-pointer group no-touch-hover lg:hover:bg-surface-2-light lg:dark:hover:bg-surface-2-dark"
            >
                {/* Thumbnail */}
                <div className="flex-shrink-0 w-12 h-12 ml-0 overflow-hidden rounded-lg lg:ml-3 bg-surface-1-light dark:bg-surface-1-dark">
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
                <div className="flex items-center flex-shrink-0 gap-2 -mr-4 transition-opacity duration-200 opacity-100 lg:mr-5 lg:opacity-0 group-hover:opacity-100">
                    <button
                        title={__('Copy Link')}
                        className="p-4 rounded-full lg:hover:bg-surface-3-light text-main-text-light dark:text-main-text-dark lg:dark:hover:bg-surface-3-dark"
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
            </div>
        )
    }


    // Grid View
    return (
        <div
            role={'button'}
            onClick={() => {
                const url = item.type === 'posts'
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
            className="relative overflow-hidden transition-all duration-300 rounded-md cursor-pointer group break-inside-avoid"
        >
            {item?.image || item?.video_thumbnail ? (
                <div className="relative">
                    <div className="transition-transform  duration-500 lg:group-hover:scale-105 aspect-[2/3]">
                        {/* Top gradient */}
                        <div
                            className="pointer-events-none absolute inset-x-0 top-0 h-[40%]"
                            style={{
                                background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0))',
                                mixBlendMode: 'multiply',
                            }}
                        />

                        {/* Bottom gradient */}
                        <div
                            className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%]"
                            style={{
                                background: 'linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0))',
                                mixBlendMode: 'multiply',
                            }}
                        />

                        <img
                            src={item.image || item?.video_thumbnail || Placeholder}
                            alt={item.title || item.name}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => (e.target.src = Placeholder)}
                            className="object-cover w-full h-full"
                        />
                    </div>

                    <div className="absolute left-3 top-3">
                        <span className="text-white font-semibold text-[14px]">
                            {item?.tag}
                        </span>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-4">
                        {item?.type === 'smartphones' && (
                            <div className="flex flex-col items-start font-semibold text-[14px] space-y-1">
                                <p className="w-full overflow-hidden text-white truncate">
                                    {item.selling_info?.total_price
                                        ? `${currency?.symbol}${item.selling_info.total_price}`
                                        : ''}
                                </p>
                                <p className="w-full overflow-hidden text-white truncate">
                                    {item.name.length > 20 ? item.name.slice(0, 20) + '...' : item.name}
                                    {' '}
                                    ({item.capacity.length > 10 ? item.capacity.slice(0, 10) + '...' : item.capacity})
                                </p>
                            </div>
                        )}

                        {item?.type === 'posts' && (
                            <div className="flex items-center justify-between text-[14px]">
                                <p className="flex-1 min-w-0 font-semibold leading-relaxed text-white">
                                    <span
                                        className="break-words line-clamp-2"
                                        dangerouslySetInnerHTML={{
                                            __html: item?.content?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
                                        }}
                                    />
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="relative flex flex-col bg-surface-2-light dark:bg-surface-2-dark transition-transform duration-500 lg:group-hover:scale-[1.02] text-black dark:text-white w-full aspect-[2/3]">
                    {/* Tag - Top Left */}
                    <div className="absolute z-10 left-4 top-3">
                        <span className="text-black dark:text-white font-semibold text-[14px]">
                            {item?.tag}
                        </span>
                    </div>

                    {/* Content Area */}
                    <div className="relative flex flex-col h-full p-4 pt-12 overflow-hidden">
                        {item?.type === 'posts' ? (
                            // Posts - Simple text display
                            <div className="flex-1 overflow-hidden">
                                <p className="line-clamp-[12] whitespace-pre-line break-words opacity-90 text-[14px] leading-relaxed">
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
                                <div className="flex-1 pb-12 overflow-hidden">
                                    <p className="line-clamp-[10] whitespace-pre-line break-words opacity-90 text-[14px] leading-relaxed">
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: item?.content.trim(),
                                            }}
                                        ></span>
                                    </p>
                                </div>

                                {/* Price Bar  */}
                                <div className="absolute inset-x-0 bottom-0 p-4 pt-6 ">
                                    <div className="flex flex-col items-start space-y-1 font-semibold">
                                        <p className="w-full text-[14px] text-main-text-light dark:text-main-text-dark truncate">
                                            {item.selling_info?.total_price
                                                ? `${currency?.symbol}${item.selling_info.total_price}`
                                                : ''}
                                        </p>

                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

});

const Index = ({
    floors,
    google_map_api_key,
    search_histories,
    results,
    query,
    filters,
    pagination,
    search_history_next_page_url,
    all_search_histories
}) => {
    const { auth, currency } = usePage().props;

    // Translation Hook
    const { __ } = useTranslation();

    // Consolidated state management
    const [state, setState] = useState({
        defaultPostFilters: filters || {},
        searchHistories: Object.values(all_search_histories).length > 0
            ? all_search_histories
            : search_histories || [],
        searchHistoriesNextPageUrl: search_history_next_page_url || null,
        historyResultsCache: {},
        historyResults: [],
        historyNextPageUrl: null,
        activeTab: 'all',
        activeMatchType: null,
        isFetchingMore: false,
        isFetchingMoreHistories: false,
        searchHistoryLoading: false,
        canScrollLeft: false,
        canScrollRight: false,
    });

    // UI state (separate to prevent unnecessary re-renders of main state)
    const [uiState, setUiState] = useState({
        errorMessage: null,
        showErrorMessage: false,
        infoMessage: null,
        showInfoMessage: false,
        linkCopied: false,
    });

    // View UI State
    const [activeView, setActiveView] = useState('list');

    // Refs
    const loaderRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const historiesEndRef = useRef(null);
    const observersRef = useRef({ loader: null, histories: null });

    // Memoized helper functions
    const hasPerformedSearch = useCallback(() => {
        if (query && query.trim() !== '') return true;
        if (filters?.address?.lat && filters?.address?.lng) return true;
        return false;
    }, [query, filters]);

    const generateURL = useCallback((post, isDirect = false, isSinglePage = false) => {
        return (
            `?slug=${encodeURIComponent(post?.slug)}${isSinglePage ? '&single_page=true' : ''}${isDirect ? '&direct=true' : ''}&planet=earth${post?.latitude != null ? '&lat=' + encodeURIComponent(post?.latitude) : ''
            }` +
            `${post?.longitude != null ? '&lng=' + encodeURIComponent(post?.longitude) : ''}` +
            `${post?.location_name != null
                ? '&location_name=' + encodeURIComponent(post?.location_name)
                : ''
            }` +
            `&timestamp=${encodeURIComponent(post?.timestamp)}` +
            `${post?.floor != null ? '&floor=' + encodeURIComponent(post?.floor) : ''}`
        );
    }, []);


    // Smartphone URL Generation
    const generateSmartphoneURL = useCallback((smartphone, isDirect = false, isSinglePage = false) => {
        return (
            `?m-slug=${smartphone?.slug}${isSinglePage ? '&single_page=true' : ''}${isDirect ? '&direct=true' : ''}`
        );
    }, []);




    // Batch state updates helper
    const updateState = useCallback((updates) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    const updateUiState = useCallback((updates) => {
        setUiState(prev => ({ ...prev, ...updates }));
    }, []);

    // Optimized scroll button update with debouncing
    const updateScrollButtons = useCallback(() => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            const newCanScrollLeft = scrollLeft > 0;
            const newCanScrollRight = scrollLeft < scrollWidth - clientWidth - 20;

            // Only update if values changed
            if (newCanScrollLeft !== state.canScrollLeft || newCanScrollRight !== state.canScrollRight) {
                updateState({
                    canScrollLeft: newCanScrollLeft,
                    canScrollRight: newCanScrollRight
                });
            }
        }
    }, [state.canScrollLeft, state.canScrollRight]);

    // Scroll handlers
    const scrollLeft = useCallback(() => {
        scrollContainerRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
    }, []);

    const scrollRight = useCallback(() => {
        scrollContainerRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
    }, []);


    // Get current tab data (memoized)
    const getCurrentTabData = useCallback(() => {
        if (state.activeTab === 'all') {
            return {
                results: state.historyResults,
                nextPageUrl: state.historyNextPageUrl,
            };
        }

        if (typeof state.activeTab === 'number') {
            return state.historyResultsCache[state.activeTab] || { results: [], nextPageUrl: null };
        }

        return { results: [], nextPageUrl: null };
    }, [state.activeTab, state.historyResults, state.historyNextPageUrl, state.historyResultsCache]);

    const { results: currentResults, nextPageUrl } = getCurrentTabData();

    // Fetch more search histories
    const fetchMoreSearchHistories = useCallback(async () => {
        if (!state.searchHistoriesNextPageUrl || state.isFetchingMoreHistories) return;

        updateState({ isFetchingMoreHistories: true });

        try {
            const res = await axios.get(state.searchHistoriesNextPageUrl, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });

            if (res.data.status) {
                setState(prev => {
                    const existingIds = new Set(prev.searchHistories.map(h => h.id));
                    const newUnique = (res.data.results || []).filter(h => !existingIds.has(h.id));

                    return {
                        ...prev,
                        searchHistories: [...prev.searchHistories, ...newUnique],
                        searchHistoriesNextPageUrl: res.data.next_page_url || null,
                        isFetchingMoreHistories: false
                    };
                });
            } else {
                updateState({ isFetchingMoreHistories: false });
            }
        } catch (err) {
            console.error(__('Error fetching more search histories') + ':', err);
            updateState({ isFetchingMoreHistories: false });
        }
    }, [state.searchHistoriesNextPageUrl, state.isFetchingMoreHistories]);

    // Fetch history results
    const fetchHistoryResults = useCallback(async () => {
        if (!auth.user) return;

        if (results.length === 0 && hasPerformedSearch()) return;

        try {
            const res = await axios.get(route('website.global-search.history-results'), {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });

            if (res.data.status) {
                updateState({
                    historyResults: res.data.results || [],
                    historyNextPageUrl: res.data.next_page_url || null
                });
            }
        } catch (err) {
            console.error(__('Error fetching history results') + ':', err);
        }
    }, [auth.user]);

    // Fetch search history results
    const fetchSearchHistoryResults = useCallback(async (historyId) => {
        if (state.historyResultsCache[historyId]) return;

        updateState({ searchHistoryLoading: true });

        try {
            const res = await axios.get(
                route('website.global-search.history-results', { id: historyId }),
                { headers: { 'X-Requested-With': 'XMLHttpRequest' } }
            );

            if (res.data.status) {
                setState(prev => ({
                    ...prev,
                    historyResultsCache: {
                        ...prev.historyResultsCache,
                        [historyId]: {
                            results: res.data.results || [],
                            nextPageUrl: res.data.pagination?.next_page_url || null,
                        },
                    },
                    searchHistoryLoading: false
                }));
            } else {
                updateUiState({
                    errorMessage: res.data.message,
                    showErrorMessage: true
                });
                updateState({ searchHistoryLoading: false });
            }
        } catch (err) {
            updateUiState({
                errorMessage: err.message || __('Failed to fetch search results'),
                showErrorMessage: true
            });
            updateState({ searchHistoryLoading: false });
        }
    }, [state.historyResultsCache]);

    // Handle tab change
    const handleTabChange = useCallback((tabKey) => {
        const container = scrollContainerRef.current;
        const prevScroll = container?.scrollLeft ?? 0;
        updateState({ activeTab: tabKey, activeMatchType: null });

        if (tabKey === 'all') {
            if (state.historyResults.length === 0 && !hasPerformedSearch()) {
                fetchHistoryResults();
            }
        } else if (typeof tabKey === 'number') {
            fetchSearchHistoryResults(tabKey);
        }

        requestAnimationFrame(() => {
            if (container) {
                container.scrollLeft = prevScroll;
            }
        });
    }, [state.historyResults.length, hasPerformedSearch, fetchHistoryResults, fetchSearchHistoryResults]);

    // Fetch more results with optimization
    const fetchMoreResults = useCallback(async () => {
        const currentTabNextPageUrl = state.activeTab === 'all'
            ? state.historyNextPageUrl
            : (typeof state.activeTab === 'number' ? state.historyResultsCache[state.activeTab]?.nextPageUrl : null);

        if (!currentTabNextPageUrl || state.isFetchingMore) return;

        updateState({ isFetchingMore: true });

        try {
            const res = await axios.get(currentTabNextPageUrl, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });

            const { results: newResults, next_page_url } = res.data;

            setState(prev => {
                if (prev.activeTab === 'all') {
                    const existingKeys = new Set(prev.historyResults.map(item => `${item.type}-${item.id}`));
                    const filteredNew = newResults.filter(
                        item => !existingKeys.has(`${item.type}-${item.id}`)
                    );

                    return {
                        ...prev,
                        historyResults: [...prev.historyResults, ...filteredNew],
                        historyNextPageUrl: next_page_url,
                        isFetchingMore: false
                    };
                } else if (typeof prev.activeTab === 'number') {
                    const existingData = prev.historyResultsCache[prev.activeTab] || { results: [], nextPageUrl: null };
                    const existingKeys = new Set(
                        existingData.results.map(item => `${item.type}-${item.id}`)
                    );
                    const filteredNew = newResults.filter(
                        item => !existingKeys.has(`${item.type}-${item.id}`)
                    );

                    return {
                        ...prev,
                        historyResultsCache: {
                            ...prev.historyResultsCache,
                            [prev.activeTab]: {
                                results: [...existingData.results, ...filteredNew],
                                nextPageUrl: next_page_url,
                            },
                        },
                        isFetchingMore: false
                    };
                }

                return { ...prev, isFetchingMore: false };
            });
        } catch (err) {
            updateUiState({
                showErrorMessage: true,
                errorMessage: __('Error fetching more results') + ':' + ' ' + err.message
            });
            updateState({ isFetchingMore: false });
        }
    }, [state.activeTab, state.historyNextPageUrl, state.historyResultsCache, state.isFetchingMore]);

    // Delete search history
    const { confirm, ConfirmDialog } = useConfirm();
    const deleteSearchHistory = useCallback(async (id) => {


        try {
            const result = await confirm({
                title: __('Are You Sure You Want To Delete Your Search History') + '?',
                text: __("You Won't Be Able To Revert This") + "!",
                icon: 'danger',
                showCancelButton: true,
                confirmButtonText: __('Yes'),
                cancelButtonText: __('No')
            });

            if (result.isConfirmed) {

                if (observersRef.current.loader) {
                    observersRef.current.loader.disconnect();
                }

                updateState({ searchHistoryLoading: true });
                const res = await axios.delete(
                    route('website.global-search.search-history-destroy', { id })
                );

                if (res.data.status) {


                    setState(prev => {
                        const updatedHistories = prev.searchHistories.filter(h => h.id !== id);
                        if (updatedHistories.length === 0) {
                            setTimeout(() => {
                                window.location.reload();
                            }, 50);
                            return prev;
                        }

                        const newCache = { ...prev.historyResultsCache };
                        delete newCache[id];

                        const updates = {
                            searchHistories: updatedHistories,
                            historyResultsCache: newCache,
                            searchHistoryLoading: false
                        };

                        if (prev.activeTab === id) {
                            updates.activeTab = 'all';
                            scrollContainerRef.current?.scrollTo(0, 0);
                        }

                        return { ...prev, ...updates };
                    });



                    if (state.activeTab === id && state.historyResults.length === 0) {
                        fetchHistoryResults();
                    }
                }
            }

            return;


        } catch (e) {
            updateUiState({
                errorMessage: e.message || __('Something went wrong'),
                showErrorMessage: true
            });
            updateState({ searchHistoryLoading: false });
        }
    }, [state.activeTab, state.historyResults.length, fetchHistoryResults]);

    // Copy link handler
    const handleCopyLink = useCallback((url) => {
        updateUiState({ linkCopied: true });
        navigator.clipboard.writeText(url);
    }, []);




    // Get display results (memoized)
    const displayResults = useMemo(() => {
        if (state.activeTab === 'all') {
            return state.historyResults;
        }

        if (typeof state.activeTab === 'number') {
            return currentResults;
        }

        return [];
    }, [state.activeTab, state.historyResults, currentResults]);

    // Match type groups (memoized)
    const matchTypeGroups = useMemo(() => {
        const groups = {};
        (displayResults || []).forEach((item) => {
            const k = item.matchType || 'Advanced Filter';
            if (!groups[k]) groups[k] = [];
            groups[k].push(item);
        });
        return groups;
    }, [displayResults]);

    const matchTypes = useMemo(() => Object.keys(matchTypeGroups), [matchTypeGroups]);

    // Active tab filters (memoized)
    const activeTabFilters = useMemo(() => {
        if (state.activeTab === 'all') {
            return state.defaultPostFilters;
        }

        if (typeof state.activeTab === 'number') {
            const historyItem = state.searchHistories.find(h => h.id === state.activeTab);
            if (!historyItem) return {};

            if (historyItem.filters) {
                try {
                    return JSON.parse(historyItem.filters) || {};
                } catch {
                    return {};
                }
            }

            return {};
        }

        return {};
    }, [state.activeTab, state.defaultPostFilters, state.searchHistories]);

    // Final results based on match type filter
    const finalResults = useMemo(() => {
        return state.activeMatchType
            ? (matchTypeGroups[state.activeMatchType] || [])
            : displayResults || [];
    }, [state.activeMatchType, matchTypeGroups, displayResults]);

    // Tabs configuration
    const tabs = useMemo(() => [
        {
            key: 'all',
            label: 'All',
            count: hasPerformedSearch() && currentResults.length === 0
                ? 0
                : state.historyResults?.length || 0,
            icon: null,
        },
    ], [hasPerformedSearch, currentResults.length, state.historyResults]);

    // No results message
    const getNoResultsMessage = useCallback(() => {
        if (hasPerformedSearch() && displayResults.length === 0 && currentResults.length === 0) {
            if (query && query.trim() !== '') {
                return __('No results found for') + ": " + query;
            }
            return __('No results found for your search');
        }
        return __('Try To Search Something To See Results');
    }, [hasPerformedSearch, displayResults.length, currentResults.length, state.activeTab, query]);




    // Setup intersection observers
    useEffect(() => {
        // Cleanup function
        return () => {
            if (observersRef.current.loader) {
                observersRef.current.loader.disconnect();
            }
            if (observersRef.current.histories) {
                observersRef.current.histories.disconnect();
            }
        };
    }, []);

    // Observer for loading more results
    useEffect(() => {
        const tabData = getCurrentTabData();

        if (!loaderRef.current || !tabData.nextPageUrl || state.isFetchingMore) {
            return;
        }

        if (observersRef.current.loader) {
            observersRef.current.loader.disconnect();
        }

        observersRef.current.loader = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !state.isFetchingMore) {
                    fetchMoreResults();
                }
            },
            { rootMargin: '200px', threshold: 0.1 }
        );

        observersRef.current.loader.observe(loaderRef.current);

        return () => {
            if (observersRef.current.loader) {
                observersRef.current.loader.disconnect();
            }
        };
    }, [state.activeTab, state.historyNextPageUrl, state.historyResultsCache, state.isFetchingMore, getCurrentTabData, fetchMoreResults]);

    // Observer for loading more histories
    useEffect(() => {
        if (!historiesEndRef.current || !state.searchHistoriesNextPageUrl) {
            return;
        }

        if (observersRef.current.histories) {
            observersRef.current.histories.disconnect();
        }

        observersRef.current.histories = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !state.isFetchingMoreHistories) {
                    fetchMoreSearchHistories();
                }
            },
            { rootMargin: '100px', threshold: 0.1 }
        );

        observersRef.current.histories.observe(historiesEndRef.current);

        return () => {
            if (observersRef.current.histories) {
                observersRef.current.histories.disconnect();
            }
        };
    }, [state.searchHistoriesNextPageUrl, state.isFetchingMoreHistories, fetchMoreSearchHistories]);

    // Scroll buttons update
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            updateScrollButtons();
            container.addEventListener('scroll', updateScrollButtons);
            window.addEventListener('resize', updateScrollButtons);

            return () => {
                container.removeEventListener('scroll', updateScrollButtons);
                window.removeEventListener('resize', updateScrollButtons);
            };
        }
    }, [state.searchHistories, updateScrollButtons]);

    // Initial setup
    useEffect(() => {
        if (!auth?.user) {
            updateState({
                activeTab: 'all',
                historyResults: results && results.length > 0 ? results : [],
                historyNextPageUrl: pagination?.next_page_url || null
            });
            return;
        }

        if (!hasPerformedSearch()) return;

        async function findMatchingHistory() {
            let matchingHistory = null;

            if (query?.trim()) {
                matchingHistory = state.searchHistories.find(
                    h => h.query?.toLowerCase().trim() === query.toLowerCase().trim()
                );
            }

            if (!matchingHistory && filters && Object.keys(filters).length > 0) {
                matchingHistory = state.searchHistories.find(h => {
                    if (h.query) return false;
                    const historyFilters = h.filters ? JSON.parse(h.filters) : {};
                    return JSON.stringify(historyFilters) === JSON.stringify(filters);
                });
            }

            if (!matchingHistory) {
                try {
                    const res = await axios.get(route('website.global-search.get-history-result'), {
                        params: { query, filters },
                        headers: { 'X-Requested-With': 'XMLHttpRequest' },
                    });

                    if (res.data.status && res.data.history) {
                        matchingHistory = res.data.history;
                        setState(prev => ({
                            ...prev,
                            historyResultsCache: {
                                ...prev.historyResultsCache,
                                [matchingHistory.id]: {
                                    results: res.data.results || [],
                                    nextPageUrl: null,
                                },
                            },
                        }));
                    }
                } catch (err) {
                    console.error(__('Fetch matching history failed'), err);
                }
            }


            // If still no matching history OR results are empty
            // Stay on "All" tab and show the search results (even if empty)
            if (!matchingHistory || (results && results.length === 0)) {
                updateState({
                    activeTab: 'all',
                    historyResults: results || [],
                    historyNextPageUrl: pagination?.next_page_url || null
                });
                return;
            }


            if (!matchingHistory) {
                matchingHistory = state.searchHistories[0];
            }

            if (!matchingHistory) return;

            setState(prev => {
                const filtered = prev.searchHistories.filter(h => h.id !== matchingHistory.id);
                return {
                    ...prev,
                    searchHistories: [matchingHistory, ...filtered],
                    activeTab: matchingHistory.id,
                    historyResultsCache: {
                        ...prev.historyResultsCache,
                        [matchingHistory.id]: {
                            results: results,
                            nextPageUrl: pagination?.next_page_url || null,
                        },
                    },
                };
            });
        }

        findMatchingHistory();
    }, []);

    // Fetch initial history results
    useEffect(() => {
        fetchHistoryResults();
    }, []);

    return (
        <MainLayout>
            <Head title={__('Search', true)} />

            <ConfirmDialog />

            {(uiState.showErrorMessage || uiState.showInfoMessage) && (
                <Toast
                    flash={{
                        ...(uiState.showErrorMessage ? { error: uiState.errorMessage } : { info: uiState.infoMessage }),
                    }}
                    onClosed={(type) => {
                        if (type === 'info') {
                            updateUiState({ infoMessage: null, showInfoMessage: false });
                        }
                        if (type === 'error') {
                            updateUiState({ errorMessage: null, showErrorMessage: false });
                        }
                    }}
                />
            )}



            <div className="min-h-screen pb-20 mt-0 lg:mt-5">

                <div className="w-full max-w-6xl px-4 mx-auto overflow-x-hidden text-black sm:px-8 dark:text-main-text-dark">

                    <GlobalSearch
                        floors={floors}
                        google_map_api_key={google_map_api_key}
                        additional_filters={true}
                        defaultQuery={query}
                        searchPage={true}
                    />


                    {/* Header with Tabs */}
                    <div className="w-full mt-6 mb-4">
                        <div className="relative grid w-full grid-cols-1 overflow-hidden">

                            <div className="relative flex items-center w-full">
                                {/* Left Arrow */}

                                <button
                                    onClick={scrollLeft}
                                    className={`absolute left-0 z-20 flex items-center justify-center flex-shrink-0 p-2 transition-all duration-200 rounded-full bg-surface-2-light hover:scale-110 dark:bg-surface-3-dark md:flex ${state.canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                    style={{ left: '0px' }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="text-gray-600 size-4 dark:text-sub-text-dark"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                                </button>


                                <div
                                    ref={scrollContainerRef}
                                    className="flex items-center w-full gap-3 overflow-x-auto flex-nowrap scrollbar-none scroll-auto"
                                    style={{
                                        transform: 'translateZ(0)',
                                        overflowAnchor: 'none',
                                        WebkitOverflowScrolling: 'touch',
                                        scrollbarWidth: 'none',
                                        msOverflowStyle: 'none',
                                        maxWidth: '100%',
                                        display: 'flex'
                                    }}
                                >
                                    {/* Main Tab */}
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.key}
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => handleTabChange(tab.key)}


                                            className={`relative flex flex-shrink-0 items-center gap-2 px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap ${state.activeTab === tab.key
                                                ? 'bg-main-text-light text-main-text-dark dark:bg-main-text-dark dark:text-main-text-light '
                                                : 'bg-surface-1-light text-main-text-light dark:bg-surface-1-dark dark:text-main-text-dark'
                                                }`}
                                        >
                                            <div className="flex items-center gap-1">
                                                {tab.icon}
                                                <span>{__(tab.label)}</span>
                                                <span
                                                    className="inline-flex justify-center text-xs"
                                                    style={{ minWidth: 32 }}
                                                >
                                                    ({tab.count})
                                                </span>
                                            </div>
                                        </button>
                                    ))}

                                    {/* Search History Tabs */}
                                    {state.searchHistories.map((history) => (
                                        <button
                                            key={history.id}
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => handleTabChange(history.id)}
                                            className={`relative flex flex-shrink-0 items-center gap-2 px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap ${state.activeTab === history.id
                                                ? 'bg-main-text-light text-main-text-dark dark:bg-main-text-dark dark:text-main-text-light '
                                                : 'bg-surface-1-light text-main-text-light dark:bg-surface-1-dark dark:text-main-text-dark'
                                                }`}
                                        >
                                            <span className="max-w-[120px] truncate">{history.query || 'Filter'}</span>
                                            <span className={`text-xs ${state.activeTab === history.id ? 'text-main-text-dark dark:text-main-text-light font-semibold' : 'text-main-text-light dark:text-main-text-dark'}`}>({state.historyResultsCache[history.id]?.results.length || history.results_count})</span>
                                            <div
                                                onClick={(e) => { e.stopPropagation(); deleteSearchHistory(history.id); }}
                                                className={`flex-shrink-0 p-0.5 hover:bg-main-text-light/10  dark:hover:bg-main-text-dark/10 rounded-full`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                                            </div>
                                        </button>
                                    ))}

                                    {/* Infinity Scroll Triggers */}
                                    {state.searchHistoriesNextPageUrl && <div ref={historiesEndRef} className="flex-shrink-0 w-4 h-4" />}
                                </div>

                                {/* Right Arrow */}

                                <button
                                    onClick={scrollRight}
                                    className={`absolute right-0 z-20 flex items-center justify-center flex-shrink-0 p-2 transition-all duration-200 rounded-full bg-surface-2-light hover:scale-110 dark:bg-surface-3-dark md:flex ${state.canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="text-black size-4 dark:text-sub-text-dark"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>


                    {/* Match Types Row */}
                    {matchTypes.length > 0 && (
                        <div className="flex flex-col min-w-0 gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                            {/* Active Filters Display */}
                            <div className='flex items-center gap-3'>
                                {state.activeTab !== 'all' && (() => {
                                    const { address, radius, from_floor_id, to_floor_id, date_range } =
                                        activeTabFilters || {};

                                    const hasAddress = address?.lat && address?.lng;
                                    const hasRadius = radius && radius > 0;
                                    const hasFloors = from_floor_id || to_floor_id;
                                    const hasDateRange = Array.isArray(date_range) && date_range.length === 2;

                                    if (!hasAddress && !hasRadius && !hasFloors && !hasDateRange) return null;

                                    return (
                                        <div
                                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full bg-surface-1-light text-sub-text-light dark:bg-surface-1-dark dark:text-sub-text-dark"
                                            role="status"
                                            aria-label="Active filters"
                                        >
                                            <div className="flex flex-wrap items-center gap-2">
                                                {hasAddress && (
                                                    <span className="text-main-text-light dark:text-main-text-dark">
                                                        <span>
                                                            Address:
                                                        </span>{' '}
                                                        {address.name ||
                                                            `(${address.lat.toFixed(4)}, ${address.lng.toFixed(4)})`}
                                                    </span>
                                                )}

                                                {hasFloors && (
                                                    <span className="text-main-text-light dark:text-main-text-dark">
                                                        • {from_floor_id || '?'}~{to_floor_id || '?'}f
                                                    </span>
                                                )}

                                                {hasRadius && (
                                                    <span className="text-main-text-light dark:text-main-text-dark">
                                                        • 0~{(radius / 1000).toFixed(1)}km
                                                    </span>
                                                )}

                                                {hasDateRange && (
                                                    <span className="text-main-text-light dark:text-main-text-dark">
                                                        •{' '}
                                                        {new Date(date_range[0]).toLocaleDateString(undefined, {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: '2-digit',
                                                        })}{' '}
                                                        ~{' '}
                                                        {new Date(date_range[1]).toLocaleDateString(undefined, {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: '2-digit',
                                                        })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {matchTypes.map((mt) => (
                                    <div
                                        key={mt}
                                        onClick={() =>
                                            updateState({
                                                activeMatchType: state.activeMatchType === mt ? null : mt,
                                            })
                                        }
                                        className={`text-xs  py-1 transition-colors cursor-pointer text-main-text-light dark:text-main-text-dark`}
                                        aria-pressed={state.activeMatchType === mt}
                                    >
                                        <div className="flex items-center">
                                            <span className={`${state.activeMatchType === mt ? 'font-semibold' : ''} text-sm`}>
                                                {mt.replace(/_/g, ' ')} ({matchTypeGroups[mt].length})
                                            </span>


                                            {state.activeMatchType === mt && (
                                                <button
                                                    onClick={() => updateState({ activeMatchType: null })}
                                                    className="mx-2 text-sm transition-colors text-main-text-light dark:text-main-text-dark"
                                                    aria-label="Clear match type filter"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2.5}
                                                        stroke="currentColor"
                                                        className="w-3.5 h-3.5"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>

                                    </div>
                                ))}


                            </div>

                            <div className="flex items-center gap-1">
                                {/* List View Icon */}
                                <button
                                    onClick={() => setActiveView('list')}
                                    className={`
              p-1 rounded-lg transition-all duration-200
              ${activeView === 'list'
                                            ? 'bg-surface-2-light dark:bg-surface-2-dark'
                                            : 'hover:bg-surface-2-light dark:hover:bg-surface-2-dark'
                                        }
            `}
                                    aria-label="List view"
                                    title={__("List view")}
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
                                    className={`
              p-1 rounded-lg transition-all duration-200
              ${activeView === 'grid'
                                            ? 'bg-surface-2-light dark:bg-surface-2-dark'
                                            : 'hover:bg-surface-2-light dark:hover:bg-surface-2-dark'
                                        }
            `}
                                    aria-label="Grid view"
                                    title={__("Grid view")}
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
                    )}

                    {/* Results List - Apply content-visibility here if list is long */}
                    <div
                        role="feed"
                        aria-busy={state.searchHistoryLoading && typeof state.activeTab === 'number'}

                        className={activeView === 'grid' ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 lg:grid-cols-4 gap-2 mt-5' : 'flex flex-col'}
                    >
                        {state.searchHistoryLoading && typeof state.activeTab === 'number' ? (
                            <div className="flex items-center justify-center py-16" role="status" aria-live="polite">
                                <Spinner />
                                <span className="sr-only">{__('Loading results')}...</span>
                            </div>
                        ) : (
                            finalResults.map((item) => (
                                <ResultItem
                                    key={`${item.type}-${item.id}`}
                                    item={item}
                                    onCopyLink={handleCopyLink}
                                    generateURL={generateURL}
                                    generateSmartphoneURL={generateSmartphoneURL}
                                    activeView={activeView}
                                    __={__}
                                    currency={currency}
                                />
                            ))
                        )}
                    </div>


                    {/* Loading More Indicator */}
                    {displayResults.length > 0 && nextPageUrl && (
                        <div
                            ref={loaderRef}
                            className="flex items-center justify-center gap-2 py-10 text-sub-text-light dark:text-sub-text-dark"
                            role="status"
                            aria-live="polite"
                        >
                            <div className="flex items-center justify-center">
                                <Spinner />
                            </div>
                            <span>{__('Loading more')}...</span>
                        </div>
                    )}

                    {/* No Results */}
                    {displayResults.length === 0 &&
                        !state.searchHistoryLoading &&
                        !(state.searchHistoryLoading && typeof state.activeTab === 'number') && (
                            <div className="py-16 text-center" role="status">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-16 h-16 mx-auto text-main-text-light dark:text-main-text-dark"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                    />
                                </svg>
                                <p className="mt-4 text-lg font-medium break-words break-all whitespace-normal line-clamp-2 text-main-text-light dark:text-main-text-dark">
                                    {getNoResultsMessage()}
                                </p>

                                {hasPerformedSearch() &&
                                    currentResults.length === 0 &&
                                    state.activeTab === 'all' && (
                                        <p className="mt-2 text-sm text-sub-text-light dark:text-sub-text-dark">
                                            {__("Try adjusting your search terms or filters")}
                                        </p>
                                    )}
                            </div>
                        )}
                </div>
            </div>


            {
                uiState.linkCopied && (
                    <LinkCopiedModal
                        linkCopied={uiState.linkCopied}
                        setLinkCopied={(value) => updateUiState({ linkCopied: value })}
                    />
                )
            }
        </MainLayout >
    );
};

export default Index;
