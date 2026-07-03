import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import axios from 'axios';
import useWindowSize from '@/Hooks/useWindowSize';
import Spinner from '@/Components/Spinner';
import Toast from '@/Components/Toast';

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
        referral_code: '',
    });

    // Referral fix — "Apply" preview state. `appliedReferral` holds the validated {referral_code,
    // total_points} once Apply succeeds; it is cleared the moment the input changes so a stale
    // "applied" badge never shows for a code that no longer matches what's typed. Phase 4's
    // submission-time validation is unchanged and still re-checks the code server-side regardless
    // of whether Apply was ever clicked — this is additive UX, not a replacement safety check.
    const [applyingReferral, setApplyingReferral] = useState(false);
    const [appliedReferral, setAppliedReferral] = useState(null);
    const [referralErrorMessage, setReferralErrorMessage] = useState(null);
    const [showReferralErrorToast, setShowReferralErrorToast] = useState(false);

    const handleReferralCodeChange = (value) => {
        setData('referral_code', value);
        if (appliedReferral) setAppliedReferral(null);
    };

    const handleApplyReferral = async () => {
        const code = data.referral_code.trim();
        if (!code || applyingReferral) return;

        setApplyingReferral(true);

        try {
            const res = await axios.post(route('website.lodging-reservations.referral-code'), {
                code,
                lodging_rate_plan_id: data.lodging_rate_plan_id,
                checkin_date: data.checkin_date,
                checkout_date: data.checkout_date,
            });
            const response = res.data;

            if (!response.status) {
                setAppliedReferral(null);
                setReferralErrorMessage(response.message);
                setShowReferralErrorToast(true);
                return;
            }

            setAppliedReferral({
                referral_code: response.referral_code,
                total_points: response.total_points,
            });
        } catch (error) {
            setAppliedReferral(null);
            setReferralErrorMessage(
                error?.response?.data?.message || error.message || __('Invalid Referral Code'),
            );
            setShowReferralErrorToast(true);
        } finally {
            setApplyingReferral(false);
        }
    };

    const currency = lodging?.currency_code ?? '';
    const salePrice = Number(selectedRatePlan?.sale_price) || 0;
    const maxGuests = selectedRoom?.max_guests != null ? Number(selectedRoom.max_guests) : null;
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
        if (!canSubmit || applyingReferral) return;
        post(route('website.lodging-reservations.store'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                reset();
                setAppliedReferral(null);
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
            {/* Referral apply error — same Toast component the submission-time error path
                surfaces through (via Inertia flash); this axios-driven apply call constructs its
                own local flash-shaped object since it never goes through an Inertia visit. */}
            {showReferralErrorToast && (
                <Toast
                    flash={{ error: referralErrorMessage }}
                    onClosed={() => {
                        setShowReferralErrorToast(false);
                        setReferralErrorMessage(null);
                    }}
                />
            )}

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
                    <div className="flex justify-center pb-1 pt-3">
                        <div className="h-1 w-10 rounded-full bg-surface-3-light dark:bg-surface-3-dark" />
                    </div>
                )}

                {/* Header */}
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-surface-3-light px-5 py-4 dark:border-surface-3-dark">
                    <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-main-text-light dark:text-main-text-dark">
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
                <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-none">
                    {!isCustomer ? (
                        // Belt-and-suspenders: the Reserve button gates this, but never show the form
                        // to a non-customer.
                        <div className="rounded-md border border-surface-3-light bg-surface-1-light p-4 text-center dark:border-surface-3-dark dark:bg-surface-2-dark">
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

                            <div className="h-px w-full bg-surface-3-light dark:bg-surface-3-dark" />

                            {/* Check-in */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                    {__('Check-in')}
                                </label>
                                <input
                                    ref={checkinRef}
                                    type="text"
                                    readOnly
                                    placeholder={__('Check-in')}
                                    value={data.checkin_date}
                                    onChange={() => {}}
                                    className="w-full rounded-md border border-surface-3-light bg-backgroundLight px-3 py-2 text-sm text-main-text-light outline-none focus:border-main-text-light dark:border-surface-3-dark dark:bg-surface-1-dark dark:text-main-text-dark"
                                />
                                {errors.checkin_date && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.checkin_date}
                                    </p>
                                )}
                                {/* Same-day / cutoff rate-plan rule (UX mirror of the server guard). */}
                                {sameDayError && (
                                    <p className="mt-1 text-xs text-red-500">{sameDayError}</p>
                                )}
                            </div>

                            {/* Check-out */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                    {__('Check-out')}
                                </label>
                                <input
                                    ref={checkoutRef}
                                    type="text"
                                    readOnly
                                    placeholder={__('Check-out')}
                                    value={data.checkout_date}
                                    onChange={() => {}}
                                    className="w-full rounded-md border border-surface-3-light bg-backgroundLight px-3 py-2 text-sm text-main-text-light outline-none focus:border-main-text-light dark:border-surface-3-dark dark:bg-surface-1-dark dark:text-main-text-dark"
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
                            {nightsError && (
                                <p className="-mt-2 text-xs text-red-500">{nightsError}</p>
                            )}
                            {/* Consecutive-nights rate-plan rule (UX mirror of the server guard). */}
                            {consecutiveNightsError && (
                                <p className="-mt-2 text-xs text-red-500">
                                    {consecutiveNightsError}
                                </p>
                            )}

                            {/* Guests */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-main-text-light dark:text-main-text-dark">
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
                                    className="w-full rounded-md border border-surface-3-light bg-backgroundLight px-3 py-2 text-sm text-main-text-light outline-none focus:border-main-text-light dark:border-surface-3-dark dark:bg-surface-1-dark dark:text-main-text-dark"
                                />
                                {guestError && (
                                    <p className="mt-1 text-xs text-red-500">{guestError}</p>
                                )}
                                {errors.guest_count && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.guest_count}
                                    </p>
                                )}
                            </div>

                            {/* Request message */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                    {__('Request message (optional)')}
                                </label>
                                <textarea
                                    rows={3}
                                    maxLength={2000}
                                    value={data.request_message}
                                    onChange={(e) => setData('request_message', e.target.value)}
                                    className="w-full resize-none rounded-md border border-surface-3-light bg-backgroundLight px-3 py-2 text-sm text-main-text-light outline-none focus:border-main-text-light dark:border-surface-3-dark dark:bg-surface-1-dark dark:text-main-text-dark"
                                />
                                {errors.request_message && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.request_message}
                                    </p>
                                )}
                            </div>

                            {/* Referral code (optional) */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                    {__('Referral code (optional)')}
                                </label>
                                {!appliedReferral ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            maxLength={255}
                                            placeholder={__('Enter referral code')}
                                            value={data.referral_code}
                                            onChange={(e) =>
                                                handleReferralCodeChange(e.target.value)
                                            }
                                            className="w-full flex-1 rounded-md border border-surface-3-light bg-backgroundLight px-3 py-2 text-sm text-main-text-light outline-none focus:border-main-text-light dark:border-surface-3-dark dark:bg-surface-1-dark dark:text-main-text-dark"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleApplyReferral}
                                            disabled={
                                                !data.referral_code.trim() || applyingReferral
                                            }
                                            className="h-[38px] shrink-0 rounded-md border border-surface-3-light bg-backgroundLight px-4 text-sm font-semibold text-main-text-light transition-colors disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-3-dark dark:bg-surface-3-dark dark:text-main-text-dark lg:hover:bg-surface-1-light dark:lg:hover:bg-surface-3-dark/80"
                                        >
                                            {applyingReferral ? (
                                                <Spinner customSize={'size-4'} />
                                            ) : (
                                                __('Apply')
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between gap-2 rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                                        <div className="flex items-center gap-2">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <div>
                                                <p className="text-sm font-medium text-green-900 dark:text-green-400">
                                                    {appliedReferral.referral_code} {__('applied')}
                                                </p>
                                                {appliedReferral.total_points != null && (
                                                    <p className="text-xs text-green-700 dark:text-green-500">
                                                        {__("You'll earn")} ~
                                                        {appliedReferral.total_points}{' '}
                                                        {__(
                                                            'points once this reservation is confirmed',
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAppliedReferral(null);
                                                setData('referral_code', '');
                                            }}
                                            className="shrink-0 text-green-600 transition-colors hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                            title={__('Remove referral code')}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="h-5 w-5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                                {errors.referral_code && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.referral_code}
                                    </p>
                                )}
                            </div>

                            <div className="h-px w-full bg-surface-3-light dark:bg-surface-3-dark" />

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
                                <div className="mt-1 flex items-center justify-between border-t border-surface-3-light pt-2 dark:border-surface-3-dark">
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
                    <div className="shrink-0 border-t border-surface-3-light px-5 py-4 dark:border-surface-3-dark">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!canSubmit || applyingReferral}
                            className="text-md flex h-12 w-full items-center justify-center gap-2 rounded-md bg-main-text-light font-semibold text-main-text-dark transition hover:bg-main-text-light/80 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80"
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
