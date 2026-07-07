import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/Website/MainLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import { ChevronLeft } from 'lucide-react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import {
    trackPixelEvent,
    buildEventId,
    isConfirmedOrLaterReservationStatus,
} from '@/Helpers/metaPixel';

dayjs.extend(duration);
dayjs.extend(utc);

/**
 * Stage 3 — customer-facing single reservation DETAIL (rebuilt to match the My Orders show page).
 *
 * Mirrors the Order show design language: a 2-column layout (lg:grid-cols-3), each section in its
 * own bordered card, the Order-style SOLID status pill in the header, a Payment Summary on the
 * right with the orange Total accent, and a Need Help card. Lodging domain only (no orders/cart/
 * smartphone logic). member_price is future-only and is NOT part of the payload (hidden from the
 * customer). All text is translated via __(). Reservations display the currency CODE as a suffix
 * (no symbol) — consistent with the My Reservations list.
 */

// Reservation status -> friendly label (reused from Stage 3.1; full enum covered). Rendered in the
// Order-style solid pill; falls back to the humanized raw status if a label is missing.
const STATUS_LABELS = {
    REQUESTED: 'Awaiting Review',
    HOTEL_REVIEW_PENDING: 'Awaiting Review',
    HOTEL_APPROVED_AWAITING_PAYMENT: 'Awaiting Payment',
    PAYMENT_LINK_CREATED: 'Awaiting Payment',
    PAYMENT_PENDING: 'Awaiting Payment',
    PAYMENT_CONFIRMED: 'Confirmed',
    CONFIRMED: 'Confirmed',
    COMPLETED: 'Completed',
    HOTEL_REJECTED: 'Rejected',
    EXPIRED_NO_RESPONSE: 'Expired - No Response',
    PAYMENT_EXPIRED: 'Expired',
    PAYMENT_FAILED: 'Payment Failed',
    CANCELLED: 'Cancelled',
};

// Payment-row lifecycle -> friendly label (distinct from the reservation status above).
const PAYMENT_STATUS_LABELS = {
    created: 'Created',
    pending: 'Pending',
    confirmed: 'Confirmed',
    failed: 'Payment Failed',
    expired: 'Expired',
};

// The payment deadline is only meaningful to the customer while the reservation is awaiting payment.
const AWAITING_PAYMENT_STATUSES = [
    'HOTEL_APPROVED_AWAITING_PAYMENT',
    'PAYMENT_LINK_CREATED',
    'PAYMENT_PENDING',
];

const humanize = (raw) => (raw ? String(raw).replace(/_/g, ' ') : raw);

// Order-style SOLID status pill (exact classes from the Order show page) — uppercase, rounded-full.
function StatusPill({ status, __ }) {
    const label = STATUS_LABELS[status] || humanize(status);
    return (
        <span className="inline-flex items-center self-start rounded-full bg-main-text-light px-5 py-1 text-[16px] text-sm font-semibold uppercase text-main-text-dark dark:bg-main-text-dark dark:text-main-text-light sm:self-center">
            {__(label, true)}
        </span>
    );
}

// Bordered section card — matches the Order show card styling.
function Card({ title, children, className = '' }) {
    return (
        <div
            className={`rounded-md border border-surface-3-light bg-white p-8 dark:border-surface-3-dark dark:bg-surface-1-dark ${className}`}
        >
            {title && (
                <h2 className="mb-4 text-[18px] font-semibold text-main-text-light dark:text-main-text-dark">
                    {title}
                </h2>
            )}
            {children}
        </div>
    );
}

// Payment Summary line (label + money value) — matches the existing Subtotal/Total row styling.
// Renders ONLY when its value exists, so a zero/absent fee produces no empty row.
function SummaryLine({ label, value }) {
    if (value === null || value === undefined || value === '') return null;
    return (
        <div className="flex items-center justify-between">
            <span className="shrink-0 text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                {label}
            </span>
            <span className="min-w-0 break-words text-[20px] font-semibold text-main-text-light dark:text-main-text-dark">
                {value}
            </span>
        </div>
    );
}

// Labeled row — renders ONLY when its value exists (no empty rows, no stray borders).
function Row({ label, value, mono = false }) {
    if (value === null || value === undefined || value === '') return null;
    return (
        <div className="flex items-start justify-between gap-4 py-3 border-b border-surface-3-light last:border-0 dark:border-surface-3-dark">
            <span className="text-sm shrink-0 text-sub-text-light dark:text-sub-text-dark">{label}</span>
            <span
                className={`min-w-0 text-right text-sm font-medium text-main-text-light dark:text-main-text-dark ${
                    mono ? 'break-all font-mono text-xs' : 'break-words'
                }`}
            >
                {value}
            </span>
        </div>
    );
}

