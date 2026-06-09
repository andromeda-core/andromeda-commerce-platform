import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/Website/MainLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import { ChevronLeft } from 'lucide-react';

/**
 * Stage 3.1 — customer-facing single reservation DETAIL.
 *
 * Mirrors the My Orders detail layout (MainLayout, card style, status badge). Lodging domain
 * only. member_price is future-only and is NOT part of the payload (hidden from the customer).
 * All text is translated via __().
 */

// Status -> badge tone + label (translation key). Covers the full reservation status enum.
const STATUS_BADGES = {
    REQUESTED: { tone: 'yellow', label: 'Awaiting Review' },
    HOTEL_REVIEW_PENDING: { tone: 'yellow', label: 'Awaiting Review' },
    HOTEL_APPROVED_AWAITING_PAYMENT: { tone: 'blue', label: 'Awaiting Payment' },
    PAYMENT_LINK_CREATED: { tone: 'blue', label: 'Awaiting Payment' },
    PAYMENT_PENDING: { tone: 'blue', label: 'Awaiting Payment' },
    PAYMENT_CONFIRMED: { tone: 'green', label: 'Confirmed' },
    CONFIRMED: { tone: 'green', label: 'Confirmed' },
    COMPLETED: { tone: 'green', label: 'Completed' },
    HOTEL_REJECTED: { tone: 'red', label: 'Rejected' },
    EXPIRED_NO_RESPONSE: { tone: 'gray', label: 'Expired' },
    PAYMENT_EXPIRED: { tone: 'gray', label: 'Expired' },
    PAYMENT_FAILED: { tone: 'red', label: 'Payment Failed' },
    CANCELLED: { tone: 'gray', label: 'Cancelled' },
};

const TONE_CLASSES = {
    yellow: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-700/40 dark:text-gray-300',
};

function StatusBadge({ status, __ }) {
    const badge = STATUS_BADGES[status] || { tone: 'gray', label: status };
    return (
        <span
            className={`inline-flex items-center self-start rounded-full px-4 py-1 text-sm font-semibold uppercase ${TONE_CLASSES[badge.tone]}`}
        >
            {__(badge.label)}
        </span>
    );
}

function Row({ label, value }) {
    if (value === null || value === undefined || value === '') return null;
    return (
        <div className="flex items-center justify-between gap-4 border-b border-surface-3-light py-3 last:border-0 dark:border-surface-3-dark">
            <span className="text-sm text-sub-text-light dark:text-sub-text-dark">{label}</span>
            <span className="text-right text-sm font-medium text-main-text-light dark:text-main-text-dark">
                {value}
            </span>
        </div>
    );
}

