import DisplayPrice from '@/Components/DisplayPrice';
import Spinner from '@/Components/Spinner';
import WebInput from '@/Components/WebInput';
import { useTranslation } from '@/Hooks/useTranslation';
import useWindowSize from '@/Hooks/useWindowSize';
import MainLayout from '@/Layouts/Website/MainLayout';
import { humanize } from '@/Pages/Website/Home/LodgingDetailSections';
import { Head, router } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Placeholder from 'asset/assets/images/product/placeholder.jpg';

// Default (empty) filter shape. Mirrors the backend filter param convention read via
// $request->array('filters') in LodgingProductRepository::getLodgingProductsForStay.
const DEFAULT_FILTERS = {
    price_min: '',
    price_max: '',
    property_types: [],
    room_types: [],
    view_types: [],
    amenities: [],
    parking_types: [],
    cancellation_policies: [],
    bedrooms: 0,
    beds: 0,
    bathrooms: 0,
    guests: 0,
    free_cancellation: false,
    self_checkin: false,
    free_parking: false,
    pets_allowed: false,
    breakfast: false,
    private_bathroom: false,
    bathtub: false,
    jacuzzi: false,
    shower_booth: false,
    ev_charging: false,
    smoking_allowed: false,
    children_allowed: false,
};

// Merge incoming applied_filters over the defaults. amenity ids round-trip through the query string
// as strings; coerce them back to numbers so chip active-state matches the numeric amenity.id.
const hydrateFilters = (applied) => {
    const incoming = applied || {};
    return {
        ...DEFAULT_FILTERS,
        ...incoming,
        amenities: Array.isArray(incoming.amenities) ? incoming.amenities.map(Number) : [],
    };
};

// ---- module-scope presentational helpers (stable identity so controlled inputs keep focus) ----

// Multi-select chip.
const Chip = ({ label, active, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`rounded-full border px-3 py-1.5 text-sm transition-all ${
            active
                ? 'border-main-text-light bg-main-text-light text-main-text-dark dark:border-main-text-dark dark:bg-main-text-dark dark:text-main-text-light'
                : 'border-surface-3-light bg-backgroundLight text-main-text-light dark:border-surface-3-dark dark:bg-surface-1-dark dark:text-main-text-dark'
        }`}
    >
        {label}
    </button>
);

// Boolean toggle row — exact toggle-switch markup from GlobalFilterModal.
const ToggleRow = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between">
        <span className="text-base font-medium text-sub-text-light dark:text-sub-text-dark">
            {label}
        </span>
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                className="sr-only peer"
                checked={!!checked}
                onChange={onChange}
            />
            <div className="h-5 w-9 rounded-full bg-gray-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-4 dark:bg-[#646464] dark:after:bg-[#1e1e1e] dark:peer-checked:bg-[#e1e1e1]" />
        </label>
    </div>
);

const Stepper = ({ label, value, anyLabel, onDec, onInc }) => (
    <div className="flex items-center justify-between">
        <span className="text-base font-medium text-sub-text-light dark:text-sub-text-dark">
            {label}
        </span>
        <div className="flex items-center gap-3">
            <button
                type="button"
                onClick={onDec}
                disabled={Number(value || 0) <= 0}
                className="flex items-center justify-center w-8 h-8 border rounded-full border-surface-3-light text-main-text-light disabled:cursor-not-allowed disabled:opacity-30 dark:border-surface-3-dark dark:text-main-text-dark"
            >
                -
            </button>
            <span className="min-w-[2.5rem] text-center text-sm text-main-text-light dark:text-main-text-dark">
                {Number(value || 0) > 0 ? `${value}+` : anyLabel}
            </span>
            <button
                type="button"
                onClick={onInc}
                className="flex items-center justify-center w-8 h-8 border rounded-full border-surface-3-light text-main-text-light dark:border-surface-3-dark dark:text-main-text-dark"
            >
                +
            </button>
        </div>
    </div>
);

