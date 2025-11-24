import React, { useEffect, useRef, useState } from 'react';
import SelectInput from '@/Components/SelectInput';
import useWindowSize from '@/Hooks/useWindowSize';
import axios from 'axios';
import { createPortal } from 'react-dom';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import RadiusMap from './RadiusMap';
import { router } from '@inertiajs/react';
import getCookie from '@/Hooks/useGetCookie';
import Toast from './Toast';


const GlobalSearch = ({
    floors,
    google_map_api_key,
    additional_filters,
    defaultQuery = '',
    defaultPostFilters = {},
    defaultFiltersCleared = false,
}) => {
    const windowSize = useWindowSize();
    const [searchApplying, setSearchApplying] = useState(false);

    const [ErrorMessage, setErrorMessage] = useState(null);
    const [showErrorMessage, setShowErrorMessage] = useState(false);

    const [InfoMessage, setInfoMessage] = useState(null);
    const [showInfoMessage, setShowInfoMessage] = useState(false);


    const isSearchApplyingRef = useRef(false);

    const [isSpatiotemporalFilters, setIsSpatiotemporalFilters] = useState(false);

    // Results Page Category visibility
    const [showPosts, setShowPosts] = useState(true);
    const [showProducts, setShowProducts] = useState(true);

    const [postPreferences, setPostPreferences] = useState({
        text: true,
        videos: true,
        images: true,
        show_posts: showPosts,
        show_products: showProducts,
    });

    const [isPrefChanged, setIsPrefChanged] = useState(false);
    useEffect(() => {
        const cookieValue = getCookie('post_preferences');

        if (cookieValue && cookieValue !== 'null' && cookieValue !== 'undefined') {
            try {
                const decoded = decodeURIComponent(cookieValue);
                const parsed = JSON.parse(decoded);

                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                    setPostPreferences(parsed);
                } else {
                    console.warn('⚠️ post_preferences cookie had invalid structure, ignoring.');
                }
            } catch (error) {
                console.warn('⚠️ Failed to parse post_preferences cookie, resetting it.', error);
            }
        }

        const url = new URL(window.location.href);

        const param = url.searchParams.get('modal');

        if (param) {
            if (param === 'spatiotemporal-filters') {
                setIsSpatiotemporalFilters(true);
            }
        }
    }, []);

    const [searchQuery, setSearchQuery] = useState(defaultQuery || '');

    // Google Auto Completion States
    const [autoCompletionLoading, setAutoCompletionLoading] = useState(false);
    const [autoCompletionLocationSearch, setAutoCompletionLocationSearch] = useState('');
    const [autoCompletionResults, setAutoCompletionResults] = useState([]);
    const [autoCompletionDropdown, setAutoCompletionDropdown] = useState(false);
    const [palceDetailFetching, setPalceDetailFetching] = useState(false);
    const [placeId, setPlaceId] = useState('');

    const [addressReady, setAddressReady] = useState(false);

    // Filter State
    const [postFilters, setPostFilters] = useState({
        from_floor_id: defaultPostFilters.from_floor_id || '',
        to_floor_id: defaultPostFilters.to_floor_id || '',
        date_range: defaultPostFilters.date_range || '',
        address: {
            lat: defaultPostFilters.address?.lat || '',
            lng: defaultPostFilters.address?.lng || '',
        },
        radius: defaultPostFilters.radius ?? 1000,
    });

    const [isRadiusModal, setIsRadiusModal] = useState(false);
    // Flatpicker
    const flatpickrInstance = useRef(null);
    const rangeRef = useRef(null);

    useEffect(() => {
        if (!addressReady || !rangeRef.current) return;

        if (flatpickrInstance.current) {
            flatpickrInstance.current.destroy();
            flatpickrInstance.current = null;
        }

        flatpickrInstance.current = flatpickr(rangeRef.current, {
            mode: 'range',
            enableTime: true,
            time_24hr: false,
            altInput: true,
            dateFormat: 'Y-m-d h:i K',
            altFormat: 'F j, Y h:i K',

            onReady(selectedDates, dateStr, instance) {
                // Create Save / Apply button if not already added
                if (!instance.calendarContainer.querySelector('.flatpickr-save-btn')) {
                    const btn = document.createElement('button');
                    btn.textContent = 'Save Range';
                    btn.type = 'button';
                    btn.className =
                        'px-3 py-1 mt-4 mb-2 ml-auto mr-2 text-sm font-medium text-white transition bg-indigo-600 rounded flatpickr-save-btn hover:bg-indigo-500';

                    btn.addEventListener('click', () => {
                        const selectedDates = instance.selectedDates;
                        if (selectedDates.length === 2) {
                            const formattedDates = selectedDates.map((date) =>
                                flatpickr.formatDate(date, 'Y-m-d h:i K'),
                            );
                            setPostFilters((prev) => ({
                                ...prev,
                                date_range: formattedDates,
                            }));
                            setIsPrefChanged(true);
                            instance.close();
                        } else {
                            setInfoMessage('Please select both start and end dates.');
                            setShowInfoMessage(true);
                        }
                    });

                    // Add it to calendar footer
                    instance.calendarContainer.appendChild(btn);
                }
            },

            onChange(selectedDates, dateStr, instance) {
                if (selectedDates.length === 2) {
                    const formattedDates = selectedDates.map((date) =>
                        flatpickr.formatDate(date, 'Y-m-d h:i K'),
                    );
                    setPostFilters((prev) => ({
                        ...prev,
                        date_range: formattedDates,
                    }));
                    setIsPrefChanged(true);
                }
            },

            onClose(selectedDates, dateStr, instance) {
                if (selectedDates.length !== 2 && selectedDates.length !== 0) {
                    setInfoMessage('Please select both start and end dates.');
                    setShowInfoMessage(true);
                    setPostFilters((prev) => ({
                        ...prev,
                        date_range: '',
                    }));

                    setTimeout(() => {
                        instance.clear();
                    }, 10);
                }
            },
        });

        return () => {
            flatpickrInstance.current.destroy();
            flatpickrInstance.current = null;
            setPostFilters((prev) => ({
                ...prev,
                date_range: '',
            }));
        };
    }, [addressReady, isSpatiotemporalFilters]);

    // Fetch AutocompletionLocationsFrom Google
    const autoCompletions = () => {
        try {
            if (autoCompletionLocationSearch != '') {
                setAutoCompletionLoading(true);
                setAutoCompletionDropdown(true);
                axios
                    .post(route('website.global-search.auto-completion'), {
                        search: autoCompletionLocationSearch, // send in request body
                    })
                    .then((res) => {
                        const predictions = res.data.data.predictions || [];

                        setAutoCompletionResults(predictions);
                        setAutoCompletionLoading(false);
                        if (predictions.length < 1) {
                            setInfoMessage('No Results Found');
                            setShowInfoMessage(true);
                        }
                    });
            }
        } catch (e) {
            setAutoCompletionLoading(false);
            setErrorMessage(e.message || 'Something went wrong');
            setShowErrorMessage(true);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            setAutoCompletionDropdown(false);
            setAutoCompletionLoading(false);
            setAutoCompletionResults([]);

            if (placeId != '') {
                setPlaceId('');
            }

            if (autoCompletionLocationSearch != '' && autoCompletionLocationSearch?.length < 3) {
                setInfoMessage('Please Enter More Details To Search');
                setShowInfoMessage(true);
            }
            if (autoCompletionLocationSearch?.length > 2 && placeId == '') {
                setAutoCompletionLoading(false);
                setAutoCompletionDropdown(false);
                setAutoCompletionResults([]);

                autoCompletions();
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [autoCompletionLocationSearch]);

    const getPlaceDetails = () => {
        axios
            .post(route('website.global-search.get-place-details'), {
                place_id: placeId,
            })
            .then((res) => {
                const response = res.data;

                if (response.status && response.data?.lat && response.data?.lng) {
                    setPostFilters((prev) => ({
                        ...prev,
                        address: {
                            lat: response.data.lat,
                            lng: response.data.lng,
                        },
                    }));
                    setAddressReady(true);
                } else {
                    setAddressReady(false);
                }
            })
            .catch((e) => {
                setErrorMessage(e.message || 'Something went wrong');
                setShowErrorMessage(true);
                setAddressReady(false);
            })
            .finally(() => {
                setPalceDetailFetching(false);
            });
    };

    useEffect(() => {
        if (placeId != '') {
            setPalceDetailFetching(true);
            getPlaceDetails();
        }
    }, [placeId]);


    // const clearSession = async () => {
    //     try {
    //         await axios.delete(route('website.global-search.search-session-destroy'));
    //     } catch (e) { }
    // };



    const searchQueryRef = useRef('');
    const searchInputRef = useRef('');
    const modalSearchInputRef = useRef('');
    useEffect(() => {
        searchQueryRef.current = searchQuery;
    }, [searchQuery]);


    const ApplyFilter = (type, search_history = []) => {
        document.cookie = `post_preferences=${JSON.stringify(postPreferences)};path=/;max-age=31536000;SameSite=Lax;`;

        // const isAnyAdditionalFilterApplied = Object.values(postFilters).some((value) => {
        //     if (value === '' || value === null || value === undefined) return false;

        //     if (Array.isArray(value)) {
        //         return value.length > 0;
        //     }

        //     if (typeof value === 'object') {
        //         const innerValues = Object.values(value);
        //         const hasNonEmpty = innerValues.some(
        //             (v) => v !== '' && v !== null && v !== undefined,
        //         );
        //         return hasNonEmpty;
        //     }

        //     return true;
        // });

        if (type == 'search_history') {
            if (postFilters.from_floor_id != '' && postFilters.to_floor_id == '') {
                setInfoMessage('Please Select (To Floor)');
                setShowInfoMessage(true);
                return;
            } else if (postFilters.to_floor_id != '' && postFilters.from_floor_id == '') {
                setInfoMessage('Please Select (From Floor)');
                setShowInfoMessage(true);
                return;
            }
            setSearchApplying(true);
            isSearchApplyingRef.current = true;

            router.post(
                route('website.global-search.index'),
                {
                    filters: search_history.filters ?? postFilters,
                    post_preferences: postPreferences,
                    query: search_history.query,
                    search: true,
                },
                {
                    preserveState: false,
                    preserveScroll: false,
                }
            );

            setIsPrefChanged(false);
            isSearchApplyingRef.current = false;

            return;
        }

        if (type !== 'filter') {

            if (postFilters.from_floor_id != '' && postFilters.to_floor_id == '') {
                setInfoMessage('Please Select (To Floor)');
                setShowInfoMessage(true);
                return;
            } else if (postFilters.to_floor_id != '' && postFilters.from_floor_id == '') {
                setInfoMessage('Please Select (From Floor)');
                setShowInfoMessage(true);
                return;
            }
            setSearchApplying(true);
            isSearchApplyingRef.current = true;

            router.post(
                route('website.global-search.index'),
                {
                    filters: postFilters,
                    post_preferences: postPreferences,
                    query: searchQueryRef.current,
                    search: true,
                },
                {
                    preserveState: false,
                    preserveScroll: false,
                }
            );


            setIsPrefChanged(false);
            isSearchApplyingRef.current = false;
        }
    };




    useEffect(() => {
        setPostFilters((prev) => ({
            ...prev,
            from_floor_id: defaultPostFilters.from_floor_id || '',
            to_floor_id: defaultPostFilters.to_floor_id || '',
            date_range: defaultPostFilters.date_range || '',

            radius: addressReady ? 1000 : defaultPostFilters.radius || '',
        }));
    }, [addressReady]);

    // Checking Post Filter Removed And Resetting  Default post To Local React PostFilter State
    useEffect(() => {
        if (defaultFiltersCleared) {
            setPostFilters(defaultPostFilters);
        }
    }, [defaultFiltersCleared]);

    // Checking If Post Filter Resets From Default post Filter After Removing Filters So Apply Filter For Reflecting chnages
    useEffect(() => {
        if (defaultFiltersCleared) {
            ApplyFilter();
        }
    }, [postFilters]);

    // Enter Event For Search If pref Changes

    useEffect(() => {
        const handleKeyDown = (e) => {
            const active = document.activeElement;

            const isInInputMain = active === searchInputRef.current;
            const isInInputModal = active === modalSearchInputRef.current;

            if (e.key === 'Enter' && (isInInputMain || isInInputModal)) {
                e.preventDefault();

                setTimeout(() => {
                    const currentQuery = searchQueryRef.current.trim();

                    if (!isPrefChanged) {
                        if (currentQuery !== '') {
                            setInfoMessage('To Apply Search Please Search Anything Else');
                            setShowInfoMessage(true);
                            return;
                        }

                        setInfoMessage('Please search something first');
                        setShowInfoMessage(true);
                        return;
                    }
                    ApplyFilter('query');
                }, 0);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPrefChanged]);

    // Post Filters State Checking And Appending Query If Modal Opens Of Post Filter
    useEffect(() => {
        const url = new URL(window.location.href);
        if (isSpatiotemporalFilters) {
            window.history.pushState({}, '', window.location.pathname);
            url.searchParams.set('modal', 'spatiotemporal-filters');
        } else {
            url.searchParams.delete('modal');
        }

        window.history.replaceState({}, '', url);
    }, [isSpatiotemporalFilters]);

    // Handle browser/mobile back button to close modals
    useEffect(() => {
        const handlePopState = (e) => {
            if (isSpatiotemporalFilters) {
                setIsSpatiotemporalFilters(false);
                return;
            }
        };

        const preventInertiaNavigation = (event) => {
            if (isSpatiotemporalFilters && !isSearchApplyingRef.current) {

                event.preventDefault();
            }
        };
        window.addEventListener('popstate', handlePopState);
        const removeRouterEvent = router.on('before', preventInertiaNavigation);

        // Cleanup
        return () => {
            window.removeEventListener('popstate', handlePopState);
            if (removeRouterEvent) removeRouterEvent();
        };
    }, [isSpatiotemporalFilters]);

    // Delete Search History and fetching new onces
    // const deleteSearchHistory = (id) => {
    //     setSearchHistoryLoading(true);
    //     axios
    //         .delete(route('website.global-search.search-history-destroy', { id: id }))
    //         .then((res) => {
    //             if (res.data.status) {
    //                 setSearchHistory(res.data.data);
    //             } else {
    //                 setErrorMessage(res.data.message);
    //                 setShowErrorMessage(true);
    //             }
    //         })
    //         .catch((e) => {
    //             setErrorMessage(e.message || 'Something went wrong');
    //             setShowErrorMessage(true);
    //         })
    //         .finally(() => {
    //             setSearchHistoryLoading(false);
    //         });
    // };


    return (
        <>
            {(showErrorMessage || showInfoMessage) && (
                <Toast
                    flash={{
                        ...(showErrorMessage ? { error: ErrorMessage } : { info: InfoMessage }),
                    }}

                    onClosed={(type) => {
                        if (type === 'error') {
                            setShowErrorMessage(false);
                            setErrorMessage(null);
                        }
                        if (type === 'info') {
                            setShowInfoMessage(false);
                            setInfoMessage(null);
                        }
                    }}
                />
            )}

            <div className="lg:max-w-8xl sticky top-0 z-[50] mx-auto w-full backdrop-blur-md transition-all duration-300 sm:px-6 lg:px-8">
                <div className="py-2 mx-auto sm:py-3">
                    <div className="relative flex w-full items-center rounded-xl border border-gray-300 bg-white/90 p-1.5 dark:border-gray-700 dark:bg-deepcharcoal sm:p-2">
                        <div className="relative w-full">
                            <div className="relative flex items-center w-full rounded-xl">
                                {searchQuery !== '' && (
                                    <svg
                                        onClick={() => {
                                            setSearchQuery('');
                                            setIsPrefChanged(true);
                                            searchInputRef.current?.focus();
                                        }}
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="absolute cursor-pointer right-3 size-4 hover:text-black/80 dark:text-white/80 hover:dark:text-white/50"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 18 18 6M6 6l12 12"
                                        />
                                    </svg>
                                )}

                                {/* Magnifire Icon */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="absolute cursor-pointer left-3 size-5 dark:text-white/80"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                    />
                                </svg>

                                <input
                                    ref={searchInputRef}
                                    type="search"
                                    className="flex-1 ml-6 text-xs text-gray-600 placeholder-gray-400 bg-transparent border-none outline-none focus:outline-none focus:ring-0 dark:text-white/80 sm:text-base"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        if (e.target.value.trim().length > 0) {
                                            setSearchQuery(e.target.value);
                                            if (!isPrefChanged) setIsPrefChanged(true);
                                        } else if (
                                            e.target.value.trim().length === 0 &&
                                            defaultQuery === ''
                                        ) {
                                            setSearchQuery('');
                                            if (isPrefChanged) setIsPrefChanged(false);
                                        } else {
                                            setSearchQuery('');
                                            if (!isPrefChanged) setIsPrefChanged(true);
                                        }
                                    }}

                                />
                            </div>
                        </div>



                        {additional_filters && (
                            <button
                                className="mr-1.5 rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900 sm:mr-2 sm:p-2"
                                onClick={() => setIsSpatiotemporalFilters(true)}
                            >
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
                                        d="m6.115 5.19.319 1.913A6 6 0 0 0 8.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 0 0 2.288-4.042 1.087 1.087 0 0 0-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 0 1-.98-.314l-.295-.295a1.125 1.125 0 0 1 0-1.591l.13-.132a1.125 1.125 0 0 1 1.3-.21l.603.302a.809.809 0 0 0 1.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 0 0 1.528-1.732l.146-.292M6.115 5.19A9 9 0 1 0 17.18 4.64M6.115 5.19A8.965 8.965 0 0 1 12 3c1.929 0 3.716.607 5.18 1.64"
                                    />
                                </svg>
                            </button>
                        )}


                    </div>
                </div>
            </div>



            {/* Spatitemporal Filters */}
            {isSpatiotemporalFilters && additional_filters && (
                <>
                    {createPortal(
                        windowSize.width > 1024 ? (
                            //  PC VERSION
                            <div className="fixed inset-0 z-50 flex items-center justify-center">
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 transition-opacity duration-300 bg-black/60 backdrop-blur-sm"
                                    onClick={() => setIsSpatiotemporalFilters(false)}
                                />

                                {/* Modal Card */}
                                <div className="relative z-10 w-full max-w-2xl p-8 shadow-2xl rounded-2xl bg-white/95 dark:bg-deepcharcoal dark:text-white/80">
                                    {/* Header */}
                                    <div className="flex items-center justify-center pb-4 border-b border-gray-200 dark:border-gray-700">
                                        <h2 className="text-2xl font-semibold tracking-tight text-gray-600 dark:text-white/80">
                                            Advanced Search
                                        </h2>

                                    </div>

                                    <button
                                        onClick={() => {
                                            setIsSpatiotemporalFilters(false);
                                        }}
                                        className="absolute z-50 p-2 text-gray-600 transition-colors rounded-full top-7 right-4 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
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

                                    {/* Content */}
                                    <div className="mt-6 max-h-[100vh] space-y-8 overflow-y-auto pr-1">
                                        <section className="w-full mt-4">
                                            {/* Search Bar */}
                                            <div className="z-[50] mx-auto w-full transition-all duration-300">
                                                <div className="py-2 mx-auto sm:py-3">
                                                    <div className="flex w-full items-center rounded-xl border border-gray-300 bg-white/90 p-1.5 dark:border-gray-700 dark:bg-deepcharcoal sm:p-2">
                                                        <div className="relative flex items-center w-full rounded-xl">
                                                            {searchQuery !== '' && (
                                                                <svg
                                                                    onClick={() => {
                                                                        setSearchQuery('');
                                                                        setIsPrefChanged(true);
                                                                        modalSearchInputRef?.current?.focus();
                                                                    }}
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={1.5}
                                                                    stroke="currentColor"
                                                                    className="absolute cursor-pointer right-3 size-4 hover:text-black/80 dark:text-white/80 hover:dark:text-white/50"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M6 18 18 6M6 6l12 12"
                                                                    />
                                                                </svg>
                                                            )}

                                                            {/* Magnifire Icon */}
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={1.5}
                                                                stroke="currentColor"
                                                                className="absolute cursor-pointer left-3 size-5 dark:text-white/80"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                                                />
                                                            </svg>
                                                            <input
                                                                ref={modalSearchInputRef}
                                                                type="search"
                                                                className="flex-1 ml-6 text-xs text-gray-600 placeholder-gray-400 bg-transparent border-none outline-none focus:outline-none focus:ring-0 dark:text-white/80 sm:text-base"
                                                                value={searchQuery}
                                                                onChange={(e) => {
                                                                    if (
                                                                        e.target.value.trim()
                                                                            .length > 0
                                                                    ) {
                                                                        setSearchQuery(
                                                                            e.target.value,
                                                                        );
                                                                        if (!isPrefChanged)
                                                                            setIsPrefChanged(true);
                                                                    } else if (
                                                                        e.target.value.trim()
                                                                            .length === 0 &&
                                                                        defaultQuery === ''
                                                                    ) {
                                                                        setSearchQuery('');
                                                                        if (isPrefChanged)
                                                                            setIsPrefChanged(false);
                                                                    } else {
                                                                        setSearchQuery('');
                                                                        if (!isPrefChanged)
                                                                            setIsPrefChanged(true);
                                                                    }
                                                                }}

                                                            />
                                                        </div>


                                                    </div>
                                                </div>
                                            </div>

                                            {/* Address Input */}
                                            <div className="mb-5">
                                                <div className="flex items-center p-2 border border-gray-300 rounded-xl bg-white/90 dark:border-gray-700 dark:bg-deepcharcoal">
                                                    <div className="relative flex items-center w-full rounded-xl">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="absolute cursor-pointer left-3 size-5 dark:text-white/80"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                                                            />
                                                        </svg>

                                                        <input
                                                            key={getPlaceDetails}
                                                            type="search"
                                                            className="flex-1 ml-6 text-sm text-gray-600 placeholder-gray-400 bg-transparent border-none outline-none focus:ring-0 dark:text-white/80"
                                                            value={autoCompletionLocationSearch}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (value === '') {
                                                                    setPlaceId('');
                                                                    setAutoCompletionLocationSearch(
                                                                        '',
                                                                    );
                                                                    setAutoCompletionResults([]);
                                                                    setPostFilters((prev) => ({
                                                                        ...prev,
                                                                        address: {
                                                                            lat: '',
                                                                            lng: '',
                                                                        },
                                                                    }));
                                                                    setAddressReady(false);
                                                                } else {
                                                                    setAutoCompletionLocationSearch(
                                                                        e.target.value,
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                {autoCompletionDropdown && (
                                                    <ul className="relative z-50 w-full mt-2 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg max-h-60 dark:border-gray-600 dark:bg-deepcharcoal">
                                                        {autoCompletionLoading ? (
                                                            <li className="flex items-center justify-center px-4 py-4">
                                                                <div className="w-5 h-5 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent"></div>
                                                            </li>
                                                        ) : (
                                                            autoCompletionResults.map(
                                                                (item, index) => (
                                                                    <li
                                                                        key={index}
                                                                        className="px-4 py-2 text-sm text-gray-800 cursor-pointer hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-900"
                                                                        onClick={() => {
                                                                            setPlaceId(
                                                                                item.place_id,
                                                                            );
                                                                            setAutoCompletionLocationSearch(
                                                                                item.description,
                                                                            );
                                                                            setAutoCompletionDropdown(
                                                                                false,
                                                                            );
                                                                            setIsPrefChanged(true);
                                                                        }}
                                                                    >
                                                                        {item.description}
                                                                    </li>
                                                                ),
                                                            )
                                                        )}
                                                    </ul>
                                                )}
                                            </div>

                                            {/* Floor, Radius, and Time Inputs */}
                                            {addressReady && (
                                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                    {/* Radius */}
                                                    <div className="col-span-1">
                                                        <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-white/80">
                                                            Radius
                                                        </label>
                                                        <div
                                                            onClick={() => setIsRadiusModal(true)}
                                                            className="flex h-[50px] cursor-pointer items-center rounded-xl border border-gray-300 bg-white/90 p-2 outline-none transition focus:outline-none focus:ring-0 dark:border-gray-700 dark:bg-deepcharcoal"
                                                        >
                                                            <input
                                                                readOnly
                                                                type="text"
                                                                className="w-full text-sm text-gray-600 placeholder-gray-400 bg-transparent border-none outline-none focus:outline-none focus:ring-0 dark:text-white/80"
                                                                value={
                                                                    (
                                                                        postFilters.radius / 1000
                                                                    ).toFixed(2) + ' km'
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    <RadiusMap
                                                        key={isRadiusModal}
                                                        isModalOpen={isRadiusModal}
                                                        setIsModalOpen={setIsRadiusModal}
                                                        lat={postFilters.address.lat}
                                                        lng={postFilters.address.lng}
                                                        onRadiusChange={(newRadius) => {
                                                            setPostFilters((prev) => ({
                                                                ...prev,
                                                                radius: newRadius,
                                                            }));

                                                            setIsPrefChanged(true);
                                                        }}
                                                        google_map_api_key={google_map_api_key}
                                                        defaultRadius={postFilters.radius}
                                                    />

                                                    {/* Floor Range */}
                                                    <div className="col-span-2">
                                                        <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-white/80">
                                                            Floor Range
                                                        </label>
                                                        <div className="flex h-[50px] items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white/90 px-2 dark:border-gray-700 dark:bg-deepcharcoal">
                                                            <SelectInput
                                                                Id="from_floor_id"
                                                                Name="from_floor_id"
                                                                Value={postFilters.from_floor_id}
                                                                items={floors.from_floors}
                                                                itemKey="name"
                                                                Placeholder="From Floor"
                                                                customPlaceHolder={true}
                                                                Action={(value) => {
                                                                    setPostFilters({
                                                                        ...postFilters,
                                                                        from_floor_id: value,
                                                                    });

                                                                    setIsPrefChanged(true);
                                                                }}
                                                                CustomCss="w-full mt-3  border-none bg-transparent text-sm text-gray-600 dark:text-white/80 placeholder-gray-400 outline-none focus:outline-none "
                                                            />
                                                            <span className="text-gray-600 dark:text-white/80">
                                                                –
                                                            </span>
                                                            <SelectInput
                                                                Id="to_floor_id"
                                                                Name="to_floor_id"
                                                                Value={postFilters.to_floor_id}
                                                                items={floors.to_floors}
                                                                itemKey="name"
                                                                Placeholder="To Floor"
                                                                customPlaceHolder={true}
                                                                Action={(value) => {
                                                                    setPostFilters({
                                                                        ...postFilters,
                                                                        to_floor_id: value,
                                                                    });

                                                                    setIsPrefChanged(true);
                                                                }}
                                                                CustomCss="w-full mt-3 border-none bg-transparent text-sm  placeholder-gray-400 outline-none focus:outline-none text-gray-600 dark:text-white/80"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Time Range */}
                                                    <div className="col-span-3">
                                                        <label className="block mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                            Date & Time Range
                                                        </label>
                                                        <div className="flex h-[50px] items-center gap-2 rounded-xl border border-gray-300 bg-white/90 p-2 focus-within:outline-none focus-within:ring-0 dark:border-gray-700 dark:bg-deepcharcoal">
                                                            <input
                                                                ref={rangeRef}
                                                                readOnly
                                                                placeholder="Select Date & Time Range"
                                                                className="w-full text-sm text-gray-600 placeholder-gray-400 bg-transparent border-none outline-none focus:outline-none focus:ring-0 dark:text-white/80"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </section>

                                        {isPrefChanged && (
                                            <div className="flex justify-center pt-5">
                                                <button
                                                    onClick={() => ApplyFilter('query')}
                                                    className="flex w-[200px] items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
                                                >
                                                    {searchApplying && (
                                                        <div role="status">
                                                            <svg
                                                                aria-hidden="true"
                                                                className="w-8 h-4 text-gray-200 animate-spin fill-white/80 dark:text-gray-200"
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
                                                            <span className="sr-only"></span>
                                                        </div>
                                                    )}
                                                    Apply Search
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            //  MOBILE VERSION
                            <div className="fixed inset-0 z-50 bg-black">
                                {/* Backdrop */}
                                <div className="absolute inset-0 bg-black/70"></div>

                                {/* Fullscreen slide-over */}
                                <div className="relative z-10 flex h-[100dvh] w-full flex-col overflow-y-auto bg-white text-black dark:bg-deepcharcoal dark:text-white/80 sm:pb-20">
                                    {/* Top Bar */}
                                    <div className="flex items-center justify-center px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                                        <button
                                            onClick={() => setIsSpatiotemporalFilters(false)}
                                            className="absolute p-1 rounded-full left-4 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
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
                                                    d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                                                />
                                            </svg>
                                        </button>

                                        <h2 className="mx-10 text-xl font-semibold tracking-tight text-gray-800 dark:text-gray-100">
                                            Advanced Search
                                        </h2>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 px-2 space-y-6">
                                        <section className="w-full mt-4">
                                            {/* Search Bar */}
                                            <div className="z-[50] mx-auto w-full transition-all duration-300">
                                                <div className="py-2 mx-auto sm:py-3">
                                                    <div className="flex w-full items-center rounded-xl border border-gray-300 bg-white/90 p-1.5 dark:border-gray-700 dark:bg-deepcharcoal sm:p-2">
                                                        <div className="relative flex items-center w-full rounded-xl">
                                                            {searchQuery !== '' && (
                                                                <svg
                                                                    onClick={() => {
                                                                        setSearchQuery('');
                                                                        setIsPrefChanged(true);
                                                                        modalSearchInputRef.current?.focus();
                                                                    }}
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={1.5}
                                                                    stroke="currentColor"
                                                                    className="absolute cursor-pointer right-3 size-4 hover:text-black/80 dark:text-white/80 hover:dark:text-white/50"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M6 18 18 6M6 6l12 12"
                                                                    />
                                                                </svg>
                                                            )}

                                                            {/* Magnifire Icon */}
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={1.5}
                                                                stroke="currentColor"
                                                                className="absolute cursor-pointer left-3 size-5 dark:text-white/80"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                                                />
                                                            </svg>

                                                            <input
                                                                ref={modalSearchInputRef}
                                                                type="search"
                                                                className="flex-1 ml-6 text-sm text-gray-600 placeholder-gray-400 bg-transparent border-none outline-none focus:outline-none focus:ring-0 dark:text-white/80 sm:text-base"
                                                                value={searchQuery}
                                                                onChange={(e) => {
                                                                    if (
                                                                        e.target.value.trim()
                                                                            .length > 0
                                                                    ) {
                                                                        setSearchQuery(
                                                                            e.target.value,
                                                                        );
                                                                        if (!isPrefChanged)
                                                                            setIsPrefChanged(true);
                                                                    } else if (
                                                                        e.target.value.trim()
                                                                            .length === 0 &&
                                                                        defaultQuery === ''
                                                                    ) {
                                                                        setSearchQuery('');
                                                                        if (isPrefChanged)
                                                                            setIsPrefChanged(false);
                                                                    } else {
                                                                        setSearchQuery('');
                                                                        if (!isPrefChanged)
                                                                            setIsPrefChanged(true);
                                                                    }
                                                                }}

                                                            />
                                                        </div>


                                                    </div>
                                                </div>
                                            </div>
                                            {/* Address Input */}
                                            <div className="mb-5">
                                                <div className="flex items-center p-2 border border-gray-300 outline-none rounded-xl bg-white/90 focus-within:ring-0 dark:border-gray-700 dark:bg-deepcharcoal">
                                                    <div className="relative flex items-center w-full rounded-xl">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="absolute cursor-pointer left-3 size-5 dark:text-white/80"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                                                            />
                                                        </svg>

                                                        <input
                                                            key={getPlaceDetails}
                                                            type="search"
                                                            className="flex-1 ml-6 text-sm text-gray-600 placeholder-gray-400 bg-transparent border-none outline-none focus:ring-0 dark:text-white/80"
                                                            value={autoCompletionLocationSearch}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (value === '') {
                                                                    setPlaceId('');
                                                                    setAutoCompletionLocationSearch(
                                                                        '',
                                                                    );
                                                                    setAutoCompletionResults([]);
                                                                    setPostFilters((prev) => ({
                                                                        ...prev,
                                                                        address: {
                                                                            lat: '',
                                                                            lng: '',
                                                                        },
                                                                    }));
                                                                    setAddressReady(false);
                                                                } else {
                                                                    setAutoCompletionLocationSearch(
                                                                        e.target.value,
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                {autoCompletionDropdown && (
                                                    <ul className="relative z-50 w-full mt-2 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg max-h-60 dark:border-gray-600 dark:bg-deepcharcoal">
                                                        {autoCompletionLoading ? (
                                                            <li className="flex items-center justify-center px-4 py-4">
                                                                <div className="w-5 h-5 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent"></div>
                                                            </li>
                                                        ) : (
                                                            autoCompletionResults.map(
                                                                (item, index) => (
                                                                    <li
                                                                        key={index}
                                                                        className="px-4 py-2 text-sm text-gray-800 cursor-pointer hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-900"
                                                                        onClick={() => {
                                                                            setPlaceId(
                                                                                item.place_id,
                                                                            );
                                                                            setAutoCompletionLocationSearch(
                                                                                item.description,
                                                                            );
                                                                            setAutoCompletionDropdown(
                                                                                false,
                                                                            );
                                                                            setIsPrefChanged(true);
                                                                        }}
                                                                    >
                                                                        {item.description}
                                                                    </li>
                                                                ),
                                                            )
                                                        )}
                                                    </ul>
                                                )}
                                            </div>

                                            {/* Floor, Radius, and Time Inputs */}
                                            {addressReady && (
                                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                    {/* Radius */}
                                                    <div className="col-span-1">
                                                        <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-white/80">
                                                            Radius
                                                        </label>
                                                        <div
                                                            onClick={() => setIsRadiusModal(true)}
                                                            className="flex h-[50px] cursor-pointer items-center rounded-xl border border-gray-300 bg-white/90 p-2 outline-none transition focus-within:ring-0 dark:border-gray-700 dark:bg-deepcharcoal"
                                                        >
                                                            <input
                                                                readOnly
                                                                type="text"
                                                                className="w-full text-sm text-gray-600 bg-transparent border-none outline-none focus-within:ring-0 dark:text-white/80"
                                                                value={
                                                                    (
                                                                        postFilters.radius / 1000
                                                                    ).toFixed(2) + ' km'
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    <RadiusMap
                                                        key={isRadiusModal}
                                                        isModalOpen={isRadiusModal}
                                                        setIsModalOpen={setIsRadiusModal}
                                                        lat={postFilters.address.lat}
                                                        lng={postFilters.address.lng}
                                                        onRadiusChange={(newRadius) => {
                                                            setPostFilters((prev) => ({
                                                                ...prev,
                                                                radius: newRadius,
                                                            }));

                                                            setIsPrefChanged(true);
                                                        }}
                                                        google_map_api_key={google_map_api_key}
                                                        defaultRadius={postFilters.radius}
                                                    />

                                                    {/* Floor Range */}
                                                    <div className="col-span-2">
                                                        <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-white/80">
                                                            Floor Range
                                                        </label>
                                                        <div className="flex h-[50px] items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white/90 px-2 shadow-sm dark:border-gray-700 dark:bg-deepcharcoal">
                                                            <SelectInput
                                                                Id="from_floor_id"
                                                                Name="from_floor_id"
                                                                Value={postFilters.from_floor_id}
                                                                items={floors.from_floors}
                                                                itemKey="name"
                                                                Placeholder="From Floor"
                                                                customPlaceHolder={true}
                                                                Action={(value) => {
                                                                    setPostFilters({
                                                                        ...postFilters,
                                                                        from_floor_id: value,
                                                                    });

                                                                    setIsPrefChanged(true);
                                                                }}
                                                                CustomCss="w-full mt-3  border-none bg-transparent text-sm text-gray-600 dark:text-white/80 placeholder-gray-400 outline-none focus:outline-none "
                                                            />
                                                            <span className="text-gray-600 dark:text-white/80">
                                                                –
                                                            </span>
                                                            <SelectInput
                                                                Id="to_floor_id"
                                                                Name="to_floor_id"
                                                                Value={postFilters.to_floor_id}
                                                                items={floors.to_floors}
                                                                itemKey="name"
                                                                Placeholder="To Floor"
                                                                customPlaceHolder={true}
                                                                Action={(value) => {
                                                                    setPostFilters({
                                                                        ...postFilters,
                                                                        to_floor_id: value,
                                                                    });

                                                                    setIsPrefChanged(true);
                                                                }}
                                                                CustomCss="w-full mt-3 border-none bg-transparent text-sm  placeholder-gray-400 outline-none focus:outline-none text-gray-600 dark:text-white/80"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Time Range */}
                                                    <div className="col-span-3">
                                                        <label className="block mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                            Date & Time Range
                                                        </label>
                                                        <div className="flex h-[50px] items-center gap-2 rounded-xl border border-gray-300 bg-white/90 p-2 outline-none focus-within:ring-0 dark:border-gray-700 dark:bg-deepcharcoal">
                                                            <input
                                                                ref={rangeRef}
                                                                readOnly
                                                                placeholder="Select Date & Time Range"
                                                                className="w-full text-sm text-gray-600 placeholder-gray-400 bg-transparent border-none outline-none focus-within:ring-0 dark:text-white/80"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </section>

                                        {isPrefChanged && (
                                            <div className="flex justify-center pt-5">
                                                <button
                                                    onClick={() => ApplyFilter('query')}
                                                    className="flex w-[200px] items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
                                                >
                                                    {searchApplying && (
                                                        <div role="status">
                                                            <svg
                                                                aria-hidden="true"
                                                                className="w-8 h-4 text-gray-200 animate-spin fill-white/80 dark:text-gray-200"
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
                                                            <span className="sr-only"></span>
                                                        </div>
                                                    )}
                                                    Apply Search
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ),
                        document.getElementById('modak-root') || document.body,
                    )}
                </>
            )}

            {/* Place Detail Locaiton Fecthing Loading State */}
            {palceDetailFetching &&
                createPortal(
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                        <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                        {/* Modal content */}
                        <div className="relative z-10 w-full max-w-lg max-h-screen p-6 overflow-y-auto bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal sm:p-8">
                            <div className="text-center">
                                <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                    Please Wait While We Are Setting up Location
                                </h2>

                                <div className="flex items-center justify-center mt-5">
                                    <div role="status">
                                        <svg
                                            aria-hidden="true"
                                            className="w-8 h-8 text-gray-200 animate-spin fill-indigo-600 dark:text-gray-600"
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
                            </div>
                        </div>
                    </div>,
                    document.getElementById('modak-root') || document.body,
                )}

            {/* Searching On Main Searching Archive Page Loader */}
            {searchApplying && !isSpatiotemporalFilters && (
                <>
                    {createPortal(
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                            <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                            {/* Modal content */}
                            <div className="relative z-10 w-full max-w-lg max-h-screen p-6 overflow-y-auto bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal sm:p-8">
                                <div className="text-center">
                                    <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                        Please Wait While We Are Finding Results For You
                                    </h2>

                                    <div className="flex items-center justify-center mt-5">
                                        <div role="status">
                                            <svg
                                                aria-hidden="true"
                                                className="w-8 h-8 text-gray-200 animate-spin fill-indigo-600 dark:text-gray-600"
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
                                </div>
                            </div>
                        </div>,
                        document.getElementById('modak-root') || document.body,
                    )}
                </>
            )}
        </>
    );
};

export default GlobalSearch;
