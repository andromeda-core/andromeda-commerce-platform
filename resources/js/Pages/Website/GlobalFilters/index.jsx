import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';
import useWindowSize from '@/Hooks/useWindowSize';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import getCookie from '@/Hooks/useGetCookie';
import Toast from '@/Components/Toast';
import Spinner from '@/Components/Spinner';

const Index = () => {
    const windowSize = useWindowSize();
    const isMobile = windowSize.width < 1024;
    const [filtersSaved, setFiltersSaved] = useState(false);
    const [filterSaving, setFilterSaving] = useState(false);

    const [showInfoToast, setShowInfoToast] = useState(false);
    const [infoMessage, setInfoMessage] = useState('');

    // State for filters
    const [filters, setFilters] = useState(() => {
        const cookieValue = getCookie('post_preferences');

        // Default values
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

    // Toggle filter handler
    const handleFilterChange = (filterName, checked) => {
        // Define filter categories
        const typeFilters = ['text', 'images', 'videos'];
        const visibilityFilters = ['show_posts', 'show_products'];

        if (!checked) {
            // Check if this filter belongs to type filters
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

            // Check if this filter belongs to visibility filters
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
                setFiltersSaved(true);
                setFilterSaving(false);
            },
        });
    };

    useEffect(() => {
        if (filtersSaved) {
            const timer = setTimeout(() => {
                setFiltersSaved(false);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [filtersSaved]);

    const FilterModal = () => {
        return (
            <>
                {filtersSaved &&
                    createPortal(
                        <div className="fixed inset-0 z-[100] flex items-center justify-center">
                            {/* Overlay */}
                            <div
                                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                                onClick={() => setFiltersSaved(false)}
                            ></div>

                            {/* Modal */}
                            <div
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="filtersSavedTitle"
                                className="relative z-[101] w-full max-w-sm animate-scale-in rounded-2xl bg-white p-8 shadow-2xl dark:bg-deepcharcoal sm:max-w-md"
                            >
                                {/* Success Icon */}
                                <div className="mb-4 flex justify-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            className="h-8 w-8 text-green-600 dark:text-green-400"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                            />
                                        </svg>
                                    </div>
                                </div>

                                {/* Title */}
                                <div className="text-center">
                                    <h2
                                        id="filtersSavedTitle"
                                        className="mb-2 text-xl font-bold text-gray-900 dark:text-white"
                                    >
                                        Filters Saved!
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Your filter preferences have been saved successfully
                                    </p>
                                </div>
                            </div>
                        </div>,
                        document.body,
                    )}
            </>
        );
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

    // Mobile Design
    if (isMobile) {
        return (
            <MainLayout>
                <Head title="Global Filters" />

                <div className="flex min-h-screen flex-col">
                    {/* Mobile Header */}
                    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-900 dark:bg-deepcharcoal">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold text-gray-600 dark:text-white/80">
                                Filter Settings
                            </h1>
                        </div>
                    </div>

                    {/* Mobile Content - With bottom padding for bottom bar and apply button */}
                    <div className="flex-1 overflow-y-auto pb-32">
                        {/* POST TYPE FILTERS Section */}
                        <div className="border-b border-gray-200 bg-white px-5 py-6 dark:border-gray-900 dark:bg-deepcharcoal">
                            <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Post Type Filters
                            </h2>

                            <div className="space-y-4">
                                {/* Text Filter */}
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-medium text-gray-600 dark:text-white/80">
                                        Text
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
                                        <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                    </label>
                                </div>

                                {/* Images Filter */}
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-medium text-gray-600 dark:text-white/80">
                                        Images
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
                                        <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                    </label>
                                </div>

                                {/* Videos Filter */}
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-medium text-gray-600 dark:text-white/80">
                                        Videos
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
                                        <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* VISIBILITY FILTER Section */}
                        <div className="bg-white px-5 py-6 dark:bg-deepcharcoal">
                            <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Visibility Filter
                            </h2>

                            <div className="space-y-4">
                                {/* Posts Filter */}
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-medium text-gray-600 dark:text-white/80">
                                        Posts
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
                                        <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                    </label>
                                </div>

                                {/* Products Filter */}
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-medium text-gray-600 dark:text-white/80">
                                        Products
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
                <FilterModal />
            </MainLayout>
        );
    }

    // Desktop Design
    return (
        <MainLayout>
            <Head title="Global Filters" />

            <div className="min-h-screen">
                <div className="mx-auto max-w-2xl px-6 py-8">
                    {/* Desktop Title - Centered */}
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold text-gray-600 dark:text-white/80">
                            Filter Settings
                        </h1>
                    </div>

                    {/* Desktop Card */}
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-deepcharcoal">
                        {/* POST TYPE FILTERS Section */}
                        <div className="border-b border-gray-200 px-8 py-6 dark:border-zinc-800">
                            <h2 className="mb-6 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Post Type Filters
                            </h2>

                            <div className="space-y-5">
                                {/* Text Filter */}
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-medium text-gray-600 dark:text-white/80">
                                        Text
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
                                        <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                    </label>
                                </div>

                                {/* Images Filter */}
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-medium text-gray-600 dark:text-white/80">
                                        Images
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
                                        <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                    </label>
                                </div>

                                {/* Videos Filter */}
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-medium text-gray-600 dark:text-white/80">
                                        Videos
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
                                        <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* VISIBILITY FILTER Section */}
                        <div className="px-8 py-6">
                            <h2 className="mb-6 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Visibility Filter
                            </h2>

                            <div className="space-y-5">
                                {/* Posts Filter */}
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-medium text-gray-600 dark:text-white/80">
                                        Posts
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
                                        <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                    </label>
                                </div>

                                {/* Products Filter */}
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-medium text-gray-600 dark:text-white/80">
                                        Products
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
                                        <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-500 peer-checked:after:translate-x-4"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Apply Button - Desktop */}
                    <div className="m-auto my-6 w-1/2">
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
            <ToastModal />
            <FilterModal />
        </MainLayout>
    );
};

export default Index;