export default function show({ reservation }) {
    const { __ } = useTranslation();

    // Meta Pixel Schedule — fires once the reservation's real status is 'CONFIRMED' OR any status
    // only reachable after having been confirmed (see CONFIRMED_OR_LATER_RESERVATION_STATUSES).
    // This page is the customer's natural revisit point (unlike the one-time PaymentSuccess.jsx
    // NOWPayments landing page, where confirmation has almost never happened yet), so this is where
    // the async backend confirmation actually gets observed. Broadened from an exact 'CONFIRMED'
    // match so a reservation first viewed after it has already progressed further still fires. Same
    // localStorage key format as PaymentSuccess.jsx so the two locations never double-fire for
    // the same reservation. content_ids omitted, matching PaymentSuccess.jsx: this page's
    // `reservation.public_id` is the RESERVATION's own id (rsv_ prefix), not the lodging
    // product's (lod_ prefix) — the product id isn't in this page's props.
    useEffect(() => {
        if (!isConfirmedOrLaterReservationStatus(reservation?.status)) return;

        const firedKey = `meta_schedule_fired_${reservation.reservation_no}`;
        if (localStorage.getItem(firedKey)) return;

        const eventId = buildEventId('Schedule', reservation.reservation_no);
        trackPixelEvent(
            'Schedule',
            {
                reservation_id: reservation.reservation_no,
                content_type: 'accommodation',
                content_category: 'lodging',
                value: Number(reservation.online_amount || 0),
                currency: reservation.currency_code,
            },
            eventId,
        );

        localStorage.setItem(firedKey, '1');
    }, [reservation?.status]);

    // PRESERVED 1:1 — show "Complete Payment" ONLY before the customer has gone to NOWPayments: an
    // approved, not-yet-paid reservation (awaiting-payment / pending) whose NP_id is still empty.
    // Once NOWPayments stores the NP_id (or the status moves on) the button is hidden. payment_url is
    // retained because the button is an anchor to it — without a link there is nothing to open.
    const canPay =
        ['HOTEL_APPROVED_AWAITING_PAYMENT', 'PAYMENT_PENDING'].includes(reservation.status) &&
        !reservation.nowpayments_payment_id;

    // Reservations display the currency CODE as a suffix (no symbol) — matches the list/show payload.
    const fmtMoney = (n) =>
        n === null || n === undefined || n === ''
            ? null
            : `${Number(n).toLocaleString('en-US')} ${reservation.currency_code ?? ''}`.trim();

    // Payment Summary breakdown (only from real values — never fabricated):
    //   Subtotal     = price_snapshot * nights
    //   Service fee / Cleaning fee / Tax  — each shown ONLY when online-collected + > 0
    //   Total        = online_amount (authoritative — never recomputed from the parts)
    //
    // The per-fee components come from the backend `online_fees` (read from the live cancellation
    // policy). They are shown only when `reconciles` is true — i.e. the parts still sum to
    // online_amount. If the policy changed after booking (parts no longer sum), the page degrades to
    // the single derived "Taxes & fees" line so the displayed parts can never disagree with the Total.
    const fees = reservation.online_fees ?? null;
    const reconciles = fees?.reconciles === true;

    const nights = Number(reservation.nights) || 0;
    const perNight = reservation.price_snapshot != null ? Number(reservation.price_snapshot) : null;
    const total = reservation.online_amount != null ? Number(reservation.online_amount) : null;
    // Subtotal — prefer the backend-computed value (the one used in the reconciliation), else derive.
    const roomSubtotal =
        fees?.subtotal != null ? Number(fees.subtotal) : perNight != null ? perNight * nights : null;
    const hasBreakdown = roomSubtotal != null && total != null;

    // A fee line renders only when online-collected + positive AND the components reconcile.
    const onlineFee = (v) => (reconciles && v != null && Number(v) > 0 ? Number(v) : null);
    const serviceFee = onlineFee(fees?.service_fee);
    const cleaningFee = onlineFee(fees?.cleaning_fee);
    const tax = onlineFee(fees?.tax);

    // Defensive fallback: when the live components don't reconcile, show the single derived line so
    // the breakdown still sums exactly to the authoritative Total (never an unexplained gap).
    const taxesFeesFallback =
        !reconciles && hasBreakdown ? Math.max(0, Number((total - roomSubtotal).toFixed(2))) : null;

    const reservationStatusLabel = __(STATUS_LABELS[reservation.status] || humanize(reservation.status), true);
    const paymentStatusLabel = reservation.payment_status
        ? __(PAYMENT_STATUS_LABELS[reservation.payment_status] || humanize(reservation.payment_status), true)
        : null;
    const showDeadline =
        AWAITING_PAYMENT_STATUSES.includes(reservation.status) && !!reservation.approval_expires_at;

    // Order-style STATIC "Expires in" countdown (verbatim My Orders helper) — computed ONCE at
    // render from the RAW ISO deadline (approval_expires_at_raw; the formatted "Payment Deadline"
    // row above keeps its own display string). NO ticking; a refresh recomputes the remaining time.
    const getRemainingTime = (expiresAt) => {
        if (!expiresAt) return null;

        const now = dayjs();
        const expiry = dayjs.utc(expiresAt);

         if (expiry.isBefore(now)) {
           return __('a few moments',true);
        }

        const diffMs = expiry.diff(now);
        const d = dayjs.duration(diffMs);

        const hours = Math.floor(d.asHours());
        const minutes = d.minutes();

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }

        return `${minutes}m`;
    };

    const remainingTime = getRemainingTime(reservation?.approval_expires_at_raw);

    return (
        <MainLayout>
            <Head title={`${__('Reservation', true)} #${reservation.reservation_no}`} />

            <div className="min-h-screen transition-colors duration-200">
                <div className="px-6 mx-auto max-w-8xl lg:my-7 lg:px-8">
                    {/* Header — mobile back link (icon) + title + Order-style status pill */}
                    <div className="my-2">
                        <Link
                            href={route('website.lodging-reservations.index')}
                            className="inline-flex items-center gap-2 mb-4 text-sm font-medium transition-colors text-main-text-light dark:text-main-text-dark lg:hidden lg:hover:text-main-text-light/80 dark:lg:hover:text-main-text-dark/80"
                        >
                            <ChevronLeft />
                        </Link>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-5">
                                <h1 className="text-[24px] font-semibold text-main-text-light dark:text-main-text-dark">
                                    {__('Reservation')} #{reservation.reservation_no}
                                </h1>
                                <StatusPill status={reservation.status} __={__} />
                                {/* Static "Expires in" countdown next to the status pill (Order-style
                                    placement) — ONLY while the 60-min approved-unpaid window is live.
                                    Never on confirmed/expired/rejected/review states. */}
                                {AWAITING_PAYMENT_STATUSES.includes(reservation.status) && (
                                    <span className="text-[14px] font-semibold text-[#ff0000]">
                                        {remainingTime &&
                                            (remainingTime === 'Expired'
                                                ? __('Expired', true)
                                                : `${__('Expires in', true)} ${remainingTime}`)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 mb-20 lg:grid-cols-3">
                        {/* Left column */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Stay Details */}
                            <Card title={__('Stay Details')}>
                                <div>
                                    <Row
                                        label={__('Property')}
                                        value={reservation.property_name_snapshot}
                                    />
                                    <Row label={__('Room')} value={reservation.room_name_snapshot} />
                                    <Row
                                        label={__('Rate Plan')}
                                        value={reservation.rate_plan_name_snapshot}
                                    />
                                    <Row label={__('Check-in')} value={reservation.checkin_date} />
                                    <Row label={__('Check-out')} value={reservation.checkout_date} />
                                    <Row label={__('Nights')} value={reservation.nights} />
                                    <Row label={__('Guests')} value={reservation.guest_count} />
                                    <Row
                                        label={__('Reservation date')}
                                        value={reservation.created_at}
                                    />
                                </div>
                            </Card>

                            {/* Status & Payment */}
                            <Card title={__('Status & Payment')}>
                                <div>
                                    <Row
                                        label={__('Reservation Status')}
                                        value={reservationStatusLabel}
                                    />
                                    <Row label={__('Payment Status')} value={paymentStatusLabel} />
                                    <Row
                                        label={__('Payment Method')}
                                        value={reservation.payment_method ? __('Crypto', true) : null}
                                    />
                                    <Row
                                        label={__('Paid With')}
                                        value={
                                            reservation.pay_currency
                                                ? String(reservation.pay_currency).toUpperCase()
                                                : null
                                        }
                                    />
                                    <Row
                                        label={__('Payment Confirmed On')}
                                        value={reservation.payment_confirmed_at}
                                    />
                                    {showDeadline && (
                                        <Row
                                            label={__('Payment Deadline')}
                                            value={reservation.approval_expires_at}
                                        />
                                    )}
                                    <Row label={__('Transaction Hash')} value={reservation.tx_hash} mono />
                                </div>
                            </Card>

                            {/* Request Message */}
                            {reservation.request_message && (
                                <Card title={__('Request Message')}>
                                    <p className="text-sm break-words whitespace-pre-wrap text-main-text-light dark:text-main-text-dark">
                                        {reservation.request_message}
                                    </p>
                                </Card>
                            )}

                            {/* Rejection Reason — shown to the customer only when the property declined */}
                            {reservation.status === 'HOTEL_REJECTED' &&
                                reservation.hotel_rejected_reason && (
                                    <div className="rounded-md border border-[#FBBABA] bg-red-50 p-8 dark:border-surface-3-dark dark:bg-surface-1-dark">
                                        <h2 className="mb-2 text-[18px] font-semibold text-red-700 dark:text-red-300">
                                            {__('Rejection Reason')}
                                        </h2>
                                        <p className="text-sm break-words text-main-text-light dark:text-main-text-dark">
                                            {reservation.hotel_rejected_reason}
                                        </p>
                                    </div>
                                )}

                            {/* Operator alternative suggestions */}
                            {(reservation.alternative_room_suggestion ||
                                reservation.alternative_date_suggestion) && (
                                <Card title={__('Suggested Alternatives')}>
                                    <div className="space-y-4">
                                        {reservation.alternative_room_suggestion && (
                                            <div>
                                                <p className="mb-1 text-xs font-semibold tracking-wide uppercase text-sub-text-light dark:text-sub-text-dark">
                                                    {__('Suggested Alternative Room')}
                                                </p>
                                                <p className="text-sm break-words text-main-text-light dark:text-main-text-dark">
                                                    {reservation.alternative_room_suggestion}
                                                </p>
                                            </div>
                                        )}
                                        {reservation.alternative_date_suggestion && (
                                            <div>
                                                <p className="mb-1 text-xs font-semibold tracking-wide uppercase text-sub-text-light dark:text-sub-text-dark">
                                                    {__('Suggested Alternative Dates')}
                                                </p>
                                                <p className="text-sm break-words text-main-text-light dark:text-main-text-dark">
                                                    {reservation.alternative_date_suggestion}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Right column — Payment Summary + Need Help (sticky on large screens) */}
                        <div className="lg:col-span-1">
                            <div className="space-y-4 lg:sticky lg:top-7">
                                {/* Payment Summary — mirrors Order Summary (breakdown + orange Total) */}
                                <Card title={__('Payment Summary')}>
                                    {hasBreakdown && (
                                        <div className="pb-5 mb-5 space-y-3 border-b border-surface-3-light dark:border-surface-3-dark">
                                            {/* Subtotal — always shown */}
                                            <SummaryLine label={__('Subtotal')} value={fmtMoney(roomSubtotal)} />
                                            {/* Accurate per-fee lines — each only when online-collected + > 0 */}
                                            {serviceFee != null && (
                                                <SummaryLine label={__('Service fee')} value={fmtMoney(serviceFee)} />
                                            )}
                                            {cleaningFee != null && (
                                                <SummaryLine label={__('Cleaning fee')} value={fmtMoney(cleaningFee)} />
                                            )}
                                            {tax != null && (
                                                <SummaryLine label={__('Tax')} value={fmtMoney(tax)} />
                                            )}
                                            {/* Fallback derived line — only when the live components don't reconcile */}
                                            {taxesFeesFallback != null && taxesFeesFallback > 0 && (
                                                <SummaryLine label={__('Taxes & fees')} value={fmtMoney(taxesFeesFallback)} />
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <span className="shrink-0 text-[14px] font-semibold text-main-text-light dark:text-main-text-dark">
                                            {__('Total')}
                                        </span>
                                        <span className="min-w-0 break-words text-right text-[30px] font-semibold text-[#ff4400]">
                                            {fmtMoney(total) ?? '-'}
                                        </span>
                                    </div>

                                    {/* Complete Payment — only for an active, unpaid crypto invoice */}
                                    {canPay && (
                                        <a
                                            href={reservation.payment_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center w-full gap-2 px-6 py-3 mt-6 text-sm font-semibold transition-all rounded-md bg-main-text-light text-main-text-dark hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80"
                                        >
                                            {__('Complete Payment')}
                                        </a>
                                    )}
                                </Card>

                                {/* Need Help */}
                                <div className="p-6 bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
                                    <h2 className="mb-2 text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                        {__('Need Help')}?
                                    </h2>
                                    <p className="mb-4 text-sm font-medium text-main-text-light dark:text-main-text-dark">
                                        {__(
                                            'Contact our support team if you have any questions about your reservation.',
                                        )}
                                    </p>
                                    <Link
                                        href={route('website.contact.index')}
                                        className="flex items-center justify-center w-full gap-2 px-4 py-2 font-semibold transition-all rounded-md text-md bg-main-text-light text-main-text-dark hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80"
                                    >
                                        {__('Contact Support')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
