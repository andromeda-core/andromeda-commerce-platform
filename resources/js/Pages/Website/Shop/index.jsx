import Spinner from '@/Components/Spinner';
import { useTranslation } from '@/Hooks/useTranslation';
import useWindowSize from '@/Hooks/useWindowSize';
import MainLayout from '@/Layouts/Website/MainLayout';
import { Head, router, usePage } from '@inertiajs/react';
import React, { useRef, useState, useEffect, Fragment, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Placeholder from 'asset/assets/images/product/placeholder.jpg';
import DisplayPrice from '@/Components/DisplayPrice';

const index = ({
    categories,
    products,
    nextPageUrl,
    smartphone_tags,
    filterCategories,
    applied_filters,
}) => {
    const { currency } = usePage().props;
    const windowSize = useWindowSize();
    const { __ } = useTranslation();

    const [activeTab, setActiveTab] = useState('all');
    const [activeCategory, setActiveCategory] = useState(null);
    const [activeHashtag, setActiveHashtag] = useState(null);

    const [tabScrollState, setTabScrollState] = useState({
        canScrollLeft: false,
        canScrollRight: false,
    });

    const [filters, setFilters] = useState(
        applied_filters || {
            price_range: [],
            storage: [],
            color: [],
            condition: [],
        },
    );

    const [tabsData, setTabsData] = useState([
        { key: 'all', label: __('All') },
        ...(smartphone_tags || []),
    ]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [productsData, setProductsData] = useState(products || []);
    const [nextPageUrlData, setNextPageUrlData] = useState(nextPageUrl || null);
    const [dropdownStyle, setDropdownStyle] = useState(null);

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isFilterApplying, setIsFilterApplying] = useState(false);
    const [isFilterResetting, setIsFilterResetting] = useState(false);

    const tabsContainerRef = useRef(null);
    const tabRefs = useRef({});
    const filterRef = useRef(null);
    const dropdownRef = useRef(null);

    const loadMoreRef = useRef(null);

    // Smartphone URL Generation
    const generateSmartphoneURL = (smartphone, isDirect = false, isSinglePage = false) => {
        return `/product/${encodeURIComponent(smartphone?.public_id)}/${smartphone?.slug}`; //${isSinglePage ? '&single_page=true' : ''}${isDirect ? '&direct=true' : ''}`;
    };

    const [canCategoryScrollLeft, setCanCategoryScrollLeft] = useState(false);
    const [canCategoryScrollRight, setCanCategoryScrollRight] = useState(false);

    const scrollContainerRef = useRef(null);

    // Scroll handlers
    const scrollLeftCategory = useCallback(() => {
        scrollContainerRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
    }, []);

    const scrollRightCategory = useCallback(() => {
        scrollContainerRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
    }, []);

    // Optimized scroll button update with debouncing
    const updateCategoryScrollButtons = useCallback(() => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            const newCanScrollLeft = scrollLeft > 0;
            const newCanScrollRight = scrollLeft < scrollWidth - clientWidth - 20;

            // Only update if values changed
            if (
                newCanScrollLeft !== canCategoryScrollLeft ||
                newCanScrollRight !== canCategoryScrollRight
            ) {
                setCanCategoryScrollLeft(newCanScrollLeft);
                setCanCategoryScrollRight(newCanScrollRight);
            }
        }
    }, [canCategoryScrollLeft, canCategoryScrollRight]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const raf = requestAnimationFrame(() => {
            updateCategoryScrollButtons();
        });

        container.addEventListener('scroll', updateCategoryScrollButtons);
        window.addEventListener('resize', updateCategoryScrollButtons);

        return () => {
            cancelAnimationFrame(raf);
            container.removeEventListener('scroll', updateCategoryScrollButtons);
            window.removeEventListener('resize', updateCategoryScrollButtons);
        };
    }, [updateCategoryScrollButtons, categories.length]);

    const handleTabClick = async (tabKey) => {
        if (activeTab === tabKey) return;

        setActiveTab(tabKey);
        setActiveHashtag(tabKey === 'all' ? null : tabKey);
        setProductsData([]);
        setNextPageUrlData(null);
        setIsLoadingMore(true);

        try {
            const response = await axios.get(route('website.shop.loadMore'), {
                params: {
                    ...(tabKey !== 'all' && { tag: tabKey }),
                    category_id: activeCategory,
                    filters,
                },
            });

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
            const response = await axios.get(nextPageUrlData);

            setProductsData((prev) => mergeUniqueProducts(prev, response.data.products));

            setNextPageUrlData(response.data.nextPageUrl);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const mergeUniqueProducts = (oldItems, newItems) => {
        const map = new Map();

        [...oldItems, ...newItems].forEach((item) => {
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
        setFilters((prev) => {
            const current = prev[categoryId] || [];
            const exists = current.includes(optionKey);

            return {
                ...prev,
                [categoryId]: exists
                    ? current.filter((k) => k !== optionKey)
                    : [...current, optionKey],
            };
        });
    };

    const hasAppliedFilters = () => {
        const hasApplied =
            Object.values(filters).some((values) => Array.isArray(values) && values.length > 0) ||
            (applied_filters &&
                Object.values(applied_filters).some(
                    (values) => Array.isArray(values) && values.length > 0,
                ));

        return hasApplied;
    };

    const applyFilter = () => {
        if (!hasAppliedFilters()) {
            setIsFilterOpen(false);
            return;
        }

        setIsFilterApplying(true);
        router.post(
            route('website.shop.index'),
            {
                filters,
                category_id: activeCategory,
            },
            {
                preserveScroll: true,
                preserveUrl: true,
                onFinish: () => {
                    setIsFilterApplying(false);
                    setIsFilterOpen(false);
                },
            },
        );
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
            only: ['products', 'nextPageUrl', 'applied_filters', 'smartphone_tags'],
            preserveUrl: true,
            onFinish: () => {
                setIsFilterResetting(false);
                setIsFilterOpen(false);
            },
        });
    };

    const isChecked = (categoryId, optionKey) => filters[categoryId]?.includes(optionKey);

    const handleCategoryClick = async (category) => {
        if (activeCategory === category.id) return;

        setActiveCategory(category.id);

        setActiveTab('all');
        setActiveHashtag(null);
        setProductsData([]);
        setNextPageUrlData(null);
        setIsLoadingMore(true);

        window.history.replaceState(
            {},
            '',
            route('website.shop.index', { category_id: category.id }),
        );
        try {
            const response = await axios.get(route('website.shop.loadMore'), {
                params: {
                    category_id: category.id,
                    filters,
                },
            });

            setProductsData(response.data.products);
            setTabsData([
                { key: 'all', label: __('All') },
                ...(response.data.smartphone_tags || []),
            ]);
            setNextPageUrlData(response.data.nextPageUrl);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingMore(false);
        }
    };

    // Scroll handlers
    const scrollLeft = useCallback(() => {
        tabsContainerRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
    }, []);

    const scrollRight = useCallback(() => {
        tabsContainerRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
    }, []);

    // Optimized scroll button update with debouncing
    const updateScrollButtons = useCallback(() => {
        if (tabsContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
            const newCanScrollLeft = scrollLeft > 0;
            const newCanScrollRight = scrollLeft < scrollWidth - clientWidth - 20;

            // Only update if values changed
            if (
                newCanScrollLeft !== tabScrollState.canScrollLeft ||
                newCanScrollRight !== tabScrollState.canScrollRight
            ) {
                setTabScrollState({
                    canScrollLeft: newCanScrollLeft,
                    canScrollRight: newCanScrollRight,
                });
            }
        }
    }, [tabScrollState.canScrollLeft, tabScrollState.canScrollRight]);

    // Update TabScrollState Buttons
    useEffect(() => {
        const container = tabsContainerRef.current;
        if (container) {
            updateScrollButtons();
            container.addEventListener('scroll', updateScrollButtons);
            window.addEventListener('resize', updateScrollButtons);

            return () => {
                container.removeEventListener('scroll', updateScrollButtons);
                window.removeEventListener('resize', updateScrollButtons);
            };
        }
    }, [tabsData, updateScrollButtons]);

    useEffect(() => {
        if (!categories?.length) return;

        if (!activeCategory) {
            const params = new URLSearchParams(window.location.search);
            const category_id = params.get('category_id');

            const firstCategory = categories[0];

            setActiveCategory(Number(category_id) || firstCategory.id);
        }
    }, [categories]);

    // Close filter dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const clickedInsideButton = filterRef.current?.contains(event.target);

            const clickedInsideDropdown = dropdownRef.current?.contains(event.target);

            if (!clickedInsideButton && !clickedInsideDropdown) {
                setIsFilterOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setTabsData([{ key: 'all', label: __('All') }, ...(smartphone_tags || [])]);
    }, [smartphone_tags]);

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
        };
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
            <div className="w-full px-6 lg:mt-6 lg:px-8">
                <div
                    className={`mx-auto w-full ${windowSize.width > 1024 ? 'pb-10' : 'pb-24'} max-w-[1400px]`}
                >
                    {/* Navigation Tabs */}
                    <div className="my-2 mb-6 w-full sm:mb-8">
                        {/* Headers */}
                        <div className="mb-7 w-full">
                            <div className="relative grid w-full grid-cols-1 overflow-hidden">
                                <div className="relative flex w-full items-center">
                                    {/* Left Arrow */}
                                    {canCategoryScrollLeft && (
                                        <button
                                            onClick={scrollLeftCategory}
                                            className="absolute left-0 z-20 flex flex-shrink-0 items-center justify-center rounded-full bg-surface-1-light p-2 transition-all duration-200 hover:scale-110 hover:bg-surface-1-light dark:bg-surface-3-dark dark:hover:bg-surface-3-dark md:flex"
                                            style={{ left: '0px' }}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="size-4 text-sub-text-light dark:text-sub-text-dark"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M15.75 19.5L8.25 12l7.5-7.5"
                                                />
                                            </svg>
                                        </button>
                                    )}

                                    <div
                                        ref={scrollContainerRef}
                                        className="flex w-full flex-nowrap items-center gap-7 overflow-x-auto scroll-smooth scrollbar-none"
                                        style={{
                                            transform: 'translateZ(0)',
                                            WebkitOverflowScrolling: 'touch',
                                            scrollbarWidth: 'none',
                                            msOverflowStyle: 'none',
                                            maxWidth: '100%',
                                            display: 'flex',
                                        }}
                                    >
                                        {categories?.map((category, index) => (
                                            <Fragment key={category.id}>
                                                {/* Category name */}

                                                <button
                                                    onClick={() => handleCategoryClick(category)}
                                                    className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap border-b-[3px] py-2 pl-1 text-sm font-semibold transition-all ${
                                                        activeCategory === category.id
                                                            ? 'border-main-text-light text-main-text-light dark:border-main-text-dark dark:text-main-text-dark'
                                                            : 'border-transparent text-main-text-light dark:text-main-text-dark lg:hover:border-main-text-light dark:lg:hover:border-main-text-dark'
                                                    }`}
                                                >
                                                    <span className="text-[24px] font-semibold text-main-text-light dark:text-main-text-dark">
                                                        {' '}
                                                        {category.name}
                                                    </span>
                                                </button>
                                            </Fragment>
                                        ))}
                                    </div>

                                    {/* Right Arrow */}
                                    {canCategoryScrollRight && (
                                        <button
                                            onClick={scrollRightCategory}
                                            className="absolute right-0 z-20 flex flex-shrink-0 items-center justify-center rounded-full bg-surface-1-light p-2 transition-all duration-200 hover:scale-110 hover:bg-surface-1-light dark:bg-surface-3-dark dark:hover:bg-surface-3-dark md:flex"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="size-4 text-sub-text-light dark:text-sub-text-dark"
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
                        </div>

                        {/* Tabs Container */}
                        <div className="relative mb-4 mt-6 w-full">
                            <div className="relative grid w-full grid-cols-1 overflow-hidden">
                                <div className="relative flex w-full items-center">
                                    {/* Left Arrow */}
                                    {tabScrollState.canScrollLeft && windowSize.width <= 1024 && (
                                        <button
                                            onClick={scrollLeft}
                                            className="absolute left-0 z-20 flex flex-shrink-0 items-center justify-center rounded-full bg-surface-2-light p-2 transition-all duration-200 hover:scale-110 dark:bg-surface-3-dark md:flex"
                                            style={{ left: '0px' }}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="size-4 text-gray-600 dark:text-sub-text-dark"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M15.75 19.5L8.25 12l7.5-7.5"
                                                />
                                            </svg>
                                        </button>
                                    )}

                                    {/* Scrollable Container */}
                                    <div
                                        className="flex w-full flex-nowrap items-center gap-3 overflow-x-auto scroll-smooth scrollbar-none"
                                        ref={tabsContainerRef}
                                        style={{
                                            transform: 'translateZ(0)',
                                            WebkitOverflowScrolling: 'touch',
                                            scrollbarWidth: 'none',
                                            msOverflowStyle: 'none',
                                            maxWidth: '100%',
                                            display: 'flex',
                                        }}
                                    >
                                        {/* Filter Button with Dropdown */}
                                        <div ref={filterRef} className="relative flex-shrink-0">
                                            <button
                                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                                className={`relative flex flex-shrink-0 items-center gap-4 whitespace-nowrap rounded-full bg-surface-1-light px-4 py-2 text-sm text-main-text-light transition-all dark:bg-surface-1-dark dark:text-main-text-dark`}
                                            >
                                                <span>{__('Filter')}</span>
                                                <svg
                                                    className="h-5 w-5 sm:h-4 sm:w-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Tabs */}
                                        {tabsData.map((tab) => (
                                            <button
                                                key={tab.key}
                                                ref={(el) => (tabRefs.current[tab.key] = el)}
                                                onClick={() => {
                                                    handleTabClick(tab.key);
                                                    scrollToTabIfNeeded(tab.key);
                                                }}
                                                className={`relative flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm transition-all ${
                                                    activeTab === tab.key
                                                        ? 'bg-main-text-light text-main-text-dark dark:bg-main-text-dark dark:text-main-text-light'
                                                        : 'bg-surface-1-light text-main-text-light dark:bg-surface-1-dark dark:text-main-text-dark'
                                                }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Right Arrow */}
                                    {tabScrollState.canScrollRight && windowSize.width <= 1024 && (
                                        <button
                                            onClick={scrollRight}
                                            className="absolute right-0 z-20 flex flex-shrink-0 items-center justify-center rounded-full bg-surface-2-light p-2 transition-all duration-200 hover:scale-110 dark:bg-surface-3-dark md:flex"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="size-4 text-black dark:text-sub-text-dark"
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
                        </div>
                    </div>

                    {/* No Results */}
                    {!isLoadingMore && productsData.length === 0 && (
                        <div className="flex w-full flex-col items-center justify-center py-16 text-center">
                            <h3 className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                {__('No products found')}
                            </h3>

                            <p className="mt-2 max-w-md text-sm text-sub-text-light dark:text-sub-text-dark">
                                {__(
                                    'Try adjusting your filters or removing some selections to see more results.',
                                )}
                            </p>

                            {hasAppliedFilters() && (
                                <button
                                    onClick={() => resetFilters()}
                                    className="mt-5 flex items-center justify-center text-center text-sm font-semibold text-main-text-light underline dark:text-main-text-dark"
                                >
                                    {isFilterResetting ? <Spinner /> : __('Clear all filters')}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Product Grid */}
                    <div className={`grid ${getGridCols()} w-full gap-3 sm:gap-4 lg:gap-6`}>
                        {productsData.map((product) => (
                            <div
                                key={product.id}
                                className="group w-full cursor-pointer overflow-hidden"
                                onClick={() =>
                                    router.get(
                                        route('home') + generateSmartphoneURL(product, true, true),
                                    )
                                }
                            >
                                {/* Product Image / Text Container - */}
                                <div className="relative aspect-square w-full overflow-hidden rounded-md bg-surface-2-light text-main-text-light transition-all duration-500 dark:bg-surface-2-dark dark:text-main-text-dark lg:group-hover:scale-105">
                                    {product?.image || product?.video_thumbnail ? (
                                        <img
                                            src={
                                                product?.image ||
                                                product?.video_thumbnail ||
                                                Placeholder
                                            }
                                            alt={product?.name}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                e.target.src = Placeholder;
                                            }}
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-start justify-center overflow-hidden p-3 sm:p-4">
                                            <div
                                                className="line-clamp-[10] w-full overflow-hidden text-ellipsis break-words text-left text-[14px] leading-relaxed opacity-90"
                                                dangerouslySetInnerHTML={{
                                                    __html: product?.content?.trim(),
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="w-full space-y-1 p-2.5 sm:p-3 lg:p-4">
                                    <h3 className="line-clamp-1 text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                        {product?.name}
                                    </h3>

                                    <p className="line-clamp-1 text-xs font-medium text-sub-text-light dark:text-sub-text-dark">
                                        {product?.condition}, {product?.capacity}, {product.color}
                                    </p>

                                    <DisplayPrice
                                        usdAmount={product?.total_price}
                                        showCode
                                        showEstimatedLabel={false}
                                        className="text-base font-semibold text-main-text-light dark:text-main-text-dark"
                                    />
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
                        <div className="flex animate-pulse items-center justify-center gap-2 py-10 text-center text-[10px] text-main-text-light transition-all duration-100 dark:text-main-text-dark lg:text-[18px]">
                            <Spinner />
                            {__('Loading')}...
                        </div>
                    )}
                </div>
            </div>

            {/* Filter Dropdown */}
            {createPortal(
                <div
                    ref={dropdownRef}
                    style={{
                        ...dropdownStyle,
                        opacity: isFilterOpen ? 1 : 0,
                        transform: isFilterOpen ? 'translateY(0)' : 'translateY(-4px)',
                        pointerEvents: isFilterOpen ? 'auto' : 'none',
                        transition: 'opacity 120ms ease, transform 120ms ease',
                    }}
                    className="rounded-md border border-surface-3-light bg-surface-1-light shadow-md dark:border-surface-3-dark dark:bg-surface-1-dark"
                >
                    <div className="max-h-[50vh] space-y-4 overflow-y-auto p-3 scrollbar">
                        {filterCategories.map((category) => (
                            <div key={category.id}>
                                <h4 className="mx-2 mb-2 text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                    {category.label}
                                </h4>
                                <div className="space-y-2">
                                    {category.options.map((option) => (
                                        <label
                                            key={option.key}
                                            className="flex cursor-pointer items-center space-x-2"
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
                                                        ? 'dark:border-surafce-3-dark mr-3 flex h-5 w-5 items-center justify-center rounded-md border-[1.25px] border-black bg-black dark:border-gray-700 dark:bg-surface-1-dark'
                                                        : 'mr-3 flex h-5 w-5 items-center justify-center rounded-md border-[1.25px] border-gray-300 bg-transparent'
                                                }
                                            >
                                                {isChecked(category.id, option.key) && (
                                                    <span>
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

                                            <span className="flex items-center gap-1 text-sm text-sub-text-light dark:text-sub-text-dark">
                                                <span>{option.label}</span>
                                                {category.id === 'price_range' &&
                                                    option.value != null && (
                                                        <DisplayPrice
                                                            usdAmount={option.value}
                                                            showEstimatedLabel={false}
                                                            size="sm"
                                                            className="text-sub-text-light dark:text-sub-text-dark"
                                                        />
                                                    )}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div className="flex gap-2 border-t border-surface-1-light pt-4 dark:border-surface-1-dark">
                            <button
                                disabled={!hasAppliedFilters()}
                                onClick={() => resetFilters()}
                                className={`text-md flex h-10 flex-1 items-center justify-center rounded-md border border-main-text-light bg-white px-2 text-center font-semibold text-main-text-light transition hover:bg-main-text-dark/80 dark:border-main-text-dark dark:bg-main-text-dark dark:bg-main-text-dark/80 ${!hasAppliedFilters() && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                            >
                                {isFilterResetting ? <Spinner /> : __('Reset')}
                            </button>
                            <button
                                disabled={!hasAppliedFilters()}
                                onClick={() => applyFilter()}
                                className={`text-md flex h-10 flex-1 items-center justify-center rounded-md border border-main-text-dark bg-main-text-light px-2 text-center font-semibold text-main-text-dark transition hover:bg-main-text-light/80 dark:bg-main-text-light dark:hover:bg-main-text-light/80 ${!hasAppliedFilters() && 'cursor-not-allowed opacity-25 dark:opacity-40'}`}
                            >
                                {isFilterApplying ? <Spinner /> : __('Apply')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body,
            )}
        </MainLayout>
    );
};

export default index;
