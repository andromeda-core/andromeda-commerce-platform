import Spinner from '@/Components/Spinner';
import { useTranslation } from '@/Hooks/useTranslation';
import useWindowSize from '@/Hooks/useWindowSize';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, router, usePage } from '@inertiajs/react';
import React, { useRef, useState, useEffect, Fragment, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

const index = (
    { categories,
        products,
        nextPageUrl,
        smartphone_tags,
        filterCategories,
        applied_filters
    }) => {
    const { currency } = usePage().props;
    const windowSize = useWindowSize();
    const { __ } = useTranslation();

    const [activeTab, setActiveTab] = useState('all');
    const [activeHashtag, setActiveHashtag] = useState(null);
    const [filters, setFilters] = useState(applied_filters || {
        price_range: [],
        storage: [],
        color: [],
        condition: [],
    });

    const tabs = [
        {
            key: 'all', label: __('All')
        },
        ...smartphone_tags,
    ];

    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [productsData, setProductsData] = useState(products || []);
    const [nextPageUrlData, setNextPageUrlData] = useState(nextPageUrl || null);
    const [dropdownStyle, setDropdownStyle] = useState(null);


    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isFilterApplying, setIsFilterApplying] = useState(false);
    const [isFilterResetting, setIsFilterResetting] = useState(false);
    const [isFilterClearing, setIsFilterClearing] = useState(false);

    const tabsContainerRef = useRef(null);
    const tabRefs = useRef({});
    const filterRef = useRef(null);
    const dropdownRef = useRef(null);

    const loadMoreRef = useRef(null);

    // Smartphone URL Generation
    const generateSmartphoneURL = (smartphone, isDirect = false, isSinglePage = false) => {
        return (
            `?m-slug=${smartphone?.slug}${isSinglePage ? '&single_page=true' : ''}${isDirect ? '&direct=true' : ''}`
        );
    }

    const handleTabClick = async (tabKey) => {
        if (activeTab === tabKey) return;

        setActiveTab(tabKey);
        setActiveHashtag(tabKey === 'all' ? null : tabKey);
        setProductsData([]);
        setNextPageUrlData(null);
        setIsLoadingMore(true);

        try {
            const response = await axios.get(
                route('website.shop.loadMore'),
                {
                    params: {
                        ...(tabKey !== 'all' && { tag: tabKey }),
                        filters,
                    }

                }
            );

            setProductsData(response.data.products);
            setNextPageUrlData(response.data.nextPageUrl);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const getGridCols = () => {
        if (windowSize.width < 640) return 'grid-cols-2';
        if (windowSize.width < 768) return 'grid-cols-2';
        if (windowSize.width < 1024) return 'grid-cols-3';
        if (windowSize.width < 1280) return 'grid-cols-4';
        return 'grid-cols-5';
    };

    const scrollToTabIfNeeded = (tabKey) => {
        const container = tabsContainerRef.current;
        const tabEl = tabRefs.current[tabKey];

        if (!container || !tabEl || windowSize.width <= 1024) return;

        const tabLeft = tabEl.offsetLeft;
        const tabRight = tabLeft + tabEl.offsetWidth;

        const visibleLeft = container.scrollLeft;
        const visibleRight = visibleLeft + container.clientWidth;

        const avgTabWidth = tabEl.offsetWidth;
        const jumpDistance = avgTabWidth * 2.5;


        if (tabLeft - visibleLeft < avgTabWidth * 1.2) {
            container.scrollTo({
                left: tabLeft - jumpDistance,
                behavior: 'smooth',
            });
            return;
        }

        if (tabRight > visibleRight - avgTabWidth) {
            container.scrollTo({
                left: visibleLeft + jumpDistance,
                behavior: 'smooth',
            });
        }
    };

    const loadMoreProducts = async () => {
        if (!nextPageUrlData || isLoadingMore) return;

        setIsLoadingMore(true);

        try {
            const response = await axios.get(nextPageUrlData, {
                params: activeHashtag ? { tag: activeHashtag } : {},
            });

            setProductsData(prev =>
                mergeUniqueProducts(prev, response.data.products)
            );

            setNextPageUrlData(response.data.nextPageUrl);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingMore(false);
        }
    };


    const mergeUniqueProducts = (oldItems, newItems) => {
        const map = new Map();

        [...oldItems, ...newItems].forEach(item => {
            map.set(item.id, item);
        });

        return Array.from(map.values());
    };


    const updateDropdownPosition = () => {
        if (!filterRef.current) return;

        const rect = filterRef.current.getBoundingClientRect();

        setDropdownStyle({
            position: 'fixed',
            top: rect.bottom + 8,
            left: rect.left,
            width: 260,
            zIndex: 9999,
        });
    };


    const toggleFilter = (categoryId, optionKey) => {
        setFilters(prev => {
            const current = prev[categoryId] || [];
            const exists = current.includes(optionKey);

            return {
                ...prev,
                [categoryId]: exists
                    ? current.filter(k => k !== optionKey)
                    : [...current, optionKey],
            };
        });
    };


    const hasAppliedFilters = () => {

        const hasApplied =
            Object.values(filters).some(
                (values) => Array.isArray(values) && values.length > 0
            ) ||
            (applied_filters && Object.values(applied_filters).some(
                (values) => Array.isArray(values) && values.length > 0
            ));

        return hasApplied;
    };

    const applyFilter = () => {

        if (!hasAppliedFilters()) {
            setIsFilterOpen(false);
            return;
        }

        setIsFilterApplying(true);
        router.post(route('website.shop.index'),
            { filters }, {
            preserveScroll: true,
            onFinish: () => {
                setIsFilterApplying(false);
                setIsFilterOpen(false);
            }
        });


    };

    const resetFilters = () => {
        setIsFilterResetting(true);
        setFilters({
            price_range: [],
            storage: [],
            color: [],
            condition: [],
        });


        router.reload({
            only: ['products', 'nextPageUrl', 'applied_filters'],
            onFinish: () => {
                setIsFilterResetting(false);
                setIsFilterOpen(false);
            },
        });
    };

    const isChecked = (categoryId, optionKey) =>
        filters[categoryId]?.includes(optionKey);


    // Close filter dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const clickedInsideButton =
                filterRef.current?.contains(event.target);

            const clickedInsideDropdown =
                dropdownRef.current?.contains(event.target);

            if (!clickedInsideButton && !clickedInsideDropdown) {
                setIsFilterOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setProductsData(products || []);
        setNextPageUrlData(nextPageUrl || null);
    }, [products, nextPageUrl]);

    useEffect(() => {
        if (!activeTab) return;

        const handleResize = () => {
            scrollToTabIfNeeded(activeTab);
            setIsFilterOpen(false);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [activeTab]);

    useEffect(() => {
        const container = tabsContainerRef.current;
        if (!container) return;

        const onScroll = () => {
            setIsFilterOpen(false);
            updateDropdownPosition();
        }
        container.addEventListener('scroll', onScroll);

        return () => container.removeEventListener('scroll', onScroll);
    }, []);


    useLayoutEffect(() => {
        if (!isFilterOpen) return;

        updateDropdownPosition();
    }, [isFilterOpen]);

    useLayoutEffect(() => {
        updateDropdownPosition();
    }, [windowSize.width]);

    useEffect(() => {
        if (!loadMoreRef.current) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                loadMoreProducts();
            }
        });

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [nextPageUrlData, activeHashtag]);
    return (
        <MainLayout>
            <Head title={__('Shop', true)} />

            {/* Main Container*/}
            <div className="w-full px-2 py-6 sm:px-2 lg:px-8">
                <div className={`w-full mx-auto ${windowSize.width > 1024 ? 'pb-10' : 'pb-24'} max-w-[1400px]`}>

                    {/* Navigation Tabs */}
                    <div className="w-full mb-6 sm:mb-8">
                        {/* Headers */}

                        <div className="flex flex-wrap items-center mb-4 sm:mb-6">
                            {categories?.map((category, index) => (
                                <Fragment key={category.id}>
                                    {index > 0 && (
                                        <span
                                            className={
                                                index === 1
                                                    ? 'mx-3 text-main-text-light dark:text-main-text-dark font-semibold text-xl sm:text-xl lg:text-3xl  inline-block'
                                                    : 'mx-3 text-sub-text-light dark:text-sub-text-dark font-semibold text-md sm:text-xl lg:text-3xl'
                                            }
                                        >
                                            |
                                        </span>

                                    )}

                                    {/* Category name */}
                                    <h2
                                        className={
                                            index === 0
                                                ? 'font-semibold text-2xl text-main-text-light dark:text-main-text-dark sm:text-xl lg:text-3xl '
                                                : 'font-medium text-sub-text-light dark:text-sub-text-dark text-2xl sm:text-xl lg:text-3xl'
                                        }
                                    >
                                        {category.name}
                                    </h2>
                                </Fragment>
                            ))}
                        </div>




                        {/* Tabs Container */}
                        <div className="relative w-full mt-6 mb-4">
                            <div className="relative grid w-full grid-cols-1 overflow-hidden">
                                <div className="relative flex items-center w-full">


                                    {/* Scrollable Container */}
                                    <div className="flex items-center w-full gap-3 overflow-x-auto flex-nowrap scrollbar-none scroll-smooth"
                                        ref={tabsContainerRef}
                                        style={{
                                            transform: 'translateZ(0)',
                                            WebkitOverflowScrolling: 'touch',
                                            scrollbarWidth: 'none',
                                            msOverflowStyle: 'none',
                                            maxWidth: '100%',
                                            display: 'flex'
                                        }}
                                    >
                                        {/* Filter Button with Dropdown */}
                                        <div ref={filterRef} className="relative flex-shrink-0">


                                            <button
                                                onClick={() => setIsFilterOpen(!isFilterOpen)}

                                                className={`relative flex items-center gap-4 flex-shrink-0 px-4 py-2 text-sm transition-all rounded-full whitespace-nowrap bg-surface-1-light text-main-text-light dark:bg-surface-1-dark dark:text-main-text-dark`}
                                            >
                                                <span>{__('Filter')}</span>
                                                <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>


                                        </div>

                                        {/* Tabs */}
                                        {tabs.map((tab) => (
                                            <button
                                                key={tab.key}
                                                ref={(el) => (tabRefs.current[tab.key] = el)}
                                                onClick={() => {
                                                    handleTabClick(tab.key);
                                                    scrollToTabIfNeeded(tab.key);
                                                }}

                                                className={`relative flex-shrink-0 px-4 py-2 text-sm transition-all rounded-full whitespace-nowrap ${activeTab === tab.key
                                                    ? 'bg-main-text-light text-main-text-dark dark:bg-main-text-dark dark:text-main-text-light font-semibold'
                                                    : 'bg-surface-1-light text-main-text-light dark:bg-surface-1-dark dark:text-main-text-dark'
                                                    }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>




                                </div>
                            </div>
                        </div>
                    </div>

                    {/* No Results */}
                    {!isLoadingMore && productsData.length === 0 && (
                        <div className="flex flex-col items-center justify-center w-full py-16 text-center">


                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {__('No products found')}
                            </h3>

                            <p className="max-w-md mt-2 text-sm text-gray-500 dark:text-gray-400">
                                {__('Try adjusting your filters or removing some selections to see more results.')}
                            </p>

                            {hasAppliedFilters() && (
                                <button
                                    onClick={() => {
                                        setIsFilterClearing(true);
                                        setFilters({
                                            price_range: [],
                                            storage: [],
                                            color: [],
                                            condition: [],
                                        });

                                        router.reload({
                                            only: ['products', 'nextPageUrl'],
                                            onFinish: () => {
                                                setIsFilterClearing(false);
                                            }
                                        });
                                    }}
                                    className="flex items-center justify-center mt-5 text-sm font-semibold text-center underline text-main-text-light dark:text-main-text-dark"
                                >
                                    {isFilterClearing ? <Spinner /> : __('Clear all filters')}
                                </button>
                            )}
                        </div>
                    )}


                    {/* Product Grid */}
                    <div className={`grid ${getGridCols()} gap-3 sm:gap-4 lg:gap-6 w-full`}>
                        {productsData.map((product) => (
                            <div
                                key={product.id}
                                className="w-full overflow-hidden cursor-pointer group"
                                onClick={() => router.get(
                                    route('home') + generateSmartphoneURL(product, true, true)
                                )}
                            >
                                {/* Product Image Container */}
                                <div className="flex items-center justify-center w-full p-2 transition-transform duration-500 aspect-square no-touch-hover lg:group-hover:scale-105">
                                    <img
                                        src={product?.image}
                                        alt={product?.name}
                                        className="object-cover w-full h-full rounded-md "
                                    />
                                </div>

                                {/* Product Info */}
                                <div className="w-full p-2.5 sm:p-3 lg:p-4">
                                    <h3
                                        className="mb-0.5 sm:mb-1 text-xs sm:text-sm font-medium text-main-text-light dark:text-main-text-dark line-clamp-1"
                                        style={{ fontSize: 'clamp(14px, 2vw, 14px)' }}
                                    >
                                        {product?.name}
                                    </h3>
                                    <p
                                        className="mb-1.5 sm:mb-2 lg:mb-3 text-[10px] sm:text-xs font-medium text-sub-text-light dark:text-sub-text-dark line-clamp-1"
                                        style={{ fontSize: 'clamp(12px, 1.8vw, 12px)' }}
                                    >
                                        {product?.condition}, {product?.capacity}, {product.color}
                                    </p>
                                    <p
                                        className="text-xs font-semibold text-main-text-light sm:text-sm lg:text-base dark:text-main-text-dark"
                                        style={{ fontSize: 'clamp(16px, 2.2vw, 16px)' }}
                                    >
                                        {currency?.name}  {currency?.symbol}{product?.total_price}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>


                    {nextPageUrlData && (
                        <div
                            ref={loadMoreRef}
                            className="flex animate-pulse items-center justify-center gap-2 py-10 text-center text-[10px] text-main-text-light transition-all duration-100 dark:text-main-text-dark lg:text-[18px]"
                        >
                            <Spinner />
                            {__('Loading More')}...
                        </div>
                    )}


                    {isLoadingMore && (
                        <div
                            className="flex animate-pulse items-center justify-center gap-2 py-10 text-center text-[10px] text-main-text-light transition-all duration-100 dark:text-main-text-dark lg:text-[18px]"
                        >
                            <Spinner />
                            {__('Loading')}...
                        </div>
                    )}
                </div>
            </div>

            {/* Filter Dropdown */}
            {
                createPortal(
                    <div
                        ref={dropdownRef}
                        style={{
                            ...dropdownStyle,
                            opacity: isFilterOpen ? 1 : 0,
                            transform: isFilterOpen ? 'translateY(0)' : 'translateY(-4px)',
                            pointerEvents: isFilterOpen ? 'auto' : 'none',
                            transition: 'opacity 120ms ease, transform 120ms ease',
                        }}
                        className="border rounded-md shadow-md bg-surface-1-light dark:bg-surface-1-dark border-surface-3-light dark:border-surface-3-dark"
                    >
                        <div className="p-3 space-y-4 max-h-[50vh] scrollbar overflow-y-auto">
                            {filterCategories.map((category) => (
                                <div key={category.id}>
                                    <h4 className="mx-2 mb-2 text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                        {category.label}
                                    </h4>
                                    <div className="space-y-2">



                                        {category.options.map((option) => (
                                            <label
                                                key={option.key}
                                                className="flex items-center space-x-2 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={isChecked(category.id, option.key)}
                                                    onChange={() =>
                                                        toggleFilter(category.id, option.key)
                                                    }
                                                />

                                                <div



                                                    className={
                                                        isChecked(category.id, option.key) === true
                                                            ? 'mr-3 flex h-5 w-5 items-center justify-center rounded-md border-[1.25px] border-black dark:border-surafce-3-dark bg-black dark:bg-surface-1-dark dark:border-gray-700'
                                                            : 'mr-3 flex h-5 w-5 items-center justify-center rounded-md border-[1.25px] border-gray-300 bg-transparent'
                                                    }
                                                >
                                                    {isChecked(category.id, option.key) && (
                                                        <span

                                                        >
                                                            <svg
                                                                width="14"
                                                                height="14"
                                                                viewBox="0 0 14 14"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path
                                                                    d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                                                                    stroke="white"
                                                                    strokeWidth="1.94437"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                />
                                                            </svg>
                                                        </span>
                                                    )}
                                                </div>

                                                <span className="text-sm text-sub-text-light dark:text-sub-text-dark">
                                                    {option.label}
                                                </span>
                                            </label>
                                        ))}

                                    </div>
                                </div>
                            ))}
                            <div className="flex gap-2 pt-4 border-t border-surface-1-light dark:border-surface-1-dark">
                                <button
                                    disabled={!hasAppliedFilters()}
                                    onClick={() => resetFilters()}
                                    className={`h-10 px-2 flex-1 flex justify-center items-center rounded-md border border-main-text-light bg-white text-center text-md font-semibold text-main-text-light transition hover:bg-main-text-dark/80 dark:border-main-text-dark dark:bg-main-text-dark dark:bg-main-text-dark/80 ${!hasAppliedFilters() && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                                >

                                    {isFilterResetting ? <Spinner /> : __('Reset')}
                                </button>
                                <button
                                    disabled={!hasAppliedFilters()}
                                    onClick={() => applyFilter()}
                                    className={`flex-1 h-10 px-2 flex justify-center items-center font-semibold text-center transition border rounded-md text-md border-main-text-dark bg-main-text-light text-main-text-dark hover:bg-main-text-light/80 dark:bg-main-text-light dark:hover:bg-main-text-light/80 ${!hasAppliedFilters() && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                                >
                                    {isFilterApplying ? <Spinner /> : __('Apply')}

                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            }


        </MainLayout>
    );
};

export default index;
