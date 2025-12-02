import { router } from '@inertiajs/react';
import React, { useRef, useState } from 'react';
import useWindowSize from '@/Hooks/useWindowSize';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import getCookie from '@/Hooks/useGetCookie';
import Toast from '@/Components/Toast';
import Spinner from '@/Components/Spinner';

const GlobalFilterModal = ({ filterModal, setFilterModal }) => {



    const windowSize = useWindowSize();
    const isMobile = windowSize.width < 1024;
    const [filterSaving, setFilterSaving] = useState(false);

    const [showInfoToast, setShowInfoToast] = useState(false);
    const [infoMessage, setInfoMessage] = useState('');


    const filterModalRef = useRef(filterModal);
    const isClosingFilterModalRef = useRef(false);
    const previousUrlRef = useRef(window.location.href);

    // State for filters
    const [filters, setFilters] = useState(() => {
        const cookieValue = getCookie('post_preferences');

        const defaults = {
            text: true,
            images: true,
            videos: true,
            show_posts: true,
            show_products: true,
        };

        if (!cookieValue || cookieValue === 'null' || cookieValue === 'undefined') {
            return defaults;
        }

        try {
            const parsed = JSON.parse(decodeURIComponent(cookieValue));

            if (typeof parsed !== 'object' || parsed === null) {
                throw new Error('Invalid cookie format');
            }

            return {
                text: typeof parsed.text === 'boolean' ? parsed.text : defaults.text,
                images: typeof parsed.images === 'boolean' ? parsed.images : defaults.images,
                videos: typeof parsed.videos === 'boolean' ? parsed.videos : defaults.videos,
                show_posts:
                    typeof parsed.show_posts === 'boolean'
                        ? parsed.show_posts
                        : defaults.show_posts,
                show_products:
                    typeof parsed.show_products === 'boolean'
                        ? parsed.show_products
                        : defaults.show_products,
            };
        } catch (error) {
            console.warn('⚠️ Invalid post_preferences cookie. Using defaults.', error);
            return defaults;
        }
    });

    useEffect(() => {
        filterModalRef.current = filterModal;
    }, [filterModal]);

    // Toggle filter handler
    const handleFilterChange = (filterName, checked) => {
        const typeFilters = ['text', 'images', 'videos'];
        const visibilityFilters = ['show_posts', 'show_products'];

        if (!checked) {
            if (typeFilters.includes(filterName)) {
                const remainingTypeFilters = typeFilters.filter(
                    (key) => key !== filterName && filters[key],
                );

                if (remainingTypeFilters.length === 0) {
                    setShowInfoToast(true);
                    setInfoMessage('At least one post type filter must be selected');
                    return;
                }
            }

            if (visibilityFilters.includes(filterName)) {
                const remainingVisibilityFilters = visibilityFilters.filter(
                    (key) => key !== filterName && filters[key],
                );

                if (remainingVisibilityFilters.length === 0) {
                    setShowInfoToast(true);
                    setInfoMessage('At least one visibility filter must be selected');
                    return;
                }
            }
        }

        setFilters((prev) => ({
            ...prev,
            [filterName]: checked,
        }));


    };

    // Filters Saving In Cookie Or Updating Existing
    const handleSaveFilters = () => {
        setFilterSaving(true);
        document.cookie = `post_preferences=${JSON.stringify(filters)};path=/;max-age=31536000;SameSite=Lax;`;

        router.reload({
            onFinish: () => {

                setFilterSaving(false);

                router.visit(route('website.global-filters.index'))
            },
        });
    };





    const ToastModal = () => {
        return (
            showInfoToast && (
                <Toast
                    flash={{ info: infoMessage }}
                    onClosed={(type) => {
                        if (type === 'info') {
                            setInfoMessage(null);
                            setShowInfoToast(false);
                        }
                    }}
                />
            )
        );
    };

    // APPENDING QUERY PARAM AND BLOCKING BODY SCROLL WHEN MODAL IS OPEN
    useEffect(() => {
        if (filterModal) {

            const url = new URL(window.location.href);
            if (!url.searchParams.has('modal')) {
                url.searchParams.set('modal', 'global-filters');
                window.history.pushState({}, '', url.toString());
                previousUrlRef.current = url.toString();
            }


            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {

            const url = new URL(window.location.href);
            if (url.searchParams.get('modal') === 'global-filters') {
                url.searchParams.delete('modal');
                window.history.replaceState({}, '', url.toString());
                previousUrlRef.current = url.toString();
            }


            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }

        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [filterModal]);


    // POP STATE HANDLING
    useEffect(() => {
        // Flag for intentional navigation
        const isIntentionalNavigationRef = { current: false };

        const handlePopState = (e) => {
            const currentUrl = new URL(window.location.href);
            const currentParams = new URLSearchParams(currentUrl.search);

            const previousUrl = new URL(previousUrlRef.current);
            const previousParams = new URLSearchParams(previousUrl.search);

            const wasOnFilterModal = previousParams.get('modal') === 'global-filters';
            const isOnFilterModal = currentParams.get('modal') === 'global-filters';

            if (wasOnFilterModal && !isOnFilterModal) {


                e.stopImmediatePropagation();

                isClosingFilterModalRef.current = true;
                setFilterModal(false);

                previousUrlRef.current = window.location.href;

                setTimeout(() => {
                    isClosingFilterModalRef.current = false;
                }, 300);
                return;
            }

            if (!wasOnFilterModal && !isOnFilterModal) {
                previousUrlRef.current = window.location.href;
                return;
            }

            previousUrlRef.current = window.location.href;
        };

        const preventInertiaNavigation = (event) => {
            const url = event.detail?.visit?.url?.href || '';

            // Allow specific routes (intentional navigation)
            const isGlobalFiltersRoute = url.includes('global-filters');
            const isIntentionalNavigation = isIntentionalNavigationRef.current;

            // Allow intentional navigations
            if (isGlobalFiltersRoute || isIntentionalNavigation) {
                isIntentionalNavigationRef.current = false;
                return;
            }

        };

        window.addEventListener('popstate', handlePopState);
        const removeRouterEvent = router.on('before', preventInertiaNavigation);

        //Expose flag setter for intentional navigation
        window.__allowNextFilterNavigation = () => {
            isIntentionalNavigationRef.current = true;
        };

        return () => {
            window.removeEventListener('popstate', handlePopState);
            if (removeRouterEvent) removeRouterEvent();
            delete window.__allowNextFilterNavigation;
        };
    }, []);


    if (!filterModal) return null;

    // Mobile Design
    if (isMobile) {
        return createPortal(
            <>

                <div className="fixed inset-0 z-[50] flex flex-col bg-white dark:bg-deepcharcoal">
                    {/* Mobile Header */}
                    <div className="relative z-10 flex flex-col w-full overflow-y-auto text-black bg-white dark:bg-deepcharcoal dark:text-white/80 ">
                        <div className="flex items-center justify-center px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                            <button
                                onClick={() => setFilterModal(false)}
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
                                Filter Settings
                            </h2>
                        </div>
                    </div>

                    {/* Mobile Content */}
                    <div className="flex-1 pb-32 overflow-y-auto">
                        {/* POST TYPE FILTERS Section */}
                        <div className="px-5 py-6 bg-white border-b border-gray-200 dark:border-gray-900 dark:bg-deepcharcoal">
                            <h2 className="mb-5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                Post Type Filters
                            </h2>

                            <div className="space-y-4">
                                {/* Text Filter */}
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-medium text-gray-600 dark:text-white/80">
                                        Text
                                    </span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={filters.text}
                                            onChange={(e) =>
                                                handleFilterChange('text', e.target.checked)
                                            }
                                        />
                                        <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                    </label>
                                </div>

                                {/* Images Filter */}
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-medium text-gray-600 dark:text-white/80">
                                        Images
                                    </span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={filters.images}
                                            onChange={(e) =>
                                                handleFilterChange('images', e.target.checked)
                                            }
                                        />
                                        <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                    </label>
                                </div>

                                {/* Videos Filter */}
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-medium text-gray-600 dark:text-white/80">
                                        Videos
                                    </span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={filters.videos}
                                            onChange={(e) =>
                                                handleFilterChange('videos', e.target.checked)
                                            }
                                        />
                                        <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* VISIBILITY FILTER Section */}
                        <div className="px-5 py-6 bg-white dark:bg-deepcharcoal">
                            <h2 className="mb-5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                Visibility Filter
                            </h2>

                            <div className="space-y-4">
                                {/* Posts Filter */}
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-medium text-gray-600 dark:text-white/80">
                                        Posts
                                    </span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={filters.show_posts}
                                            onChange={(e) =>
                                                handleFilterChange('show_posts', e.target.checked)
                                            }
                                        />
                                        <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                    </label>
                                </div>

                                {/* Products Filter */}
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-medium text-gray-600 dark:text-white/80">
                                        Products
                                    </span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={filters.show_products}
                                            onChange={(e) =>
                                                handleFilterChange('show_products', e.target.checked)
                                            }
                                        />
                                        <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Apply Button - Mobile */}
                        <div className="m-auto w-[300px] px-5 py-6">
                            <button
                                onClick={() => handleSaveFilters()}
                                className="w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    {filterSaving && <Spinner customSize={'size-5'} />}
                                    <span>Apply Filters</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>


                <ToastModal />
            </>,
            document.getElementById('modal-root') || document.body,
        );
    }

    // Desktop Design
    return createPortal(
        <>

            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                    onClick={() => setFilterModal(false)}
                />
                <div className="relative w-full max-w-2xl bg-white border shadow-2xl rounded-2xl dark:bg-deepcharcoal border-black/5 dark:border-gray-700">


                    <div className="py-8 ">
                        {/* Desktop Title - Centered */}
                        <div className="pb-4 mb-8 text-center border-b border-gray-200 dark:border-gray-700">
                            <h1 className="text-2xl font-bold text-gray-600 dark:text-white/80">
                                Filter Settings
                            </h1>


                            <button
                                onClick={() => {
                                    setFilterModal(false)
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
                        </div>

                        {/* Desktop Card */}
                        <div className="overflow-hidden rounded-xl ">
                            {/* POST TYPE FILTERS Section */}
                            <div className="px-8 py-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="mb-6 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                    Post Type Filters
                                </h2>

                                <div className="space-y-5">
                                    {/* Text Filter */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-medium text-gray-600 dark:text-white/80">
                                            Text
                                        </span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={filters.text}
                                                onChange={(e) =>
                                                    handleFilterChange('text', e.target.checked)
                                                }
                                            />
                                            <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                        </label>
                                    </div>

                                    {/* Images Filter */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-medium text-gray-600 dark:text-white/80">
                                            Images
                                        </span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={filters.images}
                                                onChange={(e) =>
                                                    handleFilterChange('images', e.target.checked)
                                                }
                                            />
                                            <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                        </label>
                                    </div>

                                    {/* Videos Filter */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-medium text-gray-600 dark:text-white/80">
                                            Videos
                                        </span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={filters.videos}
                                                onChange={(e) =>
                                                    handleFilterChange('videos', e.target.checked)
                                                }
                                            />
                                            <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* VISIBILITY FILTER Section */}
                            <div className="px-8 py-6">
                                <h2 className="mb-6 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                    Visibility Filter
                                </h2>

                                <div className="space-y-5">
                                    {/* Posts Filter */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-medium text-gray-600 dark:text-white/80">
                                            Posts
                                        </span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={filters.show_posts}
                                                onChange={(e) =>
                                                    handleFilterChange('show_posts', e.target.checked)
                                                }
                                            />
                                            <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                        </label>
                                    </div>

                                    {/* Products Filter */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-medium text-gray-600 dark:text-white/80">
                                            Products
                                        </span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={filters.show_products}
                                                onChange={(e) =>
                                                    handleFilterChange('show_products', e.target.checked)
                                                }
                                            />
                                            <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Apply Button - Desktop */}
                        <div className="w-1/2 m-auto my-6">
                            <button
                                onClick={() => handleSaveFilters()}
                                className="w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-black"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    {filterSaving && <Spinner customSize={'size-5'} />}
                                    <span>Apply Filters</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            <ToastModal />
        </>,
        document.getElementById('modal-root') || document.body,
    );
};

export default GlobalFilterModal;
