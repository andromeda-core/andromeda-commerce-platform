import React, { useEffect, useRef, useState } from 'react';

import SelectInput from '@/Components/SelectInput';
import useWindowSize from '@/Hooks/useWindowSize';
import axios from 'axios';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import RadiusMap from './RadiusMap';
import { router } from '@inertiajs/react';

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};
const GlobalSearch = ({
    floors,
    google_map_api_key,
    additional_filters,
    OnPostFilterChange = () => {},
    defaultQuery = '',
    resultsPage = false,
    defaultPostFilters = {},
    defaultFiltersCleared = false,
}) => {
    const windowSize = useWindowSize();
    const [searchApplying, setSearchApplying] = useState(false);
    // Filter Setting
    const [isPostFilterSetting, setIsPostFilterSetting] = useState(false);

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
        if (cookieValue) {
            try {
                const parsed = JSON.parse(decodeURIComponent(cookieValue));
                setPostPreferences(parsed);
            } catch (e) {
                console.error('Failed to parse post_preferences cookie', e);
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
                            toast.error('Please select both start and end dates.');
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
                    toast.error('Please select both start and end dates.');
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
        };
    }, [addressReady]);

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
                            toast.info('No Results Found');
                        }
                    });
            }
        } catch (e) {
            setAutoCompletionLoading(false);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: e.message || 'Something went wrong',
            });
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
                toast.info('Please Enter More Details To Search');
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
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: e.message || 'Something went wrong',
                });
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

    const handlePostPreferences = (type, value) => {
        if (postPreferences) {
            setPostPreferences((prev) => {
                const updated = { ...prev, [type]: value };

                const postTypes = ['text', 'images', 'videos'];
                const visibilityFilters = ['show_posts', 'show_products'];

                const postTypesAllFalse = postTypes.every((k) => updated[k] === false);
                const visibilityAllFalse = visibilityFilters.every((k) => updated[k] === false);

                // Prevent all post types from being false
                if (postTypes.includes(type) && postTypesAllFalse) {
                    toast.info(
                        'At least one post type (text, image, or video) must remain enabled.',
                    );
                    return prev;
                }

                // Prevent all visibility filters from being false
                if (visibilityFilters.includes(type) && visibilityAllFalse) {
                    toast.info(
                        'At least one visibility option (posts or products) must remain enabled.',
                    );
                    return prev;
                }
                setIsPrefChanged(true);
                return updated;
            });
        }
    };

    const clearSession = async () => {
        try {
            await axios.delete(route('website.global-search.search-session-destroy'));
        } catch (e) {}
    };

    const searchQueryRef = useRef('');
    const searchInputRef = useRef('');
    useEffect(() => {
        searchQueryRef.current = searchQuery;
    }, [searchQuery]);

    // Focusing On Component Mount If Search Query Already Exists
    useEffect(() => {
        if (searchQueryRef.current !== '') {
            searchInputRef.current.focus();
        }
    }, []);

    const ApplyFilter = async (type) => {
        document.cookie = `post_preferences=${JSON.stringify(postPreferences)};path=/;max-age=31536000;SameSite=Lax;`;

        const isAnyAdditionalFilterApplied = Object.values(postFilters).some((value) => {
            if (value === '' || value === null || value === undefined) return false;

            if (Array.isArray(value)) {
                return value.length > 0;
            }

            if (typeof value === 'object') {
                const innerValues = Object.values(value);
                const hasNonEmpty = innerValues.some(
                    (v) => v !== '' && v !== null && v !== undefined,
                );
                return hasNonEmpty;
            }

            return true;
        });

        if (type === 'filter') {
            if (resultsPage) {
                setSearchApplying(true);
                OnPostFilterChange(true);
                await clearSession();
                await axios
                    .post(
                        route('website.global-search.results'),
                        {
                            post_filters: postFilters,
                            post_preferences: postPreferences,
                            query: searchQueryRef.current,
                        },
                        {
                            headers: { 'X-Inertia': true },
                        },
                    )
                    .then((response) => {
                        router.replace(response.data);
                        window.history.replaceState({}, '', route('website.global-search.results'));
                    })
                    .catch((error) => {
                        toast.error(error.message);
                    })
                    .finally(() => {
                        setSearchApplying(false);
                    });

                setIsPrefChanged(false);
            }

            if (!isAnyAdditionalFilterApplied) {
                OnPostFilterChange(true);
                setIsPrefChanged(false);
                setSearchQuery('');

                return;
            }
        }

        if (type !== 'filter') {
            setSearchApplying(true);
            if (postFilters.from_floor_id != '' && postFilters.to_floor_id == '') {
                toast.error('Please Select (To Floor) ');
                return;
            } else if (postFilters.to_floor_id != '' && postFilters.from_floor_id == '') {
                toast.error('Please Select (From Floor) ');
                return;
            }

            await clearSession();
            await axios
                .post(
                    route('website.global-search.results'),
                    {
                        post_filters: postFilters,
                        post_preferences: postPreferences,
                        query: searchQueryRef.current,
                    },
                    {
                        headers: { 'X-Inertia': true },
                    },
                )
                .then((response) => {
                    router.replace(response.data);
                    window.history.replaceState({}, '', route('website.global-search.results'));
                })
                .catch((error) => {
                    toast.error(error.message);
                })
                .finally(() => {
                    setSearchApplying(false);
                });

            setIsPrefChanged(false);
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

            const isInInput = active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA';

            if (e.key === 'Enter' && isInInput) {
                e.preventDefault();

                setTimeout(() => {
                    const currentQuery = searchQueryRef.current.trim();
                    if (!isPrefChanged) {
                        if (currentQuery !== '') {
                            toast.info('To Apply Search Please Search Anything Else');
                            return;
                        }
                        toast.info('Please search something first');
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

        if (isPostFilterSetting) {
            window.history.pushState({}, '', window.location.pathname);
            url.searchParams.set('modal', 'filters');
        } else if (isSpatiotemporalFilters) {
            window.history.pushState({}, '', window.location.pathname);
            url.searchParams.set('modal', 'spatiotemporal-filters');
        } else {
            url.searchParams.delete('modal');
        }

        window.history.replaceState({}, '', url);
    }, [isPostFilterSetting, isSpatiotemporalFilters]);

    // Handle browser/mobile back button to close modals
    useEffect(() => {
        const handlePopState = (e) => {
            if (isPostFilterSetting) {
                setIsPostFilterSetting(false);
                return;
            }

            if (isSpatiotemporalFilters) {
                setIsSpatiotemporalFilters(false);
                return;
            }
        };

        const preventInertiaNavigation = (event) => {
            if (isSpatiotemporalFilters || isPostFilterSetting) {
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
    }, [isPostFilterSetting, isSpatiotemporalFilters]);

    return (
        <>
            <div className="lg:max-w-8xl sticky top-0 z-[50] mx-auto w-full backdrop-blur-md transition-all duration-300 sm:px-6 lg:px-8">
                <div className="mx-auto py-2 sm:py-3">
                    <div className="flex w-full items-center rounded-xl border border-gray-300 bg-white/90 p-1.5 shadow-md dark:border-gray-700 dark:bg-deepcharcoal dark:shadow-white/20 sm:p-2">
                        {/* <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="ml-1.5 h-5 w-5 text-gray-500 dark:text-gray-300 sm:ml-2 sm:h-6 sm:w-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                            />
                        </svg> */}

                        <div className="relative flex w-full items-center rounded-xl">
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
                                    className="absolute right-3 size-4 cursor-pointer hover:text-black/80 dark:text-white/80 hover:dark:text-white/50"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18 18 6M6 6l12 12"
                                    />
                                </svg>
                            )}

                            <input
                                ref={searchInputRef}
                                type="search"
                                placeholder="What happened...?"
                                className="ml-2 flex-1 border-none bg-transparent text-xs text-gray-600 placeholder-gray-400 outline-none focus:outline-none focus:ring-0 dark:text-white/80 sm:text-base"
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

                        <button
                            className="mr-1.5 rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900 sm:mr-2 sm:p-2"
                            onClick={() => {
                                setIsPostFilterSetting(true);
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="h-5 w-5 sm:h-6 sm:w-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* {isPrefChanged && (
                        <div className="flex items-center justify-center mt-2 animate-fadeInDown">
                            <div className="flex justify-center pt-5">
                                <button
                                    onClick={() => ApplyFilter('query')}
                                    className="flex w-[200px] items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
                                    disabled={searchApplying}
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
                        </div>
                    )} */}
                </div>
            </div>

            {/* Post Filter Setting */}
            {isPostFilterSetting && (
                <>
                    {createPortal(
                        windowSize.width > 1024 ? (
                            //  PC VERSION
                            <div className="fixed inset-0 z-50 flex items-center justify-center">
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                                    onClick={() => setIsPostFilterSetting(false)}
                                />

                                {/* Modal Card */}
                                <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white/95 p-8 shadow-2xl dark:bg-deepcharcoal dark:text-white/80">
                                    {/* Header */}
                                    <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                                        <h2 className="text-xl font-semibold tracking-tight text-gray-600 dark:text-white/80">
                                            Post Filter Settings
                                        </h2>
                                        <button
                                            onClick={() => setIsPostFilterSetting(false)}
                                            className="rounded-full p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-900"
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
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="mt-6 max-h-[70vh] space-y-8 overflow-y-auto pr-1">
                                        {/* SECTION: General Location */}
                                        {/* <section>
                                            <h3 className="mb-4 text-sm font-medium tracking-wider text-gray-500 uppercase">
                                                Location
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">
                                                    Show posts near current location
                                                </span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                    />
                                                    <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                                </label>
                                            </div>
                                        </section> */}

                                        {/* SECTION: Post Type Filters */}
                                        <section>
                                            <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-500">
                                                Post Type Filters
                                            </h3>
                                            <div className="space-y-4">
                                                {[
                                                    { key: 'text', label: 'Text' },
                                                    { key: 'images', label: 'Images' },
                                                    { key: 'videos', label: 'Videos' },
                                                ].map(({ key, label }) => (
                                                    <div
                                                        key={key}
                                                        className="flex items-center justify-between"
                                                    >
                                                        <span className="text-sm font-medium text-gray-600 dark:text-white/80">
                                                            {label}
                                                        </span>
                                                        <label className="relative inline-flex cursor-pointer items-center">
                                                            <input
                                                                type="checkbox"
                                                                className="peer sr-only"
                                                                checked={postPreferences[key]}
                                                                onChange={(e) =>
                                                                    handlePostPreferences(
                                                                        key,
                                                                        e.target.checked,
                                                                    )
                                                                }
                                                            />
                                                            <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>

                                        {/* SECTION RESULTS PAGE FILTER */}
                                        {resultsPage && (
                                            <section>
                                                <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-500">
                                                    Visibility Filter
                                                </h3>
                                                <div className="space-y-4">
                                                    {[
                                                        { key: 'show_posts', label: 'Posts' },
                                                        {
                                                            key: 'show_products',
                                                            label: 'Products',
                                                        },
                                                    ].map(({ key, label }) => (
                                                        <div
                                                            key={key}
                                                            className="flex items-center justify-between"
                                                        >
                                                            <span className="text-sm font-medium text-gray-600 dark:text-white/80">
                                                                {label}
                                                            </span>
                                                            <label className="relative inline-flex cursor-pointer items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    className="peer sr-only"
                                                                    checked={postPreferences[key]}
                                                                    onChange={(e) =>
                                                                        handlePostPreferences(
                                                                            key,
                                                                            e.target.checked,
                                                                        )
                                                                    }
                                                                />
                                                                <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>
                                        )}

                                        {isPrefChanged && (
                                            <div className="flex justify-center pt-5">
                                                <button
                                                    onClick={() => ApplyFilter('filter')}
                                                    className="flex w-[200px] items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
                                                >
                                                    {searchApplying && (
                                                        <div role="status">
                                                            <svg
                                                                aria-hidden="true"
                                                                className="h-4 w-8 animate-spin fill-white/80 text-gray-200 dark:text-gray-200"
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
                                                    Apply Filter
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
                                    <div className="relative flex items-center border-b border-gray-200 px-4 py-3 dark:border-gray-800">
                                        <button
                                            onClick={() => setIsPostFilterSetting(false)}
                                            className="absolute left-4 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
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
                                            Post Filter Settings
                                        </h2>
                                    </div>

                                    {/* Content */}
                                    <div className="my-4 flex-1 space-y-6 p-4">
                                        {/* Location Section */}
                                        {/* <div className="space-y-4">
                                            <h3 className="mb-4 text-sm font-medium tracking-wider text-gray-500 uppercase">
                                                Location
                                            </h3>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">
                                                    Show content near current location
                                                </span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                    />
                                                    <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                                </label>
                                            </div>
                                        </div> */}

                                        {/* Post Feed Settings */}
                                        <div>
                                            <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-500">
                                                Post Type Filters
                                            </h3>
                                            <div className="space-y-5">
                                                {/* Text */}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Text</span>
                                                    <label className="relative inline-flex cursor-pointer items-center">
                                                        <input
                                                            type="checkbox"
                                                            className="peer sr-only"
                                                            checked={postPreferences.text}
                                                            onChange={(e) =>
                                                                handlePostPreferences(
                                                                    'text',
                                                                    e.target.checked,
                                                                )
                                                            }
                                                        />
                                                        <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                                    </label>
                                                </div>

                                                {/* Images */}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Images</span>
                                                    <label className="relative inline-flex cursor-pointer items-center">
                                                        <input
                                                            type="checkbox"
                                                            className="peer sr-only"
                                                            checked={postPreferences.images}
                                                            onChange={(e) =>
                                                                handlePostPreferences(
                                                                    'images',
                                                                    e.target.checked,
                                                                )
                                                            }
                                                        />
                                                        <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                                    </label>
                                                </div>

                                                {/* Videos */}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Videos</span>
                                                    <label className="relative inline-flex cursor-pointer items-center">
                                                        <input
                                                            type="checkbox"
                                                            className="peer sr-only"
                                                            checked={postPreferences.videos}
                                                            onChange={(e) =>
                                                                handlePostPreferences(
                                                                    'videos',
                                                                    e.target.checked,
                                                                )
                                                            }
                                                        />
                                                        <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* SECTION RESULTS PAGE FILTER */}
                                        {resultsPage && (
                                            <section>
                                                <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-500">
                                                    Visibility Filter
                                                </h3>
                                                <div className="space-y-4">
                                                    {[
                                                        { key: 'show_posts', label: 'Posts' },
                                                        {
                                                            key: 'show_products',
                                                            label: 'Products',
                                                        },
                                                    ].map(({ key, label }) => (
                                                        <div
                                                            key={key}
                                                            className="flex items-center justify-between"
                                                        >
                                                            <span className="text-sm font-medium text-gray-600 dark:text-white/80">
                                                                {label}
                                                            </span>
                                                            <label className="relative inline-flex cursor-pointer items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    className="peer sr-only"
                                                                    checked={postPreferences[key]}
                                                                    onChange={(e) =>
                                                                        handlePostPreferences(
                                                                            key,
                                                                            e.target.checked,
                                                                        )
                                                                    }
                                                                />
                                                                <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>
                                        )}

                                        {isPrefChanged && (
                                            <div className="flex justify-center pt-5">
                                                <button
                                                    onClick={() => ApplyFilter('filter')}
                                                    className="flex w-[200px] items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
                                                >
                                                    {searchApplying && (
                                                        <div role="status">
                                                            <svg
                                                                aria-hidden="true"
                                                                className="h-4 w-8 animate-spin fill-white/80 text-gray-200 dark:text-gray-200"
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
                                                    Apply Filter
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ),
                        document.body,
                    )}
                </>
            )}

            {/* Spatitemporal Filters */}
            {isSpatiotemporalFilters && additional_filters && (
                <>
                    {createPortal(
                        windowSize.width > 1024 ? (
                            //  PC VERSION
                            <div className="fixed inset-0 z-50 flex items-center justify-center">
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                                    onClick={() => setIsSpatiotemporalFilters(false)}
                                />

                                {/* Modal Card */}
                                <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white/95 p-8 shadow-2xl dark:bg-deepcharcoal dark:text-white/80">
                                    {/* Header */}
                                    <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                                        <h2 className="text-xl font-semibold tracking-tight text-gray-600 dark:text-white/80">
                                            Spatiotemporal Filters
                                        </h2>
                                        <button
                                            onClick={() => setIsSpatiotemporalFilters(false)}
                                            className="rounded-full p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-900"
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
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="mt-6 max-h-[70vh] space-y-8 overflow-y-auto pr-1">
                                        <section className="mt-4 w-full">
                                            {/* Search Bar */}
                                            <div className="z-[50] mx-auto w-full transition-all duration-300">
                                                <div className="mx-auto py-2 sm:py-3">
                                                    <div className="flex w-full items-center rounded-xl border border-gray-300 bg-white/90 p-1.5 dark:border-gray-700 dark:bg-deepcharcoal sm:p-2">
                                                        <div className="relative flex w-full items-center rounded-xl">
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
                                                                    className="absolute right-3 size-4 cursor-pointer hover:text-black/80 dark:text-white/80 hover:dark:text-white/50"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M6 18 18 6M6 6l12 12"
                                                                    />
                                                                </svg>
                                                            )}

                                                            <input
                                                                ref={searchInputRef}
                                                                type="search"
                                                                placeholder="What happened...?"
                                                                className="ml-2 flex-1 border-none bg-transparent text-xs text-gray-600 placeholder-gray-400 outline-none focus:outline-none focus:ring-0 dark:text-white/80 sm:text-base"
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
                                                <div className="flex items-center rounded-xl border border-gray-300 bg-white/90 p-2 dark:border-gray-700 dark:bg-deepcharcoal">
                                                    <input
                                                        key={getPlaceDetails}
                                                        type="search"
                                                        placeholder="Search Address"
                                                        className="ml-2 flex-1 border-none bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none focus:ring-0 dark:text-white/80"
                                                        value={autoCompletionLocationSearch}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            if (value === '') {
                                                                setPlaceId('');
                                                                setAutoCompletionLocationSearch('');
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
                                                {autoCompletionDropdown && (
                                                    <ul className="relative z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-deepcharcoal">
                                                        {autoCompletionLoading ? (
                                                            <li className="flex items-center justify-center px-4 py-4">
                                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                                                            </li>
                                                        ) : (
                                                            autoCompletionResults.map(
                                                                (item, index) => (
                                                                    <li
                                                                        key={index}
                                                                        className="cursor-pointer px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-900"
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
                                                        <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-white/80">
                                                            Radius
                                                        </label>
                                                        <div
                                                            onClick={() => setIsRadiusModal(true)}
                                                            className="flex h-[50px] cursor-pointer items-center rounded-xl border border-gray-300 bg-white/90 p-2 outline-none transition focus:outline-none focus:ring-0 dark:border-gray-700 dark:bg-deepcharcoal"
                                                        >
                                                            <input
                                                                readOnly
                                                                type="text"
                                                                className="w-full border-none bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none focus:outline-none focus:ring-0 dark:text-white/80"
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
                                                        <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-white/80">
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
                                                        <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                                            Date & Time Range
                                                        </label>
                                                        <div className="flex h-[50px] items-center gap-2 rounded-xl border border-gray-300 bg-white/90 p-2 focus-within:outline-none focus-within:ring-0 dark:border-gray-700 dark:bg-deepcharcoal">
                                                            <input
                                                                ref={rangeRef}
                                                                readOnly
                                                                placeholder="Select Date & Time Range"
                                                                className="w-full border-none bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none focus:outline-none focus:ring-0 dark:text-white/80"
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
                                                                className="h-4 w-8 animate-spin fill-white/80 text-gray-200 dark:text-gray-200"
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
                                    <div className="relative flex items-center border-b border-gray-200 px-4 py-3 dark:border-gray-800">
                                        <button
                                            onClick={() => setIsSpatiotemporalFilters(false)}
                                            className="absolute left-4 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
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
                                            Spatiotemporal Filters
                                        </h2>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-6 px-2">
                                        <section className="mt-4 w-full">
                                            {/* Search Bar */}
                                            <div className="z-[50] mx-auto w-full transition-all duration-300">
                                                <div className="mx-auto py-2 sm:py-3">
                                                    <div className="flex w-full items-center rounded-xl border border-gray-300 bg-white/90 p-1.5 dark:border-gray-700 dark:bg-deepcharcoal sm:p-2">
                                                        <div className="relative flex w-full items-center rounded-xl">
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
                                                                    className="absolute right-3 size-4 cursor-pointer hover:text-black/80 dark:text-white/80 hover:dark:text-white/50"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M6 18 18 6M6 6l12 12"
                                                                    />
                                                                </svg>
                                                            )}

                                                            <input
                                                                ref={searchInputRef}
                                                                type="search"
                                                                placeholder="What happened...?"
                                                                className="ml-2 flex-1 border-none bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none focus:outline-none focus:ring-0 dark:text-white/80 sm:text-base"
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
                                                <div className="flex items-center rounded-xl border border-gray-300 bg-white/90 p-2 outline-none focus-within:ring-0 dark:border-gray-700 dark:bg-deepcharcoal">
                                                    <input
                                                        key={getPlaceDetails}
                                                        type="search"
                                                        placeholder="Search Address"
                                                        className="ml-2 flex-1 border-none bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none focus:ring-0 dark:text-white/80"
                                                        value={autoCompletionLocationSearch}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            if (value === '') {
                                                                setPlaceId('');
                                                                setAutoCompletionLocationSearch('');
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
                                                {autoCompletionDropdown && (
                                                    <ul className="relative z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-deepcharcoal">
                                                        {autoCompletionLoading ? (
                                                            <li className="flex items-center justify-center px-4 py-4">
                                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                                                            </li>
                                                        ) : (
                                                            autoCompletionResults.map(
                                                                (item, index) => (
                                                                    <li
                                                                        key={index}
                                                                        className="cursor-pointer px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-900"
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
                                                        <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-white/80">
                                                            Radius
                                                        </label>
                                                        <div
                                                            onClick={() => setIsRadiusModal(true)}
                                                            className="flex h-[50px] cursor-pointer items-center rounded-xl border border-gray-300 bg-white/90 p-2 outline-none transition focus-within:ring-0 dark:border-gray-700 dark:bg-deepcharcoal"
                                                        >
                                                            <input
                                                                readOnly
                                                                type="text"
                                                                className="w-full border-none bg-transparent text-sm text-gray-600 outline-none focus-within:ring-0 dark:text-white/80"
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
                                                        <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-white/80">
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
                                                        <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                                            Date & Time Range
                                                        </label>
                                                        <div className="flex h-[50px] items-center gap-2 rounded-xl border border-gray-300 bg-white/90 p-2 outline-none focus-within:ring-0 dark:border-gray-700 dark:bg-deepcharcoal">
                                                            <input
                                                                ref={rangeRef}
                                                                readOnly
                                                                placeholder="Select Date & Time Range"
                                                                className="w-full border-none bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none focus-within:ring-0 dark:text-white/80"
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
                                                                className="h-4 w-8 animate-spin fill-white/80 text-gray-200 dark:text-gray-200"
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
                        document.body,
                    )}
                </>
            )}

            {/* Place Detail Locaiton Fecthing Loading State */}
            {palceDetailFetching &&
                createPortal(
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
                        <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                        {/* Modal content */}
                        <div className="relative z-10 max-h-screen w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-deepcharcoal sm:p-8">
                            <div className="text-center">
                                <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                    Please Wait While We Are Setting up Location
                                </h2>

                                <div className="mt-5 flex items-center justify-center">
                                    <div role="status">
                                        <svg
                                            aria-hidden="true"
                                            className="h-8 w-8 animate-spin fill-indigo-600 text-gray-200 dark:text-gray-600"
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
                    document.body,
                )}
        </>
    );
};

export default GlobalSearch;