export default function show({ reservation }) {
    const { __ } = useTranslation();

    const canPay =
        ['PAYMENT_PENDING', 'PAYMENT_LINK_CREATED'].includes(reservation.status) &&
        !!reservation.payment_url;

    const amount =
        reservation.online_amount != null
            ? `${Number(reservation.online_amount).toLocaleString('en-US')} ${reservation.currency_code ?? ''}`.trim()
            : null;

    return (
        <MainLayout>
            <Head title={`${__('Reservation', true)} #${reservation.reservation_no}`} />

            <div className="min-h-screen">
                <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                    <Link
                        href={route('website.lodging-reservations.index')}
                        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-main-text-light transition-colors dark:text-main-text-dark lg:hover:text-main-text-light/80 dark:lg:hover:text-main-text-dark/80"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        {__('Reservations')}
                    </Link>

                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h1 className="text-[24px] font-semibold text-main-text-light dark:text-main-text-dark">
                            {__('Reservation')} #{reservation.reservation_no}
                        </h1>
                        <StatusBadge status={reservation.status} __={__} />
                    </div>

                    {/* Details card */}
                    <div className="rounded-md border border-surface-3-light bg-white p-6 dark:border-surface-3-dark dark:bg-surface-1-dark sm:p-8">
                        <h2 className="mb-4 text-[18px] font-semibold text-main-text-light dark:text-main-text-dark">
                            {__('Reservation Details')}
                        </h2>

                        <div>
                            <Row label={__('Property')} value={reservation.property_name_snapshot} />
                            <Row label={__('Room')} value={reservation.room_name_snapshot} />
                            <Row label={__('Rate Plan')} value={reservation.rate_plan_name_snapshot} />
                            <Row label={__('Check-in')} value={reservation.checkin_date} />
                            <Row label={__('Check-out')} value={reservation.checkout_date} />
                            <Row label={__('Nights')} value={reservation.nights} />
                            <Row label={__('Guests')} value={reservation.guest_count} />
                            <Row label={__('Total')} value={amount} />
                            <Row label={__('Reservation date')} value={reservation.created_at} />
                        </div>

                        {/* Request message */}
                        {reservation.request_message && (
                            <div className="mt-5 rounded-md border border-surface-3-light bg-surface-1-light p-4 dark:border-surface-3-dark dark:bg-surface-1-dark">
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-sub-text-light dark:text-sub-text-dark">
                                    {__('Request Message')}
                                </p>
                                <p className="text-sm text-main-text-light dark:text-main-text-dark">
                                    {reservation.request_message}
                                </p>
                            </div>
                        )}

                        {/* Rejection reason — shown to the customer when the property declined */}
                        {reservation.status === 'HOTEL_REJECTED' &&
                            reservation.hotel_rejected_reason && (
                                <div className="mt-5 rounded-md border border-[#FBBABA] bg-red-50 p-4 dark:border-surface-3-dark dark:bg-surface-1-dark">
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">
                                        {__('Rejection Reason')}
                                    </p>
                                    <p className="text-sm text-main-text-light dark:text-main-text-dark">
                                        {reservation.hotel_rejected_reason}
                                    </p>
                                </div>
                            )}

                        {/* Operator alternative suggestions */}
                        {(reservation.alternative_room_suggestion ||
                            reservation.alternative_date_suggestion) && (
                            <div className="mt-5 rounded-md border border-surface-3-light bg-surface-1-light p-4 dark:border-surface-3-dark dark:bg-surface-1-dark">
                                {reservation.alternative_room_suggestion && (
                                    <div className="mb-3 last:mb-0">
                                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-sub-text-light dark:text-sub-text-dark">
                                            {__('Suggested Alternative Room')}
                                        </p>
                                        <p className="text-sm text-main-text-light dark:text-main-text-dark">
                                            {reservation.alternative_room_suggestion}
                                        </p>
                                    </div>
                                )}
                                {reservation.alternative_date_suggestion && (
                                    <div>
                                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-sub-text-light dark:text-sub-text-dark">
                                            {__('Suggested Alternative Dates')}
                                        </p>
                                        <p className="text-sm text-main-text-light dark:text-main-text-dark">
                                            {reservation.alternative_date_suggestion}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Complete Payment — only for an active, unpaid crypto invoice */}
                        {canPay && (
                            <a
                                href={reservation.payment_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-main-text-light px-6 py-3 text-sm font-semibold text-main-text-dark transition-all hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80"
                            >
                                {__('Complete Payment')}
                            </a>
                        )}
                    </div>

                    {/* Help */}
                    <div className="mt-4 rounded-md border border-surface-3-light bg-white p-6 dark:border-surface-3-dark dark:bg-surface-1-dark">
                        <h2 className="mb-2 text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                            {__('Need Help')}?
                        </h2>
                        <p className="mb-4 text-sm font-medium text-main-text-light dark:text-main-text-dark">
                            {__('Contact our support team if you have any questions about your reservation.')}
                        </p>
                        <Link
                            href={route('website.contact.index')}
                            className="text-md flex w-full items-center justify-center gap-2 rounded-md bg-main-text-light px-4 py-2 font-semibold text-main-text-dark transition-all hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80"
                        >
                            {__('Contact Support')}
                        </Link>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
