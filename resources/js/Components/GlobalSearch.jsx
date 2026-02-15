import React, { useEffect, useRef, useState } from 'react';
import useWindowSize from '@/Hooks/useWindowSize';
import axios from 'axios';
import { createPortal } from 'react-dom';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import RadiusMap from './RadiusMap';
import { router } from '@inertiajs/react';
import getCookie from '@/Hooks/useGetCookie';
import Toast from './Toast';
import Spinner from './Spinner';
import WebSelectInput from './WebSelectInput';
import { useTranslation } from '@/Hooks/useTranslation';
import { ChevronLeft } from 'lucide-react';


const GlobalSearch = ({
    floors,
    google_map_api_key,
    additional_filters,
    defaultQuery = '',
    defaultPostFilters = {},
    defaultFiltersCleared = false,
}) => {
    const windowSize = useWindowSize();

    // Translation Hook
    const { __ } = useTranslation();

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
    const isRadiusModalRef = useRef(false);
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
                        'px-3 py-1 mt-4 mb-2 ml-auto mr-2 text-sm font-medium text-white transition bg-black rounded-md flatpickr-save-btn hover:bg-black/80 ';

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
                    setInfoMessage(__('Please select both start and end dates.'));
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
                        search: autoCompletionLocationSearch,
                    })
                    .then((res) => {
                        const predictions = res.data.data.predictions || [];

                        setAutoCompletionResults(predictions);
                        setAutoCompletionLoading(false);
                        if (predictions.length < 1) {
                            setInfoMessage(res.data.message || __('No Results Found'));
                            setShowInfoMessage(true);
                            setAutoCompletionDropdown(false);
                        }
                    });
            }
        } catch (e) {
            setAutoCompletionLoading(false);
            setAutoCompletionDropdown(true);
            setErrorMessage(e.message || __('Something went wrong'));
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

            // if (autoCompletionLocationSearch != '' && autoCompletionLocationSearch?.length < 3) {
            //     setInfoMessage('Please Enter More Details To Search');
            //     setShowInfoMessage(true);
            // }
            // if (autoCompletionLocationSearch?.length > 2 && placeId == '') {
            //     setAutoCompletionLoading(false);
            //     setAutoCompletionDropdown(false);
            //     setAutoCompletionResults([]);

            //     autoCompletions();
            // }

            if (placeId == '') {
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
                setErrorMessage(e.message || __('Something went wrong'));
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
                setInfoMessage(__('Please Select (To Floor)'));
                setShowInfoMessage(true);
                return;
            } else if (postFilters.to_floor_id != '' && postFilters.from_floor_id == '') {
                setInfoMessage(__('Please Select (From Floor)'));
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
                setInfoMessage(__('Please Select (To Floor)'));
                setShowInfoMessage(true);
                return;
            } else if (postFilters.to_floor_id != '' && postFilters.from_floor_id == '') {
                setInfoMessage(__('Please Select (From Floor)'));
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
                            setInfoMessage(__('To Apply Search Please Search Anything Else'));
                            setShowInfoMessage(true);
                            return;
                        }

                        setInfoMessage(__('Please search something first'));
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

        isRadiusModalRef.current = isRadiusModal;
        if (isRadiusModal) {
            url.searchParams.set('modal2', 'radius-filters');
        } else {
            url.searchParams.delete('modal2');
        }

        window.history.replaceState({}, '', url);
    }, [isSpatiotemporalFilters, isRadiusModal]);

    // Handle browser/mobile back button to close modals
    useEffect(() => {
        const handlePopState = (e) => {

            if (isRadiusModalRef.current) {
                setIsRadiusModal(false);
                return;
            }


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

    // Delete Search History and fetching new onces (OLD)
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


    // Clearing Search States when spatiotemporal filter modla closes
    useEffect(() => {

        if (!isSpatiotemporalFilters) {
            setSearchQuery('');
            setAutoCompletionLocationSearch('');
            setAutoCompletionDropdown(false);
            setAutoCompletionResults([]);
            setAutoCompletionLoading(false);
            setAddressReady(false);
        }

    }, [isSpatiotemporalFilters]);

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

            <div className="sticky top-0 z-[50] mx-auto w-full backdrop-blur-md transition-all duration-300 ">
                <div className="mx-auto my-2 sm:my-3">
                    <div className="relative flex items-center w-full bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
                        <div className="relative w-full">
                            <div className="relative flex items-center w-full p-3 rounded-md"
                                onClick={() => searchInputRef.current?.focus()}
                            >

                                {/* Magnifire Icon */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="absolute cursor-pointer text-main-text-light left-3 sm:left-4 size-5 dark:text-main-text-dark"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                    />
                                </svg>

                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    className="flex-1 ml-6 text-xs placeholder-gray-400 bg-transparent border-none outline-none text-main-text-light left-3 size-5 dark:text-main-text-dark focus:outline-none focus:ring-0 sm:text-base"
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


                                <button
                                    className={`transition  rounded-full text-main-text-light dark:text-main-text-dark ${searchQuery !== '' ? 'opaticy-100' : 'opacity-0 pointer-events-none'}`}
                                    onClick={() => {
                                        setSearchQuery('');
                                        setIsPrefChanged(true);
                                        searchInputRef.current?.focus();
                                    }}
                                >
                                    <svg

                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="text-main-text-light size-5 dark:text-main-text-dark"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 18 18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>

                            </div>
                        </div>



                        {additional_filters && (
                            <button
                                className="mr-3 transition rounded-full text-main-text-light dark:text-main-text-dark sm:mr-2 sm:p-2"
                                onClick={() => setIsSpatiotemporalFilters(true)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="text-main-text-light size-5 dark:text-main-text-dark">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
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
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
                                {/* Backdrop */}
                                <div
                                    onClick={() => setIsSpatiotemporalFilters(false)}
                                    className="fixed inset-0 transition-opacity duration-300 bg-black/30 "
                                />

                                {/* Modal Card */}
                                <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-auto p-4 sm:p-6 lg:p-8 border  border-surface-1-light rounded-md bg-backgroundLight dark:border-surface-3-dark dark:bg-surface-1-dark dark:text-white">
                                    {/* Header */}
                                    <div className="flex items-center justify-start shrink-0 ">
                                        <h2 className="text-xl font-semibold tracking-tight text-main-text-light dark:text-main-text-dark">
                                            {__('Advanced Search')}
                                        </h2>

                                    </div>


                                    {/* Content */}
                                    <div className="pr-1 mt-3 space-y-3 overflow-y-auto sm:space-y-4">
                                        <section className="w-full mt-4">
                                            {/* Search Bar */}
                                            <div className="z-[50] mx-auto w-full transition-all duration-300">
                                                <div className="py-2 mx-auto sm:py-3">
                                                    <label htmlFor="advanced_search_input" className="mx-1 text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                                        {__('Keywords Search')}
                                                    </label>
                                                    <div className="flex items-center w-full p-1 mt-2 bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-2-dark sm:p-1">
                                                        <div className="relative flex items-center w-full rounded-md">
                                                            <input
                                                                ref={modalSearchInputRef}
                                                                type="text"
                                                                id='advanced_search_input'
                                                                placeholder={__('Enter Keywords')}
                                                                className="flex-1 ml-0 text-sm placeholder-gray-400 bg-transparent border-none outline-none text-main-text-light focus:ring-0 dark:text-main-text-dark"
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

                                                            {searchQuery !== '' && (
                                                                <button
                                                                    className="mr-2 rounded-full p-1.5 text-main-text-light transition dark:bg-surface-3-dark bg-surface-1-light  dark:text-main-text-dark sm:p-2"
                                                                    onClick={() => {
                                                                        setSearchQuery('');
                                                                        setIsPrefChanged(true);
                                                                        searchInputRef.current?.focus();
                                                                    }}
                                                                >
                                                                    <svg

                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        strokeWidth={2}
                                                                        stroke="currentColor"
                                                                        className="text-main-text-light size-4 dark:text-main-text-dark"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            d="M6 18 18 6M6 6l12 12"
                                                                        />
                                                                    </svg>
                                                                </button>


                                                            )}

                                                        </div>


                                                    </div>
                                                </div>
                                            </div>

                                            {/* Address Input */}
                                            <div className="mt-3 mb-5">
                                                <label htmlFor="advanced_address_input" className="mx-1 text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                                    {__('Location')}
                                                </label>
                                                <div className="flex items-center p-1 mt-2 bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-2-dark">
                                                    <div className="relative flex items-center w-full rounded-md">

                                                        <input
                                                            key={getPlaceDetails}
                                                            id='advanced_address_input'
                                                            placeholder={__('Enter an address to filter by location')}
                                                            type="search"
                                                            className="flex-1 ml-0 text-sm text-black placeholder-gray-400 bg-transparent border-none outline-none focus:ring-0 dark:text-main-text-dark"
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
                                                    <ul className="relative z-50 w-full mt-2 overflow-y-auto border rounded-md bg-backgroundLight border-surface-3-light max-h-60 dark:border-surface-3-dark dark:bg-surface-2-dark">
                                                        {autoCompletionLoading ? (
                                                            <li className="flex items-center justify-center px-4 py-4">
                                                                <Spinner customSize={"size-5"} />
                                                            </li>
                                                        ) : (
                                                            autoCompletionResults.map(
                                                                (item, index) => (
                                                                    <li
                                                                        key={index}
                                                                        className="px-4 py-2 text-sm cursor-pointer text-main-text-light hover:bg-surface-1-light dark:text-sub-text-dark dark:hover:bg-surface-3-dark"
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
                                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                                    {/* Radius */}
                                                    <div className="relative col-span-1">
                                                        <label className="block mx-1 mb-2 text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                                            {__('Radius')} ({__('Optional')})
                                                        </label>
                                                        <div
                                                            onClick={() => setIsRadiusModal(true)}
                                                            className="flex h-[43px] cursor-pointer items-center rounded-md border border-surface-3-light bg-white p-1 outline-none transition focus:outline-none focus:ring-0 dark:border-surface-3-dark dark:bg-surface-2-dark"
                                                        >
                                                            <input
                                                                readOnly
                                                                type="text"
                                                                className="flex-1 w-full text-sm text-black placeholder-gray-400 bg-transparent border-none outline-none focus:outline-none focus:ring-0 dark:text-white/80"
                                                                value={
                                                                    (
                                                                        postFilters.radius / 1000
                                                                    ).toFixed(2) + ' km'
                                                                }
                                                            />


                                                            {postFilters?.radius != 0 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setPostFilters((prev) => ({ ...prev, radius: 0 }));
                                                                    }}
                                                                    className="flex items-center justify-center w-6 h-6 mx-1 rounded-full bg-surface-1-light dark:bg-surface-3-dark "
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        strokeWidth={3}
                                                                        stroke="currentColor"
                                                                        className="w-3 h-3"
                                                                    >
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>


                                                    </div>

                                                    <RadiusMap
                                                        key={isRadiusModal}
                                                        isModalOpen={isRadiusModal}
                                                        setIsModalOpen={setIsRadiusModal}
                                                        lat={postFilters.address.lat}
                                                        lng={postFilters.address.lng}
                                                        __={__}
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
                                                        <label className="mx-1 mb-2 text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                                            {__('Floor Range')}({__('Optional')})
                                                        </label>
                                                        <div className="flex items-start justify-between gap-2">
                                                            <WebSelectInput
                                                                Id="from_floor_id"
                                                                Name="from_floor_id"
                                                                Value={postFilters.from_floor_id}
                                                                items={floors.from_floors}
                                                                itemKey="name"
                                                                Placeholder={__('From Floor')}
                                                                customPlaceHolder={true}
                                                                Action={(value) => {
                                                                    setPostFilters({
                                                                        ...postFilters,
                                                                        from_floor_id: value,
                                                                    });

                                                                    setIsPrefChanged(true);
                                                                }}
                                                                CustomCss="w-full border-none bg-transparent text-sm text-gray-600 dark:text-white/80 placeholder-gray-400 outline-none focus:outline-none "
                                                            />
                                                            <span className="mt-3 text-black dark:text-white">
                                                                —
                                                            </span>
                                                            <WebSelectInput
                                                                Id="to_floor_id"
                                                                Name="to_floor_id"
                                                                Value={postFilters.to_floor_id}
                                                                items={floors.to_floors}
                                                                itemKey="name"
                                                                Placeholder={__('To Floor')}
                                                                customPlaceHolder={true}
                                                                Action={(value) => {
                                                                    setPostFilters({
                                                                        ...postFilters,
                                                                        to_floor_id: value,
                                                                    });

                                                                    setIsPrefChanged(true);
                                                                }}
                                                                CustomCss="w-full border-none bg-transparent text-sm placeholder-gray-400 outline-none focus:outline-none text-gray-600 dark:text-white/80"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Time Range */}
                                                    <div className="col-span-3">
                                                        <label className="mx-1 mb-2 text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                                            {__('Date & Time Range')} ({__('Optional')})
                                                        </label>
                                                        <div className="flex h-[50px] mt-2 items-center gap-2 rounded-md border border-surface-3-light bg-white p-1 outline-none transition focus:outline-none focus:ring-0 dark:border-surface-3-dark dark:bg-surface-2-dark">
                                                            <input
                                                                ref={rangeRef}
                                                                readOnly
                                                                placeholder={__('Select Date & Time Range')}
                                                                className="w-full text-sm placeholder-gray-400 bg-transparent border-none outline-none text-main-text-light focus:outline-none focus:ring-0 dark:text-main-text-dark"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </section>

                                        {isPrefChanged && (
                                            <div className="flex justify-end pt-5">
                                                <button
                                                    onClick={() => ApplyFilter('query')}
                                                    className="w-[200px] px-4 py-3 text-base font-semibold text-main-text-dark transition-colors bg-main-text-light rounded-md dark:text-main-text-light dark:bg-main-text-dark dark:hover:bg-main-text-dark/80 hover:bg-main-text-light/80"
                                                >
                                                    {searchApplying && (
                                                        <div role="status">
                                                            <svg
                                                                aria-hidden="true"
                                                                className="w-8 h-4 text-gray-200 animate-spin fill-white/80 dark:text-main-text-dark"
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
                                                    {__('Apply Search')}
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
                                <div className="relative z-10 flex flex-col w-full h-full overflow-y-auto text-black bg-backgroundLight dark:bg-backgroundDark dark:text-main-text-dark sm:pb-20">
                                    {/* Top Bar */}
                                    <div className="flex items-center justify-center px-4 py-3">
                                        <button
                                            onClick={() => setIsSpatiotemporalFilters(false)}
                                            className="absolute p-1 rounded-full left-4"
                                        >
                                            <ChevronLeft />
                                        </button>

                                        <h2 className="mx-10 text-xl font-semibold tracking-tight text-main-text-light dark:text-main-text-dark">
                                            {__('Advanced Search')}
                                        </h2>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 px-4 space-y-6">
                                        <section className="w-full mt-4">
                                            {/* Search Bar */}
                                            <div className="z-[50] mx-auto w-full transition-all duration-300">
                                                <div className="py-2 mx-auto sm:py-3">
                                                    <label htmlFor="advanced_search_input" className="mx-1 text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                                        {__("Keywords Search")}
                                                    </label>
                                                    <div className="flex items-center w-full p-1 mt-2 bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-2-dark sm:p-1">
                                                        <div className="relative flex items-center w-full rounded-md">
                                                            <input
                                                                ref={modalSearchInputRef}
                                                                type="text"
                                                                id='advanced_search_input'
                                                                placeholder={__('Enter Keywords')}
                                                                className="flex-1 ml-0 text-sm placeholder-gray-400 bg-transparent border-none outline-none text-main-text-light focus:ring-0 dark:text-main-text-dark"
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

                                                            {searchQuery !== '' && (
                                                                <button
                                                                    className="mr-2 rounded-full p-1.5 text-main-text-light transition dark:bg-surface-3-dark bg-surface-1-light  dark:text-main-text-dark sm:p-2"
                                                                    onClick={() => {
                                                                        setSearchQuery('');
                                                                        setIsPrefChanged(true);
                                                                        searchInputRef.current?.focus();
                                                                    }}
                                                                >
                                                                    <svg

                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        strokeWidth={2}
                                                                        stroke="currentColor"
                                                                        className="text-main-text-light size-4 dark:text-main-text-dark"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            d="M6 18 18 6M6 6l12 12"
                                                                        />
                                                                    </svg>
                                                                </button>


                                                            )}

                                                        </div>


                                                    </div>
                                                </div>
                                            </div>

                                            {/* Address Input */}
                                            <div className="mt-3 mb-5">
                                                <label htmlFor="advanced_address_input" className="mx-1 text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                                    {__('Location')}
                                                </label>
                                                <div className="flex items-center p-1 mt-2 bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-2-dark">
                                                    <div className="relative flex items-center w-full rounded-md">

                                                        <input
                                                            key={getPlaceDetails}
                                                            id='advanced_address_input'
                                                            placeholder={__('Enter an address to filter by location')}
                                                            type="search"
                                                            className="flex-1 ml-0 text-sm text-black placeholder-gray-400 bg-transparent border-none outline-none focus:ring-0 dark:text-main-text-dark"
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
                                                    <ul className="relative z-50 w-full mt-2 overflow-y-auto border rounded-md bg-backgroundLight border-surface-3-light max-h-60 dark:border-surface-3-dark dark:bg-surface-2-dark">
                                                        {autoCompletionLoading ? (
                                                            <li className="flex items-center justify-center px-4 py-4">
                                                                <Spinner customSize={"size-5"} />
                                                            </li>
                                                        ) : (
                                                            autoCompletionResults.map(
                                                                (item, index) => (
                                                                    <li
                                                                        key={index}
                                                                        className="px-4 py-2 text-sm cursor-pointer text-main-text-light hover:bg-surface-1-light dark:text-sub-text-dark dark:hover:bg-surface-3-dark"
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
                                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                                    {/* Radius */}
                                                    <div className="relative col-span-3">
                                                        <label className="block mx-1 mb-2 text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                                            {__('Radius')} ({__('Optional')})
                                                        </label>
                                                        <div
                                                            onClick={() => setIsRadiusModal(true)}
                                                            className="flex h-[43px] cursor-pointer items-center rounded-md border border-surface-3-light bg-white p-1 outline-none transition focus:outline-none focus:ring-0 dark:border-surface-3-dark dark:bg-surface-2-dark"
                                                        >
                                                            <input
                                                                readOnly
                                                                type="text"
                                                                className="flex-1 w-full text-sm text-black placeholder-gray-400 bg-transparent border-none outline-none focus:outline-none focus:ring-0 dark:text-white/80"
                                                                value={
                                                                    (
                                                                        postFilters.radius / 1000
                                                                    ).toFixed(2) + ' km'
                                                                }
                                                            />


                                                            {postFilters?.radius != 0 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setPostFilters((prev) => ({ ...prev, radius: 0 }));
                                                                    }}
                                                                    className="flex items-center justify-center w-6 h-6 mx-1 rounded-full bg-surface-1-light dark:bg-surface-3-dark "
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        strokeWidth={3}
                                                                        stroke="currentColor"
                                                                        className="w-3 h-3"
                                                                    >
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>


                                                    </div>

                                                    <RadiusMap
                                                        key={isRadiusModal}
                                                        isModalOpen={isRadiusModal}
                                                        setIsModalOpen={setIsRadiusModal}
                                                        __={__}
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
                                                    <div className="col-span-3">
                                                        <label className="mx-1 mb-2 text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                                            {__('Floor Range')} ({__('Optional')})
                                                        </label>
                                                        <div className="flex items-start justify-between gap-2">
                                                            <WebSelectInput
                                                                Id="from_floor_id"
                                                                Name="from_floor_id"
                                                                Value={postFilters.from_floor_id}
                                                                items={floors.from_floors}
                                                                itemKey="name"
                                                                Placeholder={__("From Floor")}
                                                                customPlaceHolder={true}
                                                                Action={(value) => {
                                                                    setPostFilters({
                                                                        ...postFilters,
                                                                        from_floor_id: value,
                                                                    });

                                                                    setIsPrefChanged(true);
                                                                }}
                                                                CustomCss="w-full border-none bg-transparent text-sm text-gray-600 dark:text-white/80 placeholder-gray-400 outline-none focus:outline-none "
                                                            />
                                                            <span className="mt-3 text-black dark:text-white">
                                                                —
                                                            </span>
                                                            <WebSelectInput
                                                                Id="to_floor_id"
                                                                Name="to_floor_id"
                                                                Value={postFilters.to_floor_id}
                                                                items={floors.to_floors}
                                                                itemKey="name"
                                                                Placeholder={__("To Floor")}
                                                                customPlaceHolder={true}
                                                                Action={(value) => {
                                                                    setPostFilters({
                                                                        ...postFilters,
                                                                        to_floor_id: value,
                                                                    });

                                                                    setIsPrefChanged(true);
                                                                }}
                                                                CustomCss="w-full border-none bg-transparent text-sm placeholder-gray-400 outline-none focus:outline-none text-gray-600 dark:text-white/80"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Time Range */}
                                                    <div className="col-span-3">
                                                        <label className="mx-1 mb-2 text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                                            {__('Date & Time Range')} ({__('Optional')})
                                                        </label>
                                                        <div className="flex h-[50px] mt-2 items-center gap-2 rounded-md border border-surface-3-light bg-white p-1 outline-none transition focus:outline-none focus:ring-0 dark:border-surface-3-dark dark:bg-surface-2-dark">
                                                            <input
                                                                ref={rangeRef}
                                                                readOnly
                                                                placeholder={__('Select Date & Time Range')}
                                                                className="w-full text-sm placeholder-gray-400 bg-transparent border-none outline-none text-main-text-light focus:outline-none focus:ring-0 dark:text-main-text-dark"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </section>

                                        {isPrefChanged && (
                                            <div className="flex justify-end pt-5">
                                                <button
                                                    onClick={() => ApplyFilter('query')}
                                                    className="w-[200px] px-4 py-3 text-base font-semibold text-main-text-dark transition-colors bg-main-text-light rounded-md dark:text-main-text-light dark:bg-main-text-dark dark:hover:bg-main-text-dark/80 hover:bg-main-text-light/80"
                                                >
                                                    {searchApplying && (
                                                        <div role="status">
                                                            <svg
                                                                aria-hidden="true"
                                                                className="w-8 h-4 text-gray-200 animate-spin fill-white/80 dark:text-main-text-dark"
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
                                                    {__('Apply Search')}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ),
                        document.getElementById('modal-root') || document.body,
                    )}
                </>
            )}

            {/* Place Detail Locaiton Fecthing Loading State */}
            {palceDetailFetching &&
                createPortal(
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                        <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                        {/* Modal content */}
                        <div className="relative z-10 w-full max-w-lg max-h-screen p-6 overflow-y-auto border rounded-md bg-backgroundLight border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark sm:p-8">
                            <div className="text-center">
                                <h2 className="text-lg font-medium text-main-text-light dark:text-main-text-dark">
                                    {__('Please Wait While We Are Setting up Location')}
                                </h2>

                                <div className="flex items-center justify-center mt-5">
                                    <Spinner customSize={"size-6"} />
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.getElementById('modal-root') || document.body,
                )}

            {/* Searching On Main Searching Archive Page Loader */}
            {searchApplying && !isSpatiotemporalFilters && (
                <>
                    {createPortal(
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                            <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                            {/* Modal content */}
                            <div className="relative z-10 w-full max-w-lg max-h-screen p-6 overflow-y-auto border rounded-md bg-backgroundLight border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark sm:p-8">
                                <div className="text-center">
                                    <h2 className="text-lg font-medium text-main-text-light dark:text-main-text-dark">
                                        {__('Please Wait While We Are Finding Results For You')}
                                    </h2>

                                    <div className="flex items-center justify-center mt-5">
                                        <Spinner customSize={"size-6"} />
                                    </div>
                                </div>
                            </div>
                        </div>,
                        document.getElementById('modal-root') || document.body,
                    )}
                </>
            )}



        </>


    );
};

export default GlobalSearch;
