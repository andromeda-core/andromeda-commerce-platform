import React, { useEffect, useMemo, useRef, useState, useCallback, memo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/Website/MainLayout';
import GlobalSearch from '@/Components/GlobalSearch';
import Toast from '@/Components/Toast';
import LinkCopiedModal from '@/Components/LinkCopiedModal';
import Placeholder from 'asset/assets/images/product/placeholder.jpg';
import { useConfirm } from '@/Hooks/useConfirm';
import useWindowSize from '@/Hooks/useWindowSize';

// Memoized result item component
const ResultItem = memo(({ item, onCopyLink, generateURL }) => {
    const { width } = useWindowSize();
    return (
        <a
            href={
                item.type === 'posts'
                    ? route('home') + generateURL(item)
                    : route('home') + '?m-slug=' + item.slug
            }
            target={width > 1024 ? '_blank' : undefined}
            onClick={() =>
                window.history.replaceState({}, '', route('home')
                )}
            className="flex items-center gap-4 px-6 py-4 transition-colors cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-800/80"
        >
            {/* Thumbnail */}
            <div className="flex-shrink-0 w-12 h-12 overflow-hidden bg-gray-200 rounded-lg dark:bg-gray-700">
                {item.image ? (
                    <img
                        src={item.image}
                        alt={item.title || item.name}
                        className="object-cover w-full h-full"
                        onError={(e) => e.target.src = Placeholder}
                    />
                ) : !item?.image && item?.video_thumbnail && item?.type === 'posts' ? (
                    <img
                        src={item?.video_thumbnail}
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
                <h3 className="font-medium truncate">{item.title || item.name}</h3>
                <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                    {item.type === 'posts' ? item.location_name || '' : item.capacity || ''}
                </p>
                {item.tag && (
                    <p className="text-xs text-gray-500 truncate dark:text-gray-400">{item.tag}</p>
                )}
                <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                    {item.created_at}
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 transition-opacity duration-200 opacity-0 group-hover:opacity-100">
                <button
                    title="Copy Link"
                    className="p-2 text-gray-500 rounded-full hover:bg-gray-200 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
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
        </a>
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
    const { auth } = usePage().props;

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

    const generateURL = useCallback((post) => {
        return (
            `?slug=${encodeURIComponent(post?.slug)}&planet=earth${post?.latitude != null ? '&lat=' + encodeURIComponent(post?.latitude) : ''
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
            const newCanScrollRight = scrollLeft < scrollWidth - clientWidth - 10;

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
            console.error('Error fetching more search histories:', err);
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
            console.error('Error fetching history results:', err);
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
                errorMessage: err.message || 'Failed to fetch search results',
                showErrorMessage: true
            });
            updateState({ searchHistoryLoading: false });
        }
    }, [state.historyResultsCache]);

    // Handle tab change
    const handleTabChange = useCallback((tabKey) => {
        updateState({ activeTab: tabKey, activeMatchType: null });

        if (tabKey === 'all') {
            if (state.historyResults.length === 0 && !hasPerformedSearch()) {
                fetchHistoryResults();
            }
        } else if (typeof tabKey === 'number') {
            fetchSearchHistoryResults(tabKey);
        }
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
                errorMessage: 'Error fetching more results: ' + err.message
            });
            updateState({ isFetchingMore: false });
        }
    }, [state.activeTab, state.historyNextPageUrl, state.historyResultsCache, state.isFetchingMore]);

    // Delete search history
    const { confirm, ConfirmDialog } = useConfirm();
    const deleteSearchHistory = useCallback(async (id) => {


        try {
            const result = await confirm({
                title: 'Are You Sure You Want To Delete Your Search History?',
                text: "You Won't Be Able To Revert This!",
                icon: 'danger',
                showCancelButton: true,
                confirmButtonText: 'Yes, Delete it!',
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                updateState({ searchHistoryLoading: true });
                const res = await axios.delete(
                    route('website.global-search.search-history-destroy', { id })
                );

                if (res.data.status) {
                    setState(prev => {
                        const updatedHistories = prev.searchHistories.filter(h => h.id !== id);
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
                errorMessage: e.message || 'Something went wrong',
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
                return `No results found for "${query}"`;
            }
            return 'No results found for your search';
        }
        return 'Try To Search Something To See Results';
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
                    console.error('Fetch matching history failed', err);
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
            <Head title="Search" />

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

            <GlobalSearch
                floors={floors}
                google_map_api_key={google_map_api_key}
                additional_filters={true}
                defaultQuery={query}
                searchPage={true}
            />

            <div className="pb-20 sm:px-6 sm:pb-20 lg:px-8">
                <div className="px-3 text-gray-900 border border-gray-200 bg-gray-50 rounded-xl dark:bg-deepcharcoal dark:border-gray-700 dark:text-gray-100 sm:px-6 lg:px-8">
                    {/* Header with Tabs */}
                    <div className="px-0 py-4 border-b border-gray-200 dark:border-slate-700">
                        <div className="relative flex items-center gap-2">
                            {/* Left Arrow - Only needs will-change on hover/interaction */}
                            {state.canScrollLeft && (
                                <button
                                    onClick={scrollLeft}
                                    className="absolute left-0 z-10 flex items-center justify-center w-8 h-8 transition-colors bg-white border border-gray-200 rounded-full shadow-md dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    aria-label="Scroll left"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-5 h-5 text-gray-600 dark:text-gray-300"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15.75 19.5L8.25 12l7.5-7.5"
                                        />
                                    </svg>
                                </button>
                            )}

                            {/* Scrollable Container - GPU acceleration for smooth scrolling */}
                            <div
                                ref={scrollContainerRef}
                                className="flex items-center flex-1 gap-3 px-1 overflow-x-auto scrollbar-none"
                                style={{
                                    transform: 'translateZ(0)',
                                    WebkitOverflowScrolling: 'touch'
                                }}
                            >

                                {tabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => handleTabChange(tab.key)}
                                        className={`relative pb-2 text-sm transition-all duration-300 ease-in-out whitespace-nowrap ${state.activeTab === tab.key
                                            ? 'scale-105 text-indigo-600 dark:text-indigo-400'
                                            : 'text-gray-600 hover:scale-105 hover:text-gray-700 dark:text-gray-300'
                                            }`}
                                        aria-current={state.activeTab === tab.key ? 'page' : undefined}
                                    >
                                        <div className="flex items-center gap-1">
                                            {tab.icon}
                                            <span>{tab.label}</span>
                                            <span
                                                className={`text-xs ${state.activeTab === tab.key
                                                    ? 'text-indigo-600 dark:text-indigo-400'
                                                    : 'text-gray-600 dark:text-white/80'
                                                    }`}
                                                aria-label={`${tab.count} results`}
                                            >
                                                ({tab.count})
                                            </span>
                                        </div>
                                        <span
                                            className={`absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-indigo-500 transition-all duration-300 ease-in-out ${state.activeTab === tab.key
                                                ? 'scale-x-100 opacity-100'
                                                : 'scale-x-0 opacity-0'
                                                }`}
                                            aria-hidden="true"
                                        ></span>
                                    </button>
                                ))}

                                {/* Divider */}
                                {state.searchHistories.length > 0 && tabs.length > 0 && (
                                    <div
                                        className="h-6 border-l border-gray-300 dark:border-slate-600"
                                        role="separator"
                                        aria-hidden="true"
                                    ></div>
                                )}

                                {/* Search History Tabs */}
                                {state.searchHistoryLoading && state.activeTab === 'all' ? (
                                    <div className="flex items-center justify-center px-4 py-2" role="status" aria-live="polite">
                                        <div className="w-4 h-4 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent"></div>
                                        <span className="sr-only">Loading history tabs...</span>
                                    </div>
                                ) : (
                                    <>
                                        {state.searchHistories.map((history) => {
                                            const dynamicCount = state.historyResultsCache[history.id]?.results.length || history.results_count;

                                            return (
                                                <div key={history.id} className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleTabChange(history.id)}
                                                        className={`relative pb-2 text-xs transition-all duration-300 ease-in-out whitespace-nowrap ${state.activeTab === history.id
                                                            ? 'scale-105 text-indigo-600 dark:text-indigo-400'
                                                            : 'text-gray-600 hover:scale-105 hover:text-gray-700 dark:text-gray-300'
                                                            }`}
                                                        aria-current={state.activeTab === history.id ? 'page' : undefined}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            <span className="max-w-[120px] truncate">
                                                                {history.query || 'Advanced Filter'}
                                                            </span>
                                                            <span
                                                                className={`text-xs ${state.activeTab === history.id
                                                                    ? 'text-indigo-600 dark:text-indigo-400'
                                                                    : 'text-gray-600 dark:text-white/80'
                                                                    }`}
                                                                aria-label={`${dynamicCount} results`}
                                                            >
                                                                ({dynamicCount})
                                                            </span>
                                                        </div>
                                                        <span
                                                            className={`absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-indigo-500 transition-all duration-300 ease-in-out ${state.activeTab === history.id
                                                                ? 'scale-x-100 opacity-100'
                                                                : 'scale-x-0 opacity-0'
                                                                }`}
                                                            aria-hidden="true"
                                                        ></span>
                                                    </button>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteSearchHistory(history.id);
                                                        }}
                                                        className="p-1 text-gray-400 transition-colors rounded-lg hover:bg-gray-200 hover:text-red-500 dark:hover:bg-gray-800 dark:hover:text-red-400"
                                                        title="Delete search history"
                                                        aria-label={`Delete ${history.query || 'advanced filter'} search history`}
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="w-3 h-3"
                                                            aria-hidden="true"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            );
                                        })}

                                        {/* Loader for more histories */}
                                        {state.isFetchingMoreHistories && (
                                            <div className="flex items-center justify-center px-4 py-2" role="status" aria-live="polite">
                                                <div className="w-4 h-4 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent"></div>
                                                <span className="sr-only">Loading more histories...</span>
                                            </div>
                                        )}

                                        {/* Invisible element to trigger infinite scroll */}
                                        {state.searchHistoriesNextPageUrl && (
                                            <div
                                                ref={historiesEndRef}
                                                className="w-px h-px"
                                                aria-hidden="true"
                                            ></div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Right Arrow */}
                            {state.canScrollRight && (
                                <button
                                    onClick={scrollRight}
                                    className="absolute right-0 z-10 flex items-center justify-center w-8 h-8 transition-colors bg-white border border-gray-200 rounded-full shadow-md dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    aria-label="Scroll right"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-5 h-5 text-gray-600 dark:text-gray-300"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Match Types Row */}
                    {matchTypes.length > 0 && (
                        <div className="flex items-center gap-3 px-0 py-2 border-b border-gray-200 dark:border-slate-700">
                            {/* Active Filters Display */}
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
                                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700"
                                        role="status"
                                        aria-label="Active filters"
                                    >
                                        <div className="flex flex-wrap items-center gap-2">
                                            {hasAddress && (
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    <span className="font-medium text-indigo-600 dark:text-indigo-400">
                                                        Address:
                                                    </span>{' '}
                                                    {address.name ||
                                                        `(${address.lat.toFixed(4)}, ${address.lng.toFixed(4)})`}
                                                </span>
                                            )}

                                            {hasFloors && (
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    • {from_floor_id || '?'}~{to_floor_id || '?'}f
                                                </span>
                                            )}

                                            {hasRadius && (
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    • 0~{(radius / 1000).toFixed(1)}km
                                                </span>
                                            )}

                                            {hasDateRange && (
                                                <span className="text-gray-700 dark:text-gray-300">
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
                                <button
                                    key={mt}
                                    onClick={() =>
                                        updateState({
                                            activeMatchType: state.activeMatchType === mt ? null : mt,
                                        })
                                    }
                                    className={`text-xs px-3 py-1 rounded-full transition-colors ${state.activeMatchType === mt
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-white/80'
                                        }`}
                                    aria-pressed={state.activeMatchType === mt}
                                >
                                    {mt} ({matchTypeGroups[mt].length})
                                </button>
                            ))}

                            {state.activeMatchType && (
                                <button
                                    onClick={() => updateState({ activeMatchType: null })}
                                    className="px-3 py-1 ml-3 text-xs text-white transition-colors bg-red-500 rounded-full"
                                    aria-label="Clear match type filter"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    )}

                    {/* Results List - Apply content-visibility here if list is long */}
                    <div
                        className="divide-y divide-gray-200 dark:divide-slate-700"
                        role="feed"
                        aria-busy={state.searchHistoryLoading && typeof state.activeTab === 'number'}
                    >
                        {state.searchHistoryLoading && typeof state.activeTab === 'number' ? (
                            <div className="flex items-center justify-center py-16" role="status" aria-live="polite">
                                <div className="w-8 h-8 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent"></div>
                                <span className="sr-only">Loading results...</span>
                            </div>
                        ) : (
                            finalResults.map((item) => (
                                <ResultItem
                                    key={`${item.type}-${item.id}`}
                                    item={item}
                                    onCopyLink={handleCopyLink}
                                    generateURL={generateURL}
                                />
                            ))
                        )}
                    </div>

                    {/* Loading More Indicator */}
                    {displayResults.length > 0 && nextPageUrl && (
                        <div
                            ref={loaderRef}
                            className="flex items-center justify-center gap-2 py-10 text-gray-700 dark:text-white/80"
                            role="status"
                            aria-live="polite"
                        >
                            <div className="flex items-center justify-center">
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
                            </div>
                            <span>Loading more...</span>
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
                                    className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                    />
                                </svg>
                                <p className="mt-4 text-lg font-medium text-gray-500 dark:text-gray-400">
                                    {getNoResultsMessage()}
                                </p>
                                {hasPerformedSearch() &&
                                    currentResults.length === 0 &&
                                    state.activeTab === 'all' && (
                                        <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                                            Try adjusting your search terms or filters
                                        </p>
                                    )}
                            </div>
                        )}
                </div>
            </div>

            {uiState.linkCopied && (
                <LinkCopiedModal
                    linkCopied={uiState.linkCopied}
                    setLinkCopied={(value) => updateUiState({ linkCopied: value })}
                />
            )}
        </MainLayout>
    );
};

export default Index;
