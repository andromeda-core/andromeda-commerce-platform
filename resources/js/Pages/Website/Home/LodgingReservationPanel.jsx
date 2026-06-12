import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import useWindowSize from '@/Hooks/useWindowSize';
import Spinner from '@/Components/Spinner';

/**
 * Stage 3.3 — rate-plan-level reservation slide-in.
 *
 * Opened from inside the feed viewer (DesktopFeed / LodgingMobileFeedGallery) for ONE rate plan.
 * Desktop: right-side drawer over the viewer. Mobile: bottom sheet.
 *
 * History-safety: this panel does NOT manage history itself. index.jsx pushes `?reserve=<id>` on
 * open / replaceState on close and intercepts the Back button (first-priority popstate check) so
 * closing the panel never breaks feed navigation. Here we only render + submit.
 *
 * POSTs to website.lodging-reservations.store with the rate-plan triple. The online amount shown
 * is DISPLAY-ONLY and mirrors the server formula exactly (sale_price * nights + online-flagged
 * service/cleaning/tax fees). The server recomputes the authoritative amount. member_price is
 * never used or shown.
 */

// Add `n` whole days to a 'Y-m-d' string and return a new 'Y-m-d' string.
const addDaysStr = (dateStr, n) => {
    if (!dateStr) return null;
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + n);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const LodgingReservationPanel = ({
    open,
    onClose,
    lodging,
    selectedRoom,
    selectedRatePlan,
    auth,
    __,
}) => {
    const windowSize = useWindowSize();
    const isDesktop = windowSize.width >= 1024;

    const isCustomer = !!auth?.user && auth?.user?.role === 'Customer';

    const checkinRef = useRef(null);
    const checkoutRef = useRef(null);
    const checkinFpRef = useRef(null);
    const checkoutFpRef = useRef(null);

    // Slide-in enter animation: render off-screen, then flip on after first paint.
    const [shown, setShown] = useState(false);
    useEffect(() => {
        const id = requestAnimationFrame(() => setShown(true));
        return () => cancelAnimationFrame(id);
    }, []);

    // Mobile drag-to-dismiss (bottom sheet) — mirrors SpatiotemporalModal. These only drive the
    // mobile inline transform + backdrop opacity below; desktop is unaffected (gated on !isDesktop).
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [translateY, setTranslateY] = useState(0);
    const dragThreshold = 150;
    const modalRef = useRef(null);

    const handleTouchStart = (e) => {
        setIsDragging(true);
        setStartY(e.touches[0].clientY);
    };
    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const diff = e.touches[0].clientY - startY;
        if (diff > 0) setTranslateY(diff);
    };
    const handleTouchEnd = () => {
        setIsDragging(false);
        if (translateY > dragThreshold) {
            setTranslateY(window.innerHeight);
            setTimeout(() => onClose(), 50);
        } else {
            setTranslateY(0);
        }
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        lodging_product_id: lodging?.id ?? '',
        lodging_room_id: selectedRoom?.id ?? '',
        lodging_rate_plan_id: selectedRatePlan?.id ?? '',
        checkin_date: '',
        checkout_date: '',
        guest_count: 1,
        request_message: '',
    });

    const currency = lodging?.currency_code ?? '';
    const salePrice = Number(selectedRatePlan?.sale_price) || 0;
    const maxGuests =
        selectedRoom?.max_guests != null ? Number(selectedRoom.max_guests) : null;
    const minNights =
        selectedRatePlan?.minimum_nights != null ? Number(selectedRatePlan.minimum_nights) : null;
    const maxNights =
        selectedRatePlan?.maximum_nights != null ? Number(selectedRatePlan.maximum_nights) : null;

    // Whole nights between the two chosen dates (display only; server is authoritative).
    const nights = useMemo(() => {
        if (!data.checkin_date || !data.checkout_date) return 0;
        const inD = new Date(data.checkin_date + 'T00:00:00');
        const outD = new Date(data.checkout_date + 'T00:00:00');
        const diff = Math.round((outD - inD) / 86400000);
        return diff > 0 ? diff : 0;
    }, [data.checkin_date, data.checkout_date]);

    // Online-flagged fees only (gated by *_online), mirroring the server formula exactly.
    const onlineFees = lodging?.policies?.online_fees || null;
    const feeLines = useMemo(() => {
        const lines = [];
        if (onlineFees) {
            if (onlineFees.service_fee_online && onlineFees.service_fee != null) {
                lines.push({ label: __('Service fee'), amount: Number(onlineFees.service_fee) });
            }
            if (onlineFees.cleaning_fee_online && onlineFees.cleaning_fee != null) {
                lines.push({ label: __('Cleaning fee'), amount: Number(onlineFees.cleaning_fee) });
            }
            if (onlineFees.tax_online && onlineFees.tax_amount != null) {
                lines.push({ label: __('Tax'), amount: Number(onlineFees.tax_amount) });
            }
        }
        return lines;
    }, [onlineFees, __]);

    const roomSubtotal = useMemo(() => salePrice * nights, [salePrice, nights]);
    const onlineTotal = useMemo(() => {
        const fees = feeLines.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
        return Math.round((roomSubtotal + fees) * 100) / 100;
    }, [roomSubtotal, feeLines]);

    // Client-side guards (the server enforces these too; this is UX only).
    const guestError =
        data.guest_count < 1
            ? __('At least one guest is required')
            : maxGuests && data.guest_count > maxGuests
              ? `${__('Maximum guests for this room is')} ${maxGuests}`
              : null;

    const nightsError =
        nights > 0 && minNights && nights < minNights
            ? `${__('Minimum stay is')} ${minNights} ${__('nights')}`
            : nights > 0 && maxNights && nights > maxNights
              ? `${__('Maximum stay is')} ${maxNights} ${__('nights')}`
              : null;

    // Same-day / cutoff guards from the rate plan (server is authoritative; this mirrors it for
    // UX). "Today" and "now" are read in UTC (toISOString) to match the backend (Carbon UTC); both
    // apply only when the chosen check-in date is today, and an unset rule never blocks.
    const todayUtc = new Date().toISOString().slice(0, 10);
    const nowTimeUtc = new Date().toISOString().slice(11, 16); // 'HH:MM' UTC
    const isCheckinToday = !!data.checkin_date && data.checkin_date === todayUtc;
    const cutoffTime =
        typeof selectedRatePlan?.booking_cutoff_time === 'string' &&
        /^\d{1,2}:\d{2}$/.test(selectedRatePlan.booking_cutoff_time.trim())
            ? selectedRatePlan.booking_cutoff_time.trim().padStart(5, '0')
            : null;

    const sameDayError =
        isCheckinToday && selectedRatePlan?.same_day_booking_allowed === false
            ? __('Same-day booking is not available for this rate plan')
            : isCheckinToday && cutoffTime && nowTimeUtc > cutoffTime
              ? __('Bookings for today have closed for this rate plan')
              : null;

    // Consecutive-nights rule from the rate plan (server is authoritative; this mirrors it for UX).
    // When consecutive_nights_allowed is explicitly false the plan is single-night-only, so a stay
    // of more than one night is blocked. A true/null flag (the default) never blocks.
    const consecutiveNightsError =
        nights > 1 && selectedRatePlan?.consecutive_nights_allowed === false
            ? __('This rate plan is available for one-night stays only')
            : null;

    const canSubmit =
        !processing &&
        !!data.checkin_date &&
        !!data.checkout_date &&
        nights > 0 &&
        !nightsError &&
        !guestError &&
        !sameDayError &&
        !consecutiveNightsError;

    // Flatpickr: check-in (minDate today) + check-out (minDate = day after check-in).
    useEffect(() => {
        if (!isCustomer) return undefined;

        checkinFpRef.current = flatpickr(checkinRef.current, {
            dateFormat: 'Y-m-d',
            minDate: 'today',
            disableMobile: true,
            onChange: (_dates, dateStr) => {
                setData((prev) => {
                    const next = { ...prev, checkin_date: dateStr };
                    // Clear an invalid check-out (must be at least one night later).
                    if (prev.checkout_date && prev.checkout_date <= dateStr) {
                        next.checkout_date = '';
                        checkoutFpRef.current?.clear();
                    }
                    return next;
                });
                // Check-out can never be on/before the new check-in.
                checkoutFpRef.current?.set('minDate', addDaysStr(dateStr, 1));
            },
        });

        checkoutFpRef.current = flatpickr(checkoutRef.current, {
            dateFormat: 'Y-m-d',
            minDate: addDaysStr(new Date().toISOString().slice(0, 10), 1),
            disableMobile: true,
            onChange: (_dates, dateStr) => {
                setData('checkout_date', dateStr);
            },
        });

        return () => {
            checkinFpRef.current?.destroy();
            checkoutFpRef.current?.destroy();
            checkinFpRef.current = null;
            checkoutFpRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCustomer]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        post(route('website.lodging-reservations.store'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const panelTransform = isDesktop
        ? shown
            ? 'translate-x-0'
            : 'translate-x-full'
        : shown
          ? 'translate-y-0'
          : 'translate-y-full';

    const panelPosition = isDesktop
        ? 'ml-auto h-full w-full max-w-md'
        : 'mt-auto max-h-[92vh] w-full rounded-t-2xl';

    // Display-only thousand separators (1000 -> 1,000.00). The authoritative online amount is
    // recomputed server-side; this formatter never changes any value used in the math.
    const fmt = (n) =>
        `${currency} ${Number(n || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`.trim();

    return createPortal(
        <div className="fixed inset-0 z-[120] flex">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
                style={
                    !isDesktop
                        ? { opacity: isDragging ? Math.max(0.4 - translateY / 500, 0) : 0.4 }
                        : {}
                }
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={
                    !isDesktop
                        ? {
                              transform: `translateY(${translateY}px)`,
                              transition: isDragging
                                  ? 'none'
                                  : 'transform 0.3s cubic-bezier(0.32,0.72,0,1)',
                          }
                        : {}
                }
                className={`relative flex flex-col overflow-hidden border-surface-3-light bg-backgroundLight shadow-xl transition-transform duration-300 ease-out dark:border-surface-3-dark dark:bg-backgroundDark ${panelPosition} ${panelTransform} ${isDesktop ? 'border-l' : 'border-t'}`}
            >
                {/* Mobile drag handle */}
                {!isDesktop && (
                    <div className="flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 rounded-full bg-surface-3-light dark:bg-surface-3-dark" />
                    </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between gap-3 px-5 py-4 border-b shrink-0 border-surface-3-light dark:border-surface-3-dark">
                    <div className="min-w-0">
                        <h2 className="text-lg font-semibold truncate text-main-text-light dark:text-main-text-dark">
                            {lodging?.property_name}
                        </h2>
                        <p className="mt-0.5 truncate text-sm text-sub-text-light dark:text-sub-text-dark">
                            {selectedRoom?.room_name}
                            {selectedRatePlan?.name ? ` · ${selectedRatePlan.name}` : ''}
                        </p>
                    </div>
                    {/* <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex items-center justify-center w-8 h-8 transition rounded-full shrink-0 hover:bg-surface-1-light dark:hover:bg-surface-2-dark"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button> */}
                </div>

                {/* Body */}
                <div className="flex-1 px-5 py-4 overflow-y-auto scrollbar-none">
                    {!isCustomer ? (
                        // Belt-and-suspenders: the Reserve button gates this, but never show the form
                        // to a non-customer.
                        <div className="p-4 text-center border rounded-md border-surface-3-light bg-surface-1-light dark:border-surface-3-dark dark:bg-surface-2-dark">
                            <p className="text-sm text-sub-text-light dark:text-sub-text-dark">
                                {__('Login to Reserve')}
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {/* Rate summary */}
                            <div className="flex items-baseline justify-between">
                                <span className="text-sm text-sub-text-light dark:text-sub-text-dark">
                                    {selectedRatePlan?.name}
                                </span>
                                <span className="text-base font-semibold text-main-text-light dark:text-main-text-dark">
                                    {fmt(salePrice)}
                                    <span className="ml-1 text-xs font-normal text-sub-text-light dark:text-sub-text-dark">
                                        / {__('night')}
                                    </span>
                                </span>
                            </div>
                            {maxGuests != null && (
                                <p className="-mt-2 text-xs text-sub-text-light dark:text-sub-text-dark">
                                    {__('Sleeps')} {maxGuests}
                                </p>
                            )}

                            <div className="w-full h-px bg-surface-3-light dark:bg-surface-3-dark" />

                            {/* Check-in */}
                            <div>
                                <label className="block mb-1 text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                    {__('Check-in')}
                                </label>
                                <input
                                    ref={checkinRef}
                                    type="text"
                                    readOnly
                                    placeholder={__('Check-in')}
                                    value={data.checkin_date}
                                    onChange={() => {}}
                                    className="w-full px-3 py-2 text-sm border rounded-md outline-none border-surface-3-light bg-backgroundLight text-main-text-light focus:border-main-text-light dark:border-surface-3-dark dark:bg-surface-1-dark dark:text-main-text-dark"
                                />
                                {errors.checkin_date && (
                                    <p className="mt-1 text-xs text-red-500">{errors.checkin_date}</p>
                                )}
                                {/* Same-day / cutoff rate-plan rule (UX mirror of the server guard). */}
                                {sameDayError && (
                                    <p className="mt-1 text-xs text-red-500">{sameDayError}</p>
                                )}
                            </div>

                            {/* Check-out */}
                            <div>
                                <label className="block mb-1 text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                    {__('Check-out')}
                                </label>
                                <input
                                    ref={checkoutRef}
                                    type="text"
                                    readOnly
                                    placeholder={__('Check-out')}
                                    value={data.checkout_date}
                                    onChange={() => {}}
                                    className="w-full px-3 py-2 text-sm border rounded-md outline-none border-surface-3-light bg-backgroundLight text-main-text-light focus:border-main-text-light dark:border-surface-3-dark dark:bg-surface-1-dark dark:text-main-text-dark"
                                />
                                {errors.checkout_date && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.checkout_date}
                                    </p>
                                )}
                            </div>

                            {/* Nights (read-only) */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                    {__('Nights')}
                                </span>
                                <span className="text-sm text-main-text-light dark:text-main-text-dark">
                                    {nights}
                                </span>
                            </div>
                            {nightsError && <p className="-mt-2 text-xs text-red-500">{nightsError}</p>}
                            {/* Consecutive-nights rate-plan rule (UX mirror of the server guard). */}
                            {consecutiveNightsError && (
                                <p className="-mt-2 text-xs text-red-500">{consecutiveNightsError}</p>
                            )}

                            {/* Guests */}
                            <div>
                                <label className="block mb-1 text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                    {__('Guests')}
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={maxGuests ?? undefined}
                                    value={data.guest_count}
                                    onChange={(e) =>
                                        setData('guest_count', Number(e.target.value) || 1)
                                    }
                                    className="w-full px-3 py-2 text-sm border rounded-md outline-none border-surface-3-light bg-backgroundLight text-main-text-light focus:border-main-text-light dark:border-surface-3-dark dark:bg-surface-1-dark dark:text-main-text-dark"
                                />
                                {guestError && (
                                    <p className="mt-1 text-xs text-red-500">{guestError}</p>
                                )}
                                {errors.guest_count && (
                                    <p className="mt-1 text-xs text-red-500">{errors.guest_count}</p>
                                )}
                            </div>

                            {/* Request message */}
                            <div>
                                <label className="block mb-1 text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                    {__('Request message (optional)')}
                                </label>
                                <textarea
                                    rows={3}
                                    maxLength={2000}
                                    value={data.request_message}
                                    onChange={(e) => setData('request_message', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border rounded-md outline-none resize-none border-surface-3-light bg-backgroundLight text-main-text-light focus:border-main-text-light dark:border-surface-3-dark dark:bg-surface-1-dark dark:text-main-text-dark"
                                />
                                {errors.request_message && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.request_message}
                                    </p>
                                )}
                            </div>

                            <div className="w-full h-px bg-surface-3-light dark:bg-surface-3-dark" />

                            {/* Online amount breakdown (display-only) */}
                            <div className="flex flex-col gap-1.5">
                                {nights > 0 && (
                                    <div className="flex items-center justify-between text-sm text-sub-text-light dark:text-sub-text-dark">
                                        <span>
                                            {fmt(salePrice)} × {nights} {__('night')}
                                        </span>
                                        <span>{fmt(roomSubtotal)}</span>
                                    </div>
                                )}
                                {feeLines.map((line) => (
                                    <div
                                        key={line.label}
                                        className="flex items-center justify-between text-sm text-sub-text-light dark:text-sub-text-dark"
                                    >
                                        <span>{line.label}</span>
                                        <span>{fmt(line.amount)}</span>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between pt-2 mt-1 border-t border-surface-3-light dark:border-surface-3-dark">
                                    <span className="text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                        {__('You pay online')}
                                    </span>
                                    <span className="text-base font-semibold text-main-text-light dark:text-main-text-dark">
                                        {fmt(onlineTotal)}
                                    </span>
                                </div>
                                <p className="text-xs italic text-sub-text-light dark:text-sub-text-dark">
                                    {__(
                                        'Final amount is confirmed after the property approves your request',
                                    )}
                                </p>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer */}
                {isCustomer && (
                    <div className="px-5 py-4 border-t shrink-0 border-surface-3-light dark:border-surface-3-dark">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            className="flex items-center justify-center w-full h-12 gap-2 font-semibold transition rounded-md bg-main-text-light text-md text-main-text-dark hover:bg-main-text-light/80 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80"
                        >
                            {processing && <Spinner customSize={'size-4'} />}
                            {__('Submit reservation request')}
                        </button>
                    </div>
                )}
            </div>
        </div>,
        document.getElementById('modal-root') || document.body,
    );
};

export default LodgingReservationPanel;
