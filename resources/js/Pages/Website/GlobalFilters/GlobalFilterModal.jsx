import { router } from '@inertiajs/react';
import React, { useRef, useState } from 'react';
import useWindowSize from '@/Hooks/useWindowSize';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import getCookie from '@/Hooks/useGetCookie';
import Toast from '@/Components/Toast';
import Spinner from '@/Components/Spinner';
import { useTranslation } from '@/Hooks/useTranslation';
import { ChevronLeft } from 'lucide-react';

const GlobalFilterModal = ({ isOpen, close, previousUrlRef }) => {
    const windowSize = useWindowSize();

    // Translation Hook
    const { __ } = useTranslation();

    const isMobile = windowSize.width <= 1024;
    const [filterSaving, setFilterSaving] = useState(false);

    const [showInfoToast, setShowInfoToast] = useState(false);
    const [infoMessage, setInfoMessage] = useState('');

    const filterModalRef = useRef(isOpen);
    const isClosingFilterModalRef = useRef(false);

    useEffect(() => {
        if (isOpen) {
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [isOpen]);

    // State for filters
    const [filters, setFilters] = useState(() => {
        const cookieValue = getCookie('post_preferences');

        const defaults = {
            text: true,
            images: true,
            videos: true,
            show_posts: true,
            show_products: true,
            video_autoplay: false,
        };

        if (!cookieValue || cookieValue === 'null' || cookieValue === 'undefined') {
            return defaults;
        }

        try {
            const parsed = JSON.parse(decodeURIComponent(cookieValue));

            if (typeof parsed !== 'object' || parsed === null) {
                throw new Error(__('Invalid cookie format'));
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

                video_autoplay:
                    typeof parsed.video_autoplay === 'boolean'
                        ? parsed.video_autoplay
                        : defaults.video_autoplay,
            };
        } catch (error) {
            console.warn('⚠️' + __('Invalid post_preferences cookie. Using defaults.'), error);
            return defaults;
        }
    });

    useEffect(() => {
        filterModalRef.current = isOpen;
    }, [isOpen]);

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
                    setInfoMessage(__('At least one post type filter must be selected'));
                    return;
                }
            }

            if (visibilityFilters.includes(filterName)) {
                const remainingVisibilityFilters = visibilityFilters.filter(
                    (key) => key !== filterName && filters[key],
                );

                if (remainingVisibilityFilters.length === 0) {
                    setShowInfoToast(true);
                    setInfoMessage(__('At least one visibility filter must be selected'));
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
                window.location.reload();
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
                close();

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

    if (!isOpen) return null;

    // Mobile Design
    if (isMobile) {
        return createPortal(
            <>
                <div className="fixed inset-0 z-[50] flex flex-col bg-backgroundLight dark:bg-backgroundDark">
                    {/* Mobile Header */}
                    <div className="relative z-10 flex w-full flex-col overflow-y-auto bg-backgroundLight text-main-text-light dark:bg-backgroundDark dark:text-main-text-dark">
                        <div className="flex items-center justify-center px-4 py-3">
                            <button
                                onClick={close}
                                className="absolute left-4 rounded-full p-1 text-main-text-light dark:text-main-text-dark"
                            >
                                <ChevronLeft />
                            </button>

                            <h2 className="mx-10 text-xl font-semibold text-main-text-light dark:text-main-text-dark">
                                {__('Filter Settings')}
                            </h2>
                        </div>
                    </div>

                    {/* Mobile Content */}
                    <div className="flex-1 overflow-y-auto pb-32 scrollbar-none">
                        {/* POST TYPE FILTERS Section */}
                        <div className="border-b border-surface-1-light bg-backgroundLight px-5 py-6 dark:border-surface-3-dark dark:bg-backgroundDark">
                            <h2 className="mb-5 text-xs font-semibold text-sub-text-light dark:text-sub-text-dark">
                                {__('Post Type Filters')}
                            </h2>

                            <div className="space-y-4">
                                {/* Text Filter */}
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-medium text-sub-text-light dark:text-sub-text-dark">
                                        {__('Text')}
                                    </span>
                                    <label className="relative inline-flex cursor-pointer items-center">
                                        <input
                                            type="checkbox"
                                            className="peer sr-only"
                                            checked={filters.text}
                                            onChange={(e) =>
                                                handleFilterChange('text', e.target.checked)
                                            }
                                        />
                                        <div className="h-5 w-9 rounded-full bg-gray-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-4 dark:bg-[#646464] dark:after:bg-[#1e1e1e] dark:peer-checked:bg-[#e1e1e1]" />
                                    </label>
                                </div>

                                {/* Images Filter */}
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-medium text-sub-text-light dark:text-sub-text-dark">
                                        {__('Images')}
                                    </span>
                                    <label className="relative inline-flex cursor-pointer items-center">
                                        <input
                                            type="checkbox"
                                            className="peer sr-only"
                                            checked={filters.images}
                                            onChange={(e) =>
                                                handleFilterChange('images', e.target.checked)
                                            }
                                        />
                                        <div className="h-5 w-9 rounded-full bg-gray-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-4 dark:bg-[#646464] dark:after:bg-[#1e1e1e] dark:peer-checked:bg-[#e1e1e1]" />
                                    </label>
                                </div>

                                {/* Videos Filter */}
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-medium text-sub-text-light dark:text-sub-text-dark">
                                        {__('Videos')}
                                    </span>
                                    <label className="relative inline-flex cursor-pointer items-center">
                                        <input
                                            type="checkbox"
                                            className="peer sr-only"
                                            checked={filters.videos}
                                            onChange={(e) =>
                                                handleFilterChange('videos', e.target.checked)
                                            }
                                        />
                                        <div className="h-5 w-9 rounded-full bg-gray-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-4 dark:bg-[#646464] dark:after:bg-[#1e1e1e] dark:peer-checked:bg-[#e1e1e1]" />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* VISIBILITY FILTER Section */}
                        <div className="border-b border-surface-1-light bg-backgroundLight px-5 py-6 dark:border-surface-3-dark dark:bg-backgroundDark">
                            <h2 className="mb-5 text-xs font-semibold text-sub-text-light dark:text-sub-text-dark">
                                {__('Visibility Filters')}
                            </h2>

                            <div className="space-y-4">
                                {/* Posts Filter */}
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-medium text-sub-text-light dark:text-sub-text-dark">
                                        {__('Posts')}
                                    </span>
                                    <label className="relative inline-flex cursor-pointer items-center">
                                        <input
                                            type="checkbox"
                                            className="peer sr-only"
                                            checked={filters.show_posts}
                                            onChange={(e) =>
                                                handleFilterChange('show_posts', e.target.checked)
                                            }
                                        />
                                        <div className="h-5 w-9 rounded-full bg-gray-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-4 dark:bg-[#646464] dark:after:bg-[#1e1e1e] dark:peer-checked:bg-[#e1e1e1]" />
                                    </label>
                                </div>

                                {/* Products Filter */}
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-medium text-sub-text-light dark:text-sub-text-dark">
                                        {__('Products')}
                                    </span>
                                    <label className="relative inline-flex cursor-pointer items-center">
                                        <input
                                            type="checkbox"
                                            className="peer sr-only"
                                            checked={filters.show_products}
                                            onChange={(e) =>
                                                handleFilterChange(
                                                    'show_products',
                                                    e.target.checked,
                                                )
                                            }
                                        />
                                        <div className="h-5 w-9 rounded-full bg-gray-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-4 dark:bg-[#646464] dark:after:bg-[#1e1e1e] dark:peer-checked:bg-[#e1e1e1]" />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Video Auto Play FILTER Section */}
                        <div className="px-5 py-6">
                            <h2 className="mb-6 text-xs font-semibold text-sub-text-light dark:text-sub-text-dark">
                                {__('Video AutoPlay Filter')}
                            </h2>

                            <div className="space-y-5">
                                {/* Auto Play Filter */}
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-medium text-sub-text-light dark:text-sub-text-dark">
                                        {__('Autoplay')}
                                    </span>
                                    <label className="relative inline-flex cursor-pointer items-center">
                                        <input
                                            type="checkbox"
                                            className="peer sr-only"
                                            checked={filters.video_autoplay}
                                            onChange={(e) =>
                                                handleFilterChange(
                                                    'video_autoplay',
                                                    e.target.checked,
                                                )
                                            }
                                        />
                                        <div className="h-5 w-9 rounded-full bg-gray-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-4 dark:bg-[#646464] dark:after:bg-[#1e1e1e] dark:peer-checked:bg-[#e1e1e1]" />
                                    </label>
                                </div>
                            </div>
                        </div>
                        {/* Apply Button - Mobile */}
                        <div className="m-auto my-6 w-1/2">
                            <button
                                onClick={() => handleSaveFilters()}
                                className="w-full rounded-md bg-main-text-light px-4 py-3 text-base font-semibold text-main-text-dark transition-colors hover:bg-black/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    {filterSaving && (
                                        <Spinner
                                            customSize={'size-4'}
                                            Color={'fill-black dark:fill-white'}
                                        />
                                    )}
                                    <span>{__('Apply Filters')}</span>
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
                <div className="fixed inset-0 bg-black/30" onClick={close} />
                <div className="relative w-full max-w-3xl rounded-md border border-surface-1-light bg-backgroundLight dark:border-surface-3-dark dark:bg-surface-1-dark">
                    <div className="pt-8">
                        {/* Desktop Title - Centered */}
                        <div className="px-8 pb-4 text-start">
                            <h1 className="text-xl font-semibold text-main-text-light dark:text-main-text-dark">
                                {__('Filter Settings')}
                            </h1>
                        </div>

                        {/* Desktop Card */}
                        <div className="overflow-hidden rounded-md">
                            {/* POST TYPE FILTERS Section */}
                            <div className="border-b border-surface-3-light px-8 py-6 pb-4 dark:border-surface-3-dark">
                                <h2 className="mb-6 text-xs font-semibold text-sub-text-light dark:text-white">
                                    {__('Post Type Filters')}
                                </h2>

                                <div className="space-y-5">
                                    {/* Text Filter */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-medium text-sub-text-light dark:text-sub-text-dark">
                                            {__('Text')}
                                        </span>
                                        <label className="relative inline-flex cursor-pointer items-center">
                                            <input
                                                type="checkbox"
                                                className="peer sr-only"
                                                checked={filters.text}
                                                onChange={(e) =>
                                                    handleFilterChange('text', e.target.checked)
                                                }
                                            />
                                            <div className="h-5 w-9 rounded-full bg-gray-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-4 dark:bg-[#646464] dark:after:bg-[#1e1e1e] dark:peer-checked:bg-[#e1e1e1]" />
                                        </label>
                                    </div>

                                    {/* Images Filter */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-medium text-sub-text-light dark:text-sub-text-dark">
                                            {__('Images')}
                                        </span>
                                        <label className="relative inline-flex cursor-pointer items-center">
                                            <input
                                                type="checkbox"
                                                className="peer sr-only"
                                                checked={filters.images}
                                                onChange={(e) =>
                                                    handleFilterChange('images', e.target.checked)
                                                }
                                            />
                                            <div className="h-5 w-9 rounded-full bg-gray-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-4 dark:bg-[#646464] dark:after:bg-[#1e1e1e] dark:peer-checked:bg-[#e1e1e1]" />
                                        </label>
                                    </div>

                                    {/* Videos Filter */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-medium text-sub-text-light dark:text-sub-text-dark">
                                            {__('Videos')}
                                        </span>
                                        <label className="relative inline-flex cursor-pointer items-center">
                                            <input
                                                type="checkbox"
                                                className="peer sr-only"
                                                checked={filters.videos}
                                                onChange={(e) =>
                                                    handleFilterChange('videos', e.target.checked)
                                                }
                                            />
                                            <div className="h-5 w-9 rounded-full bg-gray-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-4 dark:bg-[#646464] dark:after:bg-[#1e1e1e] dark:peer-checked:bg-[#e1e1e1]" />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* VISIBILITY FILTER Section */}
                            <div className="border-b border-surface-3-light px-8 py-6 pb-4 dark:border-surface-3-dark">
                                <h2 className="mb-6 text-xs font-semibold text-sub-text-light dark:text-sub-text-dark">
                                    {__('Visibility Filters')}
                                </h2>

                                <div className="space-y-5">
                                    {/* Posts Filter */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-medium text-sub-text-light dark:text-sub-text-dark">
                                            {__('Posts')}
                                        </span>
                                        <label className="relative inline-flex cursor-pointer items-center">
                                            <input
                                                type="checkbox"
                                                className="peer sr-only"
                                                checked={filters.show_posts}
                                                onChange={(e) =>
                                                    handleFilterChange(
                                                        'show_posts',
                                                        e.target.checked,
                                                    )
                                                }
                                            />
                                            <div className="h-5 w-9 rounded-full bg-gray-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-4 dark:bg-[#646464] dark:after:bg-[#1e1e1e] dark:peer-checked:bg-[#e1e1e1]" />
                                        </label>
                                    </div>

                                    {/* Products Filter */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-medium text-sub-text-light dark:text-sub-text-dark">
                                            {__('Products')}
                                        </span>
                                        <label className="relative inline-flex cursor-pointer items-center">
                                            <input
                                                type="checkbox"
                                                className="peer sr-only"
                                                checked={filters.show_products}
                                                onChange={(e) =>
                                                    handleFilterChange(
                                                        'show_products',
                                                        e.target.checked,
                                                    )
                                                }
                                            />
                                            <div className="h-5 w-9 rounded-full bg-gray-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-4 dark:bg-[#646464] dark:after:bg-[#1e1e1e] dark:peer-checked:bg-[#e1e1e1]" />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Video Auto Play FILTER Section */}
                            <div className="px-8 py-6">
                                <h2 className="mb-6 text-xs font-semibold text-sub-text-light dark:text-sub-text-dark">
                                    {__('Video AutoPlay Filter')}
                                </h2>

                                <div className="space-y-5">
                                    {/* Auto Play Filter */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-medium text-sub-text-light dark:text-sub-text-dark">
                                            {__('Autoplay')}
                                        </span>
                                        <label className="relative inline-flex cursor-pointer items-center">
                                            <input
                                                type="checkbox"
                                                className="peer sr-only"
                                                checked={filters.video_autoplay}
                                                onChange={(e) =>
                                                    handleFilterChange(
                                                        'video_autoplay',
                                                        e.target.checked,
                                                    )
                                                }
                                            />
                                            <div className="h-5 w-9 rounded-full bg-gray-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-4 dark:bg-[#646464] dark:after:bg-[#1e1e1e] dark:peer-checked:bg-[#e1e1e1]" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Apply Button - Desktop */}
                        <div className="m-auto my-6 w-1/2">
                            <button
                                onClick={() => handleSaveFilters()}
                                className="w-full rounded-md bg-black px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    {filterSaving && (
                                        <Spinner
                                            customSize={'size-4'}
                                            Color={'fill-black dark:fill-white'}
                                        />
                                    )}
                                    <span> {__('Apply Filters')}</span>
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
