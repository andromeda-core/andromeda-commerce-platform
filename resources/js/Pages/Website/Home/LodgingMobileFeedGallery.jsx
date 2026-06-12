import InstagramStyledVideoPlayer from '@/Components/InstagramStyledVideoPlayer';
import { router } from '@inertiajs/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import SpatiotemporalInfoModal from '@/Components/SpatiotemporalInfoModal';
import LodgingDetailSections, { humanize } from './LodgingDetailSections';
import { useLanguageStore } from '@/Hooks/useLanguageStore';
import DisplayPrice from '@/Components/DisplayPrice';

/**
 * Stage 3.2 — mobile feed gallery for a LODGING property.
 *
 * Cloned from PostMobileFeedGallery's shell (portal + back/actions header + swipeable media
 * gallery + SpatiotemporalInfoModal), adapted for lodging: no bookmark, no cart/buy-now.
 * Shows property details, price, the manual-approval notice, and a Reserve / Login CTA.
 * member_price is never shown. All customer-facing text is translated via __().
 */
const LodgingMobileFeedGallery = ({
    lodging,
    setShowQrCode,
    setLinkCopied,
    auth,
    navigateToHashtag,
    placeholderImage,
    __,
    shouldCleanupBrowserHistoryRef,
    setMobileFeedGalleryOpen,
    spatiotemporalInfoModal,
    setSpatiotemporalInfoModal,
    previous_url,
    generateLodgingURL,
    openReservationPanel,
}) => {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [actionDropdownOpen, setActionDropdownOpen] = useState(null);
    const actionDropdownRef = useRef(null);
    const thumbnailContainerRef = useRef(null);
    const scrollContainerRef = useRef(null);
    // Translations may still be loading when the lodging viewer mounts; gate the lodging detail
    // chips on it so they never flash "Loading...." labels (or "[object Object]" joined values).
    const translationsLoading = useLanguageStore((state) => state.loading);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (actionDropdownRef.current && !actionDropdownRef.current.contains(event.target)) {
                setActionDropdownOpen(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleScroll = (e) => {
        const container = e.target;
        const scrollLeft = container.scrollLeft;
        const itemWidth = container.offsetWidth;
        const newIndex = Math.round(scrollLeft / itemWidth);

        if (newIndex !== currentMediaIndex) {
            setCurrentMediaIndex(newIndex);

            const activeThumb = thumbnailContainerRef.current?.children[newIndex];
            activeThumb?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
            });
        }
    };

    const handleThumbnailClick = (index) => {
        setCurrentMediaIndex(index);
        const targetMainItem = scrollContainerRef.current?.children[index];
        targetMainItem?.scrollIntoView({
            behavior: 'instant',
            block: 'nearest',
            inline: 'start',
        });
    };

    const mediaItems = useMemo(() => {
        return (Array.isArray(lodging?.media) ? lodging.media : []).map((m) => ({
            type: m.type === 'video' ? 'video' : 'image',
            url: m.url,
            thumbnail_url: m.thumbnail_url,
        }));
    }, [lodging]);

    // Lock body scroll while the gallery is open.
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';

        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, []);

    return (
        <>
            {createPortal(
                <div className="fixed inset-0 z-[70] flex flex-col overscroll-contain bg-backgroundLight dark:bg-backgroundDark">
                    <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-[1.4rem]">
                        <button
                            onClick={() => {
                                if (previous_url) {
                                    shouldCleanupBrowserHistoryRef.current = false;
                                    router.visit(previous_url);
                                } else {
                                    setMobileFeedGalleryOpen(false);
                                }
                            }}
                            className="text-[18px] font-semibold"
                            aria-label="Back"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="size-6 text-main-text-light dark:text-main-text-dark"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 19.5 8.25 12l7.5-7.5"
                                />
                            </svg>
                        </button>

                        {lodging?.tag && (
                            <button
                                onClick={() => {
                                    shouldCleanupBrowserHistoryRef.current = false;
                                    navigateToHashtag(lodging?.tag);
                                }}
                                className="text-[18px] font-semibold text-main-text-light dark:text-main-text-dark"
                            >
                                {lodging.tag_display ?? lodging.tag}
                            </button>
                        )}
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 px-8 overflow-y-auto scrollbar-none">
                        {mediaItems?.length > 0 && (
                            <div className="relative">
                                <div
                                    ref={scrollContainerRef}
                                    onScroll={handleScroll}
                                    className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
                                    style={{
                                        scrollbarWidth: 'none',
                                        msOverflowStyle: 'none',
                                        WebkitOverflowScrolling: 'touch',
                                        scrollSnapType: 'x mandatory',
                                        height: 'calc(100vh - 320px)',
                                    }}
                                >
                                    {mediaItems.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-center w-full h-full shrink-0 snap-center snap-always"
                                        >
                                            {item.type === 'image' ? (
                                                <img
                                                    src={item.url || placeholderImage}
                                                    alt={`${lodging?.property_name} ${index}`}
                                                    className="object-cover w-full h-full max-w-full max-h-full rounded-md"
                                                    loading="eager"
                                                    fetchpriority="high"
                                                    decoding="async"
                                                    onError={(e) =>
                                                        (e.target.src = placeholderImage)
                                                    }
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full">
                                                    <InstagramStyledVideoPlayer
                                                        thumbnail={
                                                            item?.thumbnail_url || placeholderImage
                                                        }
                                                        className="object-cover w-full h-full"
                                                        videoUrl={item.url}
                                                        Preload="metadata"
                                                        timelinePadding={2}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Thumbnails */}
                        <div className="flex items-center justify-start gap-0 pt-4">
                            {mediaItems.length > 1 && (
                                <div
                                    ref={thumbnailContainerRef}
                                    className="flex items-center gap-3 overflow-x-auto scrollbar-none"
                                    style={{ scrollBehavior: 'smooth' }}
                                >
                                    {mediaItems.map((mediaItem, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleThumbnailClick(index)}
                                            className={`aspect-square ${currentMediaIndex === index ? 'border-[3px] border-main-text-light dark:border-main-text-dark' : ''} w-[clamp(70px,5vw,70px)] flex-shrink-0 overflow-hidden rounded-md transition-all`}
                                        >
                                            <img
                                                src={
                                                    (mediaItem?.type === 'image'
                                                        ? mediaItem?.url
                                                        : mediaItem?.thumbnail_url) ||
                                                    placeholderImage
                                                }
                                                alt={`Thumbnail ${index + 1}`}
                                                className="object-cover w-full h-full"
                                                loading={currentMediaIndex === index ? 'eager' : 'lazy'}
                                                decoding="async"
                                                onError={(e) => (e.target.src = placeholderImage)}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="mt-4 mb-10">
                            {/* Actions (Copy Link + Spatiotemporal Info; NO bookmark) */}
                            <div className="flex items-center justify-end mb-3">
                                <div className="relative" ref={actionDropdownRef}>
                                    <button
                                        className="text-main-text-light dark:text-main-text-dark"
                                        onClick={() => setActionDropdownOpen(!actionDropdownOpen)}
                                        aria-label="Actions"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2.5}
                                            stroke="currentColor"
                                            className="h-7 w-7"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="
      M3.5 12a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0
      M12 12a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0
      M20.5 12a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0
    "
                                            />
                                        </svg>
                                    </button>

                                    {actionDropdownOpen && (
                                        <div className="absolute right-0 z-50 w-56 border rounded-md top-full border-surface-3-light bg-backgroundLight dark:border-surface-3-dark dark:bg-surface-1-dark">
                                            <div className="py-1">
                                                {/* QR Code */}
                                                <button
                                                    onClick={() => {
                                                        setShowQrCode(true);
                                                        setActionDropdownOpen(null);
                                                    }}
                                                    className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light dark:text-main-text-dark"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="w-5 h-5"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"
                                                        />
                                                    </svg>
                                                    <span>{__('QR Code')}</span>
                                                </button>

                                                {/* Copy Link */}
                                                <button
                                                    onClick={() => {
                                                        const url =
                                                            window.location.origin +
                                                            generateLodgingURL(lodging, true, true);
                                                        navigator.clipboard.writeText(url.trim());
                                                        setLinkCopied(true);
                                                        setActionDropdownOpen(null);
                                                    }}
                                                    className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light dark:text-main-text-dark"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="w-5 h-5"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                                                        />
                                                    </svg>
                                                    <span>{__('Copy Link')}</span>
                                                </button>

                                                {lodging?.latitude != null &&
                                                    lodging?.longitude != null && (
                                                        <button
                                                            onClick={() => {
                                                                setSpatiotemporalInfoModal(true);
                                                                setActionDropdownOpen(null);
                                                            }}
                                                            className="flex items-center w-full gap-3 px-4 py-3 text-sm transition-colors rounded-md text-main-text-light dark:text-main-text-dark"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={1.5}
                                                                stroke="currentColor"
                                                                className="w-5 h-5"
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
                                                            <span className="font-normal">
                                                                {__('Spatiotemporal Info')}
                                                            </span>
                                                        </button>
                                                    )}

                                                {/* Post Created */}
                                                <span className="flex items-center w-full gap-3 px-4 py-3 text-xs transition-colors rounded-md text-main-text-light dark:text-main-text-dark">
                                                    <span>
                                                        {__('Post Created')}:
                                                        <p>
                                                            {lodging?.added_at}{' '}
                                                            {lodging?.created_at_time}
                                                        </p>
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Name + type + location */}
                            <h2 className="mb-1 text-xl font-semibold text-main-text-light dark:text-main-text-dark">
                                {lodging?.property_name}
                            </h2>
                            {lodging?.property_type && (
                                <p className="mb-1 text-sm capitalize text-sub-text-light dark:text-sub-text-dark">
                                    {__(humanize(lodging.property_type))}
                                </p>
                            )}
                            {lodging?.city_region && (
                                <p className="mb-1 text-sm font-medium break-words text-main-text-light dark:text-main-text-dark">
                                    {lodging.city_region}
                                </p>
                            )}
                            {lodging?.location_name && (
                                <p className="mb-3 text-sm text-sub-text-light dark:text-sub-text-dark">
                                    {lodging.location_name}
                                </p>
                            )}
                            {lodging?.location_description && (
                                <p className="mb-3 text-sm break-all text-sub-text-light dark:text-sub-text-dark">
                                    {lodging.location_description}
                                </p>
                            )}

                            {/* Price */}
                            {lodging?.lowest_rate != null && (
                                <div className="mb-4">
                                    <DisplayPrice
                                        usdAmount={lodging.lowest_rate}
                                        isLodgingProduct={true}
                                        paymentDisplay={true}
                                        size="lg"
                                        className="text-main-text-light dark:text-main-text-dark"
                                    />
                                </div>
                            )}

                            {/* Quick facts: property-level base check-in / check-out times */}
                            {(lodging?.base_checkin_time || lodging?.base_checkout_time) && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {lodging?.base_checkin_time && (
                                        <span className="rounded-md bg-surface-1-light px-3 py-1 text-xs text-main-text-light dark:bg-surface-2-dark dark:text-main-text-dark">
                                            <span className="font-medium">{__('Check-in')}:</span>{' '}
                                            {lodging.base_checkin_time}
                                        </span>
                                    )}
                                    {lodging?.base_checkout_time && (
                                        <span className="rounded-md bg-surface-1-light px-3 py-1 text-xs text-main-text-light dark:bg-surface-2-dark dark:text-main-text-dark">
                                            <span className="font-medium">{__('Check-out')}:</span>{' '}
                                            {lodging.base_checkout_time}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="mb-4 h-px w-full bg-[#c8c8c8] dark:bg-surface-3-dark" />

                            {/* Approval notice */}
                            {lodging?.requires_hotel_approval && (
                                <p className="mb-4 text-sm italic text-sub-text-light dark:text-sub-text-dark">
                                    {__('This property requires approval before payment.')}
                                </p>
                            )}

                            {/* Stage 3.3 — property-level Reserve/Login/Register removed.
                                Reservation is now per rate plan (button on each rate-plan row below). */}

                            {/* Description (admin HTML content) */}
                            {lodging?.content && (
                                <div
                                                                       className="prose prose-sm max-w-none flex-1 overflow-y-auto whitespace-pre-line break-all pr-2 text-[14px] font-normal text-main-text-light dark:prose-invert dark:text-main-text-dark"

                                    dangerouslySetInnerHTML={{ __html: lodging.content }}
                                />
                            )}

                            {translationsLoading ? (
                                <div
                                    className="w-full mt-3 space-y-3 animate-pulse"
                                    aria-hidden="true"
                                >
                                    <div className="h-4 rounded w-28 bg-surface-1-light dark:bg-surface-2-dark" />
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        <div className="rounded h-9 bg-surface-1-light dark:bg-surface-2-dark" />
                                        <div className="rounded h-9 bg-surface-1-light dark:bg-surface-2-dark" />
                                        <div className="rounded h-9 bg-surface-1-light dark:bg-surface-2-dark" />
                                        <div className="rounded h-9 bg-surface-1-light dark:bg-surface-2-dark" />
                                    </div>
                                </div>
                            ) : (
                                <LodgingDetailSections
                                    lodging={lodging}
                                    openReservationPanel={openReservationPanel}
                                    __={__}
                                    variant="mobile"
                                />
                            )}

                            {/* Rooms + rate plans (sale_price only; member_price never rendered) */}
                            {false && Array.isArray(lodging?.rooms) && lodging.rooms.length > 0 && (
                                <>
                                    <div className="mb-4 h-px w-full bg-[#c8c8c8] dark:bg-surface-3-dark" />
                                    <div className="mb-4">
                                        <h3 className="mb-3 text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                            {__('Rooms')}
                                        </h3>
                                        {lodging?.is_reservation_closed === true && (
                                            <p className="mb-3 text-sm italic text-sub-text-light dark:text-sub-text-dark">
                                                {__('Not available for reservation')}
                                            </p>
                                        )}
                                        <div className="flex flex-col gap-3">
                                            {lodging.rooms.map((room) => (
                                                <div
                                                    key={room.id}
                                                    className="p-4 border rounded-md border-surface-3-light dark:border-surface-3-dark"
                                                >
                                                    <p className="text-sm font-semibold break-words text-main-text-light dark:text-main-text-dark">
                                                        {room.room_name}
                                                    </p>
                                                    {(room.max_guests != null ||
                                                        room.standard_guests != null) && (
                                                        <p className="mt-1 text-xs text-sub-text-light dark:text-sub-text-dark">
                                                            {__('Sleeps')}{' '}
                                                            {room.max_guests ?? room.standard_guests}
                                                        </p>
                                                    )}

                                                    {Array.isArray(room.rate_plans) &&
                                                        room.rate_plans.length > 0 && (
                                                            <div className="flex flex-col gap-2 mt-3">
                                                                {room.rate_plans.map((plan) => {
                                                                    const canReserve =
                                                                        room?.is_available !== false &&
                                                                        plan?.is_bookable !== false &&
                                                                        plan?.is_active !== false;

                                                                    return (
                                                                    <div
                                                                        key={plan.id}
                                                                        className="flex items-center justify-between gap-3 px-3 py-2 rounded-sm bg-surface-1-light dark:bg-surface-2-dark"
                                                                    >
                                                                        <div className="flex flex-col min-w-0">
                                                                            <span className="min-w-0 text-xs break-words text-main-text-light dark:text-main-text-dark">
                                                                                {plan.name}
                                                                            </span>
                                                                            {plan.sale_price !=
                                                                                null && (
                                                                                <span className="text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                                                                    {lodging.currency_code}{' '}
                                                                                    {Number(
                                                                                        plan.sale_price,
                                                                                    ).toFixed(2)}
                                                                                    <span className="ml-1 text-xs font-normal text-sub-text-light dark:text-sub-text-dark">
                                                                                        /{' '}
                                                                                        {__('night')}
                                                                                    </span>
                                                                                </span>
                                                                            )}
                                                                            {!canReserve &&
                                                                                lodging?.is_reservation_closed !==
                                                                                    true && (
                                                                                    <span className="mt-1 text-xs italic text-sub-text-light dark:text-sub-text-dark">
                                                                                        {__(
                                                                                            'Not available for reservation',
                                                                                        )}
                                                                                    </span>
                                                                                )}
                                                                        </div>
                                                                        {/* Stage 3.3 — per-rate-plan Reserve (replaces property-level button) */}
                                                                        {lodging?.is_reservation_closed !==
                                                                            true && (
                                                                                <button
                                                                                    type="button"
                                                                                    disabled={!canReserve}
                                                                                    onClick={
                                                                                        canReserve
                                                                                            ? () =>
                                                                                                  openReservationPanel(
                                                                                                      {
                                                                                                          lodging,
                                                                                                          room,
                                                                                                          ratePlan:
                                                                                                              plan,
                                                                                                      },
                                                                                                  )
                                                                                            : undefined
                                                                                    }
                                                                                    className={`shrink-0 rounded-md bg-main-text-light px-4 py-2 text-xs font-semibold text-main-text-dark transition hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80 ${
                                                                                        canReserve
                                                                                            ? ''
                                                                                            : 'cursor-not-allowed opacity-50 hover:bg-main-text-light dark:hover:bg-main-text-dark'
                                                                                    }`}
                                                                                >
                                                                                    {__('Reserve')}
                                                                                </button>
                                                                            )}
                                                                    </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Amenities */}
                            {false && Array.isArray(lodging?.amenities) && lodging.amenities.length > 0 && (
                                <>
                                    <div className="mb-4 h-px w-full bg-[#c8c8c8] dark:bg-surface-3-dark" />
                                    <div className="mb-4">
                                        <h3 className="mb-3 text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                            {__('Amenities')}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {lodging.amenities.map((amenity) => (
                                                <span
                                                    key={amenity.id}
                                                    className="px-3 py-1 text-xs rounded-full bg-surface-1-light text-main-text-light dark:bg-surface-2-dark dark:text-main-text-dark"
                                                >
                                                    {amenity.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Policies (check-in / check-out / cancellation / parking) */}
                            {false && lodging?.policies && (
                                <>
                                    <div className="mb-4 h-px w-full bg-[#c8c8c8] dark:bg-surface-3-dark" />
                                    <div className="mb-4">
                                        <h3 className="mb-3 text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                            {__('Policies')}
                                        </h3>
                                        <div className="flex flex-col gap-2 text-sm text-sub-text-light dark:text-sub-text-dark">
                                            {lodging.policies.checkin_time && (
                                                <p>
                                                    <span className="font-medium text-main-text-light dark:text-main-text-dark">
                                                        {__('Check-in')}:
                                                    </span>{' '}
                                                    {lodging.policies.checkin_time}
                                                </p>
                                            )}
                                            {lodging.policies.checkout_time && (
                                                <p>
                                                    <span className="font-medium text-main-text-light dark:text-main-text-dark">
                                                        {__('Check-out')}:
                                                    </span>{' '}
                                                    {lodging.policies.checkout_time}
                                                </p>
                                            )}
                                            {lodging.policies.cancellation_policy && (
                                                <p>
                                                    <span className="font-medium text-main-text-light dark:text-main-text-dark">
                                                        {__('Cancellation')}:
                                                    </span>{' '}
                                                    <span className="capitalize">
                                                        {lodging.policies.cancellation_policy.replace(
                                                            /_/g,
                                                            ' ',
                                                        )}
                                                    </span>
                                                </p>
                                            )}
                                            {lodging.policies.parking_type && (
                                                <p>
                                                    <span className="font-medium text-main-text-light dark:text-main-text-dark">
                                                        {__('Parking')}:
                                                    </span>{' '}
                                                    <span className="capitalize">
                                                        {lodging.policies.parking_type.replace(
                                                            /_/g,
                                                            ' ',
                                                        )}
                                                    </span>{' '}
                                                    (
                                                    {lodging.policies.parking_free
                                                        ? __('Free')
                                                        : __('Paid')}
                                                    )
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>,
                document.getElementById('modal-root') || document.body,
            )}

            {spatiotemporalInfoModal && (
                <SpatiotemporalInfoModal
                    onClose={() => {
                        setSpatiotemporalInfoModal(false);
                    }}
                    post={lodging}
                />
            )}
        </>
    );
};

export default LodgingMobileFeedGallery;
