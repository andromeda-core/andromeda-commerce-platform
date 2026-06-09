import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/Website/MainLayout';
import Spinner from '@/Components/Spinner';
import axios from 'axios';
import { useTranslation } from '@/Hooks/useTranslation';

/**
 * Stage 3.1 — customer-facing My Reservations LIST.
 *
 * Mirrors the My Orders list (MainLayout, card style, infinite-scroll load-more, empty state).
 * Lodging domain only — no orders/cart/smartphone logic here. All text is translated via __().
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
            className={`inline-flex items-center self-start rounded-full px-3 py-1 text-xs font-semibold uppercase ${TONE_CLASSES[badge.tone]}`}
        >
            {__(badge.label)}
        </span>
    );
}

export default function index({ reservations, next_page_url }) {
    const { __ } = useTranslation();

    const [allReservations, setAllReservations] = useState(reservations || []);
    const nextPageUrlRef = useRef(next_page_url || null);
    const loaderRef = useRef(null);
    const isFetchingMore = useRef(false);

    useEffect(() => {
        setAllReservations(reservations || []);
    }, [reservations]);

    const fetchMore = () => {
        if (!nextPageUrlRef.current) return;

        isFetchingMore.current = true;
        axios
            .get(nextPageUrlRef.current, { headers: { Accept: 'application/json' } })
            .then((response) => {
                const data = response.data;
                setAllReservations((prev) => {
                    const ids = new Set(prev.map((p) => p.id));
                    const newOnes = (data.reservations || []).filter((p) => !ids.has(p.id));
                    return [...prev, ...newOnes];
                });
                nextPageUrlRef.current = data.next_page_url;
            })
            .catch(() => {
                // Stop paginating on error rather than surfacing a disruptive toast.
                nextPageUrlRef.current = null;
            })
            .finally(() => {
                isFetchingMore.current = false;
            });
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (loaderRef.current && nextPageUrlRef.current) {
                const observer = new IntersectionObserver(
                    (entries) => {
                        if (entries[0].isIntersecting && !isFetchingMore.current) {
                            fetchMore();
                        }
                    },
                    { rootMargin: '200px', threshold: 0.1 },
                );
                observer.observe(loaderRef.current);

                clearInterval(interval);

                return () => observer.disconnect();
            }
        }, 200);

        return () => clearInterval(interval);
    }, []);

    return (
        <MainLayout>
            <Head title={__('Reservations', true)} />

            <div className="my-0 min-h-screen pb-20 lg:my-3">
                <div className="mx-auto w-full max-w-7xl overflow-x-hidden text-black dark:text-main-text-dark sm:px-8">
                    <div className="mt-2 px-4 sm:px-0">
                        {allReservations.length === 0 ? (
                            <EmptyReservations __={__} />
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {allReservations.map((reservation) => (
                                    <ReservationCard
                                        key={reservation.id}
                                        reservation={reservation}
                                        __={__}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Loader */}
            {nextPageUrlRef.current && (
                <div
                    ref={loaderRef}
                    className="flex animate-pulse items-center justify-center gap-2 py-10 text-center text-main-text-light transition-all duration-100 dark:text-main-text-dark"
                >
                    <Spinner />
                    {__('Loading More')}...
                </div>
            )}
        </MainLayout>
    );
}

// Reservation Card Component
function ReservationCard({ reservation, __ }) {
    const canPay =
        ['PAYMENT_PENDING', 'PAYMENT_LINK_CREATED'].includes(reservation.status) &&
        !!reservation.payment_url;

    return (
        <div className="overflow-hidden rounded-md border border-surface-3-light bg-white transition-all dark:border-surface-3-dark dark:bg-surface-1-dark">
            {/* Header */}
            <div className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                    <StatusBadge status={reservation.status} __={__} />
                    <span className="flex items-center gap-1 text-sm text-sub-text-light dark:text-sub-text-dark">
                        {__('Reservation Number')}:{' '}
                        <span className="text-[14px] font-medium text-main-text-light dark:text-main-text-dark">
                            {reservation.reservation_no}
                        </span>
                    </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-sub-text-light dark:text-sub-text-dark">
                    <span className="flex items-center gap-1">
                        {__('Reservation date')}:{' '}
                        <span className="text-[14px] font-medium text-main-text-light dark:text-main-text-dark">
                            {reservation.created_at}
                        </span>
                    </span>

                    <Link
                        href={route('website.lodging-reservations.show', reservation.reservation_no)}
                        className="flex items-center gap-1 font-semibold text-main-text-light dark:text-main-text-dark lg:hover:text-main-text-light/80 dark:lg:hover:text-main-text-dark/80"
                    >
                        <span>{__('View Details')}</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="h-3 w-3"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8.25 4.5l7.5 7.5-7.5 7.5"
                            />
                        </svg>
                    </Link>
                </div>
            </div>

            <div className="m-auto max-w-[calc(100%-32px)] border-t border-surface-3-light dark:border-surface-3-dark"></div>

            {/* Body */}
            <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:gap-6 md:p-6">
                <div className="flex-1">
                    <h3 className="mb-1 text-[18px] font-semibold text-main-text-light dark:text-main-text-dark">
                        {reservation.property_name_snapshot}
                    </h3>
                    <p className="mb-1 text-[14px] text-sub-text-light dark:text-sub-text-dark">
                        {reservation.room_name_snapshot}
                        {reservation.rate_plan_name_snapshot
                            ? ` - ${reservation.rate_plan_name_snapshot}`
                            : ''}
                    </p>
                    <p className="mb-1 text-[14px] text-main-text-light dark:text-main-text-dark">
                        {reservation.checkin_date} &rarr; {reservation.checkout_date}{' '}
                        <span className="text-sub-text-light dark:text-sub-text-dark">
                            ({reservation.nights} {__('Nights')})
                        </span>
                    </p>
                    <p className="mb-1 text-[14px] text-main-text-light dark:text-main-text-dark">
                        {__('Guests')}: {reservation.guest_count}
                    </p>
                    <p className="mt-2 text-[17px] font-semibold text-main-text-light dark:text-main-text-dark">
                        {__('Total')}:{' '}
                        {Number(reservation.online_amount).toLocaleString('en-US')}{' '}
                        {reservation.currency_code}
                    </p>
                </div>

                {/* Complete Payment — only for an active, unpaid crypto invoice */}
                {canPay && (
                    <div className="flex flex-shrink-0">
                        <a
                            href={reservation.payment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-md flex h-[50px] w-full items-center justify-center gap-2 rounded-md bg-main-text-light px-6 text-[16px] font-semibold text-main-text-dark transition-all hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80 lg:w-[210px]"
                        >
                            {__('Complete Payment')}
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

// Empty Reservations Component
function EmptyReservations({ __ }) {
    return (
        <div className="flex min-h-[50vh] items-center justify-center px-6">
            <div className="text-center">
                <h3 className="text-[22px] font-semibold tracking-tight text-main-text-light dark:text-main-text-dark">
                    {__('You have no reservations yet.')}
                </h3>

                <p className="mb-8 mt-2 max-w-xs text-sm leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                    {__('Your reservations will appear here once you book a stay.')}
                </p>

                <Link
                    href={route('home')}
                    className="text-md inline-flex items-center justify-center rounded-md bg-main-text-light px-10 py-2.5 font-semibold text-main-text-dark transition-colors hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80"
                >
                    {__('Explore')}
                </Link>
            </div>
        </div>
    );
}