// Uniform Shop-style lodging card (fixed aspect-square cell; no masonry, no hashtag).
const LodgingGridCard = ({ item, onOpen, __ }) => {
    const image = item?.lodging_image_urls?.[0] || item?.cover_image_url || null;
    const closed = item?.is_reservation_closed != false; // truthy / undefined => closed (mirrors feed)

    return (
        <div className="w-full overflow-hidden cursor-pointer group" onClick={() => onOpen(item)}>
            {/* Image (fixed aspect, object-cover) — mirrors Shop's card image wrapper. */}
            <div className="relative w-full overflow-hidden transition-all duration-500 rounded-md aspect-square bg-surface-2-light text-main-text-light dark:bg-surface-2-dark dark:text-main-text-dark lg:group-hover:scale-105">
                {image ? (
                    <img
                        src={image}
                        alt={item?.property_name}
                        className="object-cover w-full h-full"
                        loading="lazy"
                        onError={(e) => {
                            e.target.src = Placeholder;
                        }}
                    />
                ) : (
                    <div className="flex flex-col items-start w-full h-full p-3 overflow-hidden sm:p-4">
                        {item?.content && (
                            <div
                                className="line-clamp-[10] w-full overflow-hidden text-ellipsis break-words text-left text-[14px] leading-relaxed opacity-90"
                                dangerouslySetInnerHTML={{
                                    __html: item.content.trim(),
                                }}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Info (below image) — mirrors Shop's info block placement. */}
            <div className="w-full space-y-1 p-2.5 sm:p-3 lg:p-4">
                <h3 className="text-sm font-medium line-clamp-1 text-main-text-light dark:text-main-text-dark">
                    {item?.property_name}
                </h3>

                {item?.location_name && (
                    <p className="text-xs font-medium line-clamp-1 text-sub-text-light dark:text-sub-text-dark">
                        {item.location_name}
                    </p>
                )}

                {item?.lowest_rate && (
                    <DisplayPrice
                        usdAmount={item.lowest_rate}
                        size="sm"
                        isLodgingProduct={true}
                        showEstimatedLabel={false}
                        className={`text-base font-semibold text-main-text-light dark:text-main-text-dark ${
                            closed ? 'line-through' : ''
                        }`}
                    />
                )}

                {closed && (
                    <span className="inline-block rounded bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                        {__('Sold Out')}
                    </span>
                )}
            </div>
        </div>
    );
};

const index = ({ products, nextPageUrl, filterOptions, applied_filters }) => {
    const windowSize = useWindowSize();
    const { __ } = useTranslation();

    // Mobile breakpoint (same as GlobalFilterModal); reactive via windowSize.
    const isMobile = windowSize.width <= 1024;

    const [productsData, setProductsData] = useState(products || []);
    const [nextPageUrlData, setNextPageUrlData] = useState(nextPageUrl || null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [filters, setFilters] = useState(() => hydrateFilters(applied_filters));

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [showMore, setShowMore] = useState(false);
    const [isFilterApplying, setIsFilterApplying] = useState(false);
    const [isFilterResetting, setIsFilterResetting] = useState(false);

    const loadMoreRef = useRef(null);

// Tracks whether the filter modal is the topmost overlay. A Back press closes it in place.
// The pushed entry carries an EMPTY {} state (no Inertia .page), so Inertia ignores it on
// popstate and the component does NOT reload (same trick Home/index.jsx uses).
const isFilterOpenRef = useRef(false);

    const options = filterOptions || {};

    // ---- grid layout (mirrors Shop's getGridCols exactly) ----
    const getGridCols = () => {
        if (windowSize.width < 640) return 'grid-cols-2';
        if (windowSize.width < 768) return 'grid-cols-2';
        if (windowSize.width < 1024) return 'grid-cols-3';
        if (windowSize.width < 1280) return 'grid-cols-4';
        return 'grid-cols-5';
    };

    // Lodging feed-open route (already exists; renders Home with a direct_lodging deep-link).
    const openLodging = (item) => {
        router.get(
            route('website.lodging.findByPublicId', {
                public_id: item.public_id,
                slug: item.slug,
            }),
        );
    };

    // Keep grid + filter state in sync when the server returns a fresh page (apply / reset / back).
    useEffect(() => {
        setProductsData(products || []);
        setNextPageUrlData(nextPageUrl || null);
    }, [products, nextPageUrl]);

    useEffect(() => {
        setFilters(hydrateFilters(applied_filters));
    }, [applied_filters]);

    const mergeUniqueProducts = (oldItems, newItems) => {
        const map = new Map();
        [...oldItems, ...newItems].forEach((item) => map.set(item.id, item));
        return Array.from(map.values());
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

    useEffect(() => {
        if (!loadMoreRef.current) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                loadMoreProducts();
            }
        });

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [nextPageUrlData]);

    // Lock body scroll while the filter modal is open.
    useEffect(() => {
        if (typeof document === 'undefined') return;
        document.body.style.overflow = isFilterOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isFilterOpen]);



  // Plain popstate: on Back, if modal open just close it. We land on the clean {} buffer,
// which Inertia ignores (no .page) so there is NO reload.
useEffect(() => {
    const handlePopState = () => {
        if (!isFilterOpenRef.current) return;
        isFilterOpenRef.current = false;
        setIsFilterOpen(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
}, []);


    const openFilter = () => {
    if (isFilterOpenRef.current) return;

    isFilterOpenRef.current = true;
    setIsFilterOpen(true);

    try {
        // 1) current entry -> clean /stay back-buffer (empty state)
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('modal');
        window.history.replaceState({}, '', cleanUrl.toString());

        // 2) push modal entry (empty state). Back from here lands on the clean buffer.
        const modalUrl = new URL(window.location.href);
        modalUrl.searchParams.set('modal', 'stay-filters');
        window.history.pushState({}, '', modalUrl.toString());
    } catch (e) {}
};

    const closeFilter = () => {
    if (!isFilterOpenRef.current) return;

    isFilterOpenRef.current = false;
    setIsFilterOpen(false);

    // Strip marker in place (empty state). No history.back, no router visit.
    try {
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('modal');
        window.history.replaceState({}, '', cleanUrl.toString());
    } catch (e) {}
};

    // ---- filter state helpers ----
    const toggleArrayValue = (key, value) => {
        setFilters((prev) => {
            const current = Array.isArray(prev[key]) ? prev[key] : [];
            const exists = current.includes(value);
            return {
                ...prev,
                [key]: exists ? current.filter((v) => v !== value) : [...current, value],
            };
        });
    };

    const setScalar = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

    const stepValue = (key, delta) =>
        setFilters((prev) => ({
            ...prev,
            [key]: Math.max(0, Number(prev[key] || 0) + delta),
        }));

    const isArrChecked = (key, value) =>
        Array.isArray(filters[key]) && filters[key].includes(value);

    // Compact payload: only the active filters (keeps the apply URL clean).
    const buildActiveFilters = () => {
        const f = {};
        if (filters.price_min !== '' && filters.price_min != null) f.price_min = filters.price_min;
        if (filters.price_max !== '' && filters.price_max != null) f.price_max = filters.price_max;
        [
            'property_types',
            'room_types',
            'view_types',
            'amenities',
            'parking_types',
            'cancellation_policies',
        ].forEach((k) => {
            if (Array.isArray(filters[k]) && filters[k].length > 0) f[k] = filters[k];
        });
        ['bedrooms', 'beds', 'bathrooms', 'guests'].forEach((k) => {
            if (Number(filters[k] || 0) > 0) f[k] = filters[k];
        });
        [
            'cancellable',
            'self_checkin',
            'free_parking',
            'pets_allowed',
            'breakfast',
            'private_bathroom',
            'bathtub',
            'jacuzzi',
            'shower_booth',
            'ev_charging',
            'smoking_allowed',
            'children_allowed',
        ].forEach((k) => {
            if (filters[k]) f[k] = true;
        });
        return f;
    };

    const activeFilterCount = () => Object.keys(buildActiveFilters()).length;

    const hasActiveFilters = () => activeFilterCount() > 0;

    // Apply: graceful Inertia GET query-string visit to /stay?filters=... (mirrors Shop's filter
    // apply but as a partial GET). isFilterOpenRef is cleared first so the before-guard lets this
    // intentional visit through; replace:true reuses the modal's pushed history entry so NO dangling
    // entry remains; preserveState keeps the component mounted (no white-flash reload).
    const applyFilters = () => {
        setIsFilterApplying(true);
        isFilterOpenRef.current = false;
        const active = buildActiveFilters();

        router.get(
            route('website.stay.index'),
            Object.keys(active).length ? { filters: active } : {},
            {
                replace: true,
                preserveScroll: true,
                preserveState: true,
                only: ['products', 'nextPageUrl', 'applied_filters'],
                onFinish: () => {
                    setIsFilterApplying(false);
                    setIsFilterOpen(false);
                },
            },
        );
    };

    const clearAll = () => {
        setIsFilterResetting(true);
        setFilters(DEFAULT_FILTERS);
        isFilterOpenRef.current = false;

        router.get(
            route('website.stay.index'),
            {},
            {
                replace: true,
                preserveScroll: true,
                preserveState: true,
                only: ['products', 'nextPageUrl', 'applied_filters'],
                onFinish: () => {
                    setIsFilterResetting(false);
                    setIsFilterOpen(false);
                },
            },
        );
    };

    // ---- shared filter controls (rendered via function call so the price inputs keep focus) ----
    const renderSections = (variant) => {
        const isM = variant === 'mobile';
        const sectionCls = isM
            ? 'border-b border-surface-1-light bg-backgroundLight px-5 py-6 dark:border-surface-3-dark dark:bg-backgroundDark'
            : 'border-b border-surface-3-light px-8 py-6 dark:border-surface-3-dark';
        const headingCls = 'mb-5 text-xs font-semibold text-sub-text-light dark:text-sub-text-dark';

        return (
            <>
                {/* Price */}
                <div className={sectionCls}>
                    <h2 className={headingCls}>{__('Price')}</h2>
                    {/* items-start + dash mt-4 keeps the dash aligned with the input boxes despite
                        WebInput's built-in (label/mb-2/mb-4) vertical spacing. */}
                    <div className="flex items-start gap-3">
                        <WebInput
                            Type="number"
                            Placeholder={__('Min')}
                            Value={filters.price_min}
                            Action={(e) => setScalar('price_min', e.target.value)}
                            CustomCss="w-full"
                        />
                        <span className="mt-4 text-sub-text-light dark:text-sub-text-dark">-</span>
                        <WebInput
                            Type="number"
                            Placeholder={__('Max')}
                            Value={filters.price_max}
                            Action={(e) => setScalar('price_max', e.target.value)}
                            CustomCss="w-full"
                        />
                    </div>
                </div>

                {/* Property type */}
                {options.property_types?.length > 0 && (
                    <div className={sectionCls}>
                        <h2 className={headingCls}>{__('Property type')}</h2>
                        <div className="flex flex-wrap gap-2">
                            {options.property_types.map((opt) => (
                                <Chip
                                    key={opt}
                                    label={__(humanize(opt))}
                                    active={isArrChecked('property_types', opt)}
                                    onClick={() => toggleArrayValue('property_types', opt)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Room type */}
                {options.room_types?.length > 0 && (
                    <div className={sectionCls}>
                        <h2 className={headingCls}>{__('Room type')}</h2>
                        <div className="flex flex-wrap gap-2">
                            {options.room_types.map((opt) => (
                                <Chip
                                    key={opt}
                                    label={__(humanize(opt))}
                                    active={isArrChecked('room_types', opt)}
                                    onClick={() => toggleArrayValue('room_types', opt)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Rooms & beds */}
                <div className={sectionCls}>
                    <h2 className={headingCls}>{__('Rooms and beds')}</h2>
                    <div className="space-y-4">
                        <Stepper
                            label={__('Bedrooms')}
                            value={filters.bedrooms}
                            anyLabel={__('Any')}
                            onDec={() => stepValue('bedrooms', -1)}
                            onInc={() => stepValue('bedrooms', 1)}
                        />
                        <Stepper
                            label={__('Beds')}
                            value={filters.beds}
                            anyLabel={__('Any')}
                            onDec={() => stepValue('beds', -1)}
                            onInc={() => stepValue('beds', 1)}
                        />
                        <Stepper
                            label={__('Bathrooms')}
                            value={filters.bathrooms}
                            anyLabel={__('Any')}
                            onDec={() => stepValue('bathrooms', -1)}
                            onInc={() => stepValue('bathrooms', 1)}
                        />
                        <Stepper
                            label={__('Guests')}
                            value={filters.guests}
                            anyLabel={__('Any')}
                            onDec={() => stepValue('guests', -1)}
                            onInc={() => stepValue('guests', 1)}
                        />
                    </div>
                </div>

                {/* Amenities */}
                {options.amenities?.length > 0 && (
                    <div className={sectionCls}>
                        <h2 className={headingCls}>{__('Amenities')}</h2>
                        <div className="flex flex-wrap gap-2">
                            {options.amenities.map((amenity) => (
                                <Chip
                                    key={amenity.id}
                                    label={__(amenity.name)}
                                    active={isArrChecked('amenities', amenity.id)}
                                    onClick={() => toggleArrayValue('amenities', amenity.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Booking & policy (toggles) */}
                <div className={sectionCls}>
                    <h2 className={headingCls}>{__('Booking and policy')}</h2>
                    <div className="space-y-4">
                        <ToggleRow
                            label={__('Cancellable')}
                            checked={filters.cancellable}
                            onChange={(e) => setScalar('cancellable', e.target.checked)}
                        />
                        <ToggleRow
                            label={__('Self check-in')}
                            checked={filters.self_checkin}
                            onChange={(e) => setScalar('self_checkin', e.target.checked)}
                        />
                        <ToggleRow
                            label={__('Free parking')}
                            checked={filters.free_parking}
                            onChange={(e) => setScalar('free_parking', e.target.checked)}
                        />
                        <ToggleRow
                            label={__('Pets allowed')}
                            checked={filters.pets_allowed}
                            onChange={(e) => setScalar('pets_allowed', e.target.checked)}
                        />
                        <ToggleRow
                            label={__('Breakfast included')}
                            checked={filters.breakfast}
                            onChange={(e) => setScalar('breakfast', e.target.checked)}
                        />
                    </div>
                </div>

                {/* More filters (Group B, collapsed by default) */}
                <div className={isM ? 'px-5 py-6' : 'px-8 py-6'}>
                    <button
                        type="button"
                        onClick={() => setShowMore((v) => !v)}
                        className="flex items-center justify-between w-full text-xs font-semibold text-sub-text-light dark:text-sub-text-dark"
                    >
                        <span>{__('More filters')}</span>
                        <svg
                            className={`h-4 w-4 transition-transform ${showMore ? 'rotate-180' : ''}`}
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

                    {showMore && (
                        <div className="mt-5 space-y-6">
                            {/* View type */}
                            {options.view_types?.length > 0 && (
                                <div>
                                    <h2 className={headingCls}>{__('View type')}</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {options.view_types.map((opt) => (
                                            <Chip
                                                key={opt}
                                                label={__(humanize(opt))}
                                                active={isArrChecked('view_types', opt)}
                                                onClick={() => toggleArrayValue('view_types', opt)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Room amenity toggles */}
                            <div className="space-y-4">
                                <ToggleRow
                                    label={__('Private bathroom')}
                                    checked={filters.private_bathroom}
                                    onChange={(e) =>
                                        setScalar('private_bathroom', e.target.checked)
                                    }
                                />
                                <ToggleRow
                                    label={__('Bathtub')}
                                    checked={filters.bathtub}
                                    onChange={(e) => setScalar('bathtub', e.target.checked)}
                                />
                                <ToggleRow
                                    label={__('Jacuzzi')}
                                    checked={filters.jacuzzi}
                                    onChange={(e) => setScalar('jacuzzi', e.target.checked)}
                                />
                                <ToggleRow
                                    label={__('Shower booth')}
                                    checked={filters.shower_booth}
                                    onChange={(e) => setScalar('shower_booth', e.target.checked)}
                                />
                                <ToggleRow
                                    label={__('Smoking allowed')}
                                    checked={filters.smoking_allowed}
                                    onChange={(e) => setScalar('smoking_allowed', e.target.checked)}
                                />
                                <ToggleRow
                                    label={__('Children allowed')}
                                    checked={filters.children_allowed}
                                    onChange={(e) =>
                                        setScalar('children_allowed', e.target.checked)
                                    }
                                />
                                <ToggleRow
                                    label={__('EV charging')}
                                    checked={filters.ev_charging}
                                    onChange={(e) => setScalar('ev_charging', e.target.checked)}
                                />
                            </div>

                            {/* Parking type */}
                            {options.parking_types?.length > 0 && (
                                <div>
                                    <h2 className={headingCls}>{__('Parking type')}</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {options.parking_types.map((opt) => (
                                            <Chip
                                                key={opt}
                                                label={__(humanize(opt))}
                                                active={isArrChecked('parking_types', opt)}
                                                onClick={() =>
                                                    toggleArrayValue('parking_types', opt)
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Cancellation policy */}
                            {options.cancellation_policies?.length > 0 && (
                                <div>
                                    <h2 className={headingCls}>{__('Cancellation Policy')}</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {options.cancellation_policies.map((opt) => (
                                            <Chip
                                                key={opt}
                                                label={__(humanize(opt))}
                                                active={isArrChecked('cancellation_policies', opt)}
                                                onClick={() =>
                                                    toggleArrayValue('cancellation_policies', opt)
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </>
        );
    };

    const renderFooter = (variant) => {
        const applyCls =
            variant === 'mobile'
                ? 'w-full rounded-md bg-main-text-light px-4 py-3 text-base font-semibold text-main-text-dark transition-colors hover:bg-black/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80'
                : 'w-full rounded-md bg-black px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80';

        return (
            <div className="flex flex-col items-center w-2/3 gap-3 m-auto my-6">
                <button onClick={applyFilters} className={applyCls}>
                    <div className="flex items-center justify-center gap-3">
                        {isFilterApplying && (
                            <Spinner customSize={'size-4'} Color={'fill-black dark:fill-white'} />
                        )}
                        <span>{__('Apply Filters')}</span>
                    </div>
                </button>

                {(hasActiveFilters() || applied_filters) && (
                    <button
                        onClick={clearAll}
                        className="text-sm font-semibold underline text-main-text-light dark:text-main-text-dark"
                    >
                        {isFilterResetting ? <Spinner /> : __('Clear all')}
                    </button>
                )}
            </div>
        );
    };

    const count = activeFilterCount();

    return (
        <MainLayout>
            <Head title={__('Stay', true)} />

            <div className="w-full px-6 lg:mt-6 lg:px-8">
                <div
                    className={`mx-auto w-full ${windowSize.width > 1024 ? 'pb-10' : 'pb-24'} max-w-[1400px]`}
                >
                    {/* Header + Filters button */}
                    <div className="flex items-center justify-between w-full my-2 mb-6">
                        <h1 className="text-[24px] font-semibold text-main-text-light dark:text-main-text-dark">
                            {__('Stay')}
                        </h1>

                        <button
                            type="button"
                            onClick={openFilter}
                            className="relative flex items-center flex-shrink-0 gap-2 px-4 py-2 text-sm transition-all rounded-full bg-surface-1-light text-main-text-light dark:bg-surface-1-dark dark:text-main-text-dark"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M3 4.5h18M6 12h12M10 19.5h4"
                                />
                            </svg>
                            <span>{__('Filters')}</span>
                            {count > 0 && (
                                <span className="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-main-text-light px-1 text-[11px] font-semibold text-main-text-dark dark:bg-main-text-dark dark:text-main-text-light">
                                    {count}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* No Results */}
                    {!isLoadingMore && productsData.length === 0 && (
                        <div className="flex flex-col items-center justify-center w-full py-16 text-center">
                            <h3 className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                {__('No properties found')}
                            </h3>
                            <p className="max-w-md mt-2 text-sm text-sub-text-light dark:text-sub-text-dark">
                                {__('Try adjusting your filters to see more stays.')}
                            </p>
                            {hasActiveFilters() && (
                                <button
                                    onClick={clearAll}
                                    className="mt-5 text-sm font-semibold underline text-main-text-light dark:text-main-text-dark"
                                >
                                    {isFilterResetting ? <Spinner /> : __('Clear all')}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Uniform CSS grid (same container Shop uses; equal cards, aligned rows). */}
                    <div className={`grid ${getGridCols()} w-full gap-3 sm:gap-4 lg:gap-6`}>
                        {productsData.map((item) => (
                            <LodgingGridCard
                                key={`lodging-${item.id}`}
                                item={item}
                                onOpen={openLodging}
                                __={__}
                            />
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

                    {isLoadingMore && !nextPageUrlData && (
                        <div className="flex animate-pulse items-center justify-center gap-2 py-10 text-center text-[10px] text-main-text-light transition-all duration-100 dark:text-main-text-dark lg:text-[18px]">
                            <Spinner />
                            {__('Loading')}...
                        </div>
                    )}
                </div>
            </div>

            {/* Filter modal — full-screen on mobile, centered max-w-3xl on desktop
                (mirrors Pages/Website/GlobalFilters/GlobalFilterModal). */}
            {isFilterOpen &&
                createPortal(
                    isMobile ? (
                        <div className="fixed inset-0 z-[50] flex flex-col bg-backgroundLight dark:bg-backgroundDark">
                            {/* Header */}
                            <div className="relative z-10 flex flex-col w-full bg-backgroundLight text-main-text-light dark:bg-backgroundDark dark:text-main-text-dark">
                                <div className="flex items-center justify-center px-4 py-3">
                                    <button
                                        onClick={closeFilter}
                                        className="absolute p-1 rounded-full left-4 text-main-text-light dark:text-main-text-dark"
                                    >
                                        <ChevronLeft />
                                    </button>
                                    <h2 className="mx-10 text-xl font-semibold text-main-text-light dark:text-main-text-dark">
                                        {__('Filters')}
                                    </h2>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 pb-32 overflow-y-auto scrollbar-none">
                                {renderSections('mobile')}
                                {renderFooter('mobile')}
                            </div>
                        </div>
                    ) : (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <div className="fixed inset-0 bg-black/30" onClick={closeFilter} />
                            <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-md border border-surface-1-light bg-backgroundLight scrollbar dark:border-surface-3-dark dark:bg-surface-1-dark">
                                <div className="pt-8">
                                    <div className="px-8 pb-4 text-start">
                                        <h1 className="text-xl font-semibold text-main-text-light dark:text-main-text-dark">
                                            {__('Filters')}
                                        </h1>
                                    </div>

                                    <div className="overflow-hidden rounded-md">
                                        {renderSections('desktop')}
                                    </div>

                                    {renderFooter('desktop')}
                                </div>
                            </div>
                        </div>
                    ),
                    document.getElementById('modal-root') || document.body,
                )}
        </MainLayout>
    );
};

export default index;
