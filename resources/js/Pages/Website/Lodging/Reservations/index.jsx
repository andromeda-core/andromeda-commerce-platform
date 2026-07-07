import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/Website/MainLayout';
import Spinner from '@/Components/Spinner';
import axios from 'axios';
import { useTranslation } from '@/Hooks/useTranslation';
import { Copy } from 'lucide-react';
import LinkCopiedModal from '@/Components/LinkCopiedModal';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import { trackPixelEvent, buildEventId } from '@/Helpers/metaPixel';

dayjs.extend(duration);
dayjs.extend(utc);

/**
 * Stage 3.1 — customer-facing My Reservations LIST.
 *
 * Mirrors the My Orders list (MainLayout, card style, infinite-scroll load-more, empty state).
 * Lodging domain only — no orders/cart/smartphone logic here. All text is translated via __().
 */

// Stage 3.5 — customer-facing per-status wording (Joseph-approved). NEVER expose the raw enum.
// Rendered on every reservation row's status heading via __(). Keys are the UPPERCASE DB statuses.
const STATUS_LABELS = {
    REQUESTED: 'Waiting for approval',
    HOTEL_REVIEW_PENDING: 'Waiting for approval',
    HOTEL_APPROVED_AWAITING_PAYMENT: 'Payment required',
    PAYMENT_LINK_CREATED: 'Payment link created',
    PAYMENT_PENDING: 'Waiting for payment confirmation',
    PAYMENT_CONFIRMED: 'Confirmed',
    CONFIRMED: 'Confirmed',
    COMPLETED: 'Completed',
    HOTEL_REJECTED: 'Rejected by property',
    EXPIRED_NO_RESPONSE: 'No response / expired',
    PAYMENT_EXPIRED: 'Payment expired',
    PAYMENT_FAILED: 'Payment failed',
    CANCELLED: 'Cancelled',
};

// Stage 3.5 — SINGLE SOURCE OF TRUTH: each status-filter tab -> its reservation statuses (Joseph's
// approved grouping). Drives BOTH the filtering and the per-tab counts so they can never drift.
// Statuses are UPPERCASE to match the DB enum. `all` (null) means every status.
const TAB_GROUPS = {
    all: null,
    pending_approval: ['REQUESTED', 'HOTEL_REVIEW_PENDING'],
    awaiting_payment: ['HOTEL_APPROVED_AWAITING_PAYMENT', 'PAYMENT_LINK_CREATED', 'PAYMENT_PENDING'],
    confirmed_upcoming: ['PAYMENT_CONFIRMED', 'CONFIRMED'],
    completed: ['COMPLETED'],
    cancelled_expired: [
        'HOTEL_REJECTED',
        'CANCELLED',
        'PAYMENT_EXPIRED',
        'PAYMENT_FAILED',
        'EXPIRED_NO_RESPONSE',
    ],
};

// Tabs in display order; labels are translation keys (resolved via __()).
const TABS = [
    { key: 'all', label: 'All' },
    { key: 'pending_approval', label: 'Pending Approval' },
    { key: 'awaiting_payment', label: 'Awaiting Payment' },
    { key: 'confirmed_upcoming', label: 'Confirmed / Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled_expired', label: 'Cancelled / Expired' },
];

// All-tab ordering: action-needed first (lower number = earlier). Newest-first WITHIN a group is
// preserved by the server's latest() order plus a STABLE sort (equal priorities keep input order).
const ALL_TAB_PRIORITY = {
    awaiting_payment: 1,
    pending_approval: 2,
    confirmed_upcoming: 3,
    completed: 4,
    cancelled_expired: 5,
};

// Resolve a status to its group key (used by the All-tab priority sort). Future/unmapped statuses
// fall through to null and sort last.
function groupKeyForStatus(status) {
    return Object.keys(ALL_TAB_PRIORITY).find((key) => TAB_GROUPS[key]?.includes(status)) || null;
}

// Status renders as a bold heading (mirrors the My Orders list status style) — no pill background.
function StatusBadge({ status, __ }) {
    const label = STATUS_LABELS[status] || status;
    return (
        <h3 className="text-[18px] font-semibold uppercase text-main-text-light dark:text-main-text-dark">
            {__(label)}
        </h3>
    );
}

export default function index({ reservations, next_page_url }) {
    const { __ } = useTranslation();

    const [allReservations, setAllReservations] = useState(reservations || []);
    const nextPageUrlRef = useRef(next_page_url || null);
    const loaderRef = useRef(null);
    const isFetchingMore = useRef(false);

    // Copied-toast state for the reservation-number copy button (mirrors My Orders).
    const [linkCopied, setLinkCopied] = useState(false);

    // Stage 3.5 — status filter tabs (client-side, mirrors My Orders). Default = All.
    const [activeTab, setActiveTab] = useState('all');

    // Horizontal tab strip scroll arrows (mirrors My Orders).
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        setAllReservations(reservations || []);
    }, [reservations]);

    // Meta Pixel Schedule — STRICT: fires per-reservation, only for entries whose real status is
    // exactly 'CONFIRMED'. Watches allReservations (not the raw `reservations` prop) so infinite
    // -scroll "load more" pages are covered too. Same localStorage key format as
    // PaymentSuccess.jsx / Reservations/show.jsx so none of the three locations double-fire for
    // the same reservation. content_ids omitted — this list's items don't carry the lodging
    // product's own public_id (lod_ prefix), only the reservation's.
    useEffect(() => {
        (allReservations || []).forEach((reservation) => {
            if (reservation?.status !== 'CONFIRMED') return;

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
        });
    }, [allReservations]);

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

    // ---- Stage 3.5 — status-filter tabs (client-side, mirrors My Orders) ----
    // Rows for the active tab. The All tab is priority-sorted (action-needed first); every other
    // tab is its mapped statuses in the server's newest-first order.
    const visibleReservations =
        activeTab === 'all'
            ? [...allReservations].sort(
                  (a, b) =>
                      (ALL_TAB_PRIORITY[groupKeyForStatus(a.status)] ?? 99) -
                      (ALL_TAB_PRIORITY[groupKeyForStatus(b.status)] ?? 99),
              )
            : allReservations.filter((r) => (TAB_GROUPS[activeTab] || []).includes(r.status));

    // Per-tab badge count — computed from the SAME source-of-truth map as the filtering.
    const countForTab = (tabKey) =>
        tabKey === 'all'
            ? allReservations.length
            : allReservations.filter((r) => (TAB_GROUPS[tabKey] || []).includes(r.status)).length;

    // Tab strip scroll handlers (mirrors My Orders).
    const scrollLeft = useCallback(() => {
        scrollContainerRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
    }, []);

    const scrollRight = useCallback(() => {
        scrollContainerRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
    }, []);

    const updateScrollButtons = useCallback(() => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            const newCanScrollLeft = scrollLeft > 0;
            const newCanScrollRight = scrollLeft < scrollWidth - clientWidth - 20;
            if (newCanScrollLeft !== canScrollLeft || newCanScrollRight !== canScrollRight) {
                setCanScrollLeft(newCanScrollLeft);
                setCanScrollRight(newCanScrollRight);
            }
        }
    }, [canScrollLeft, canScrollRight]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const raf = requestAnimationFrame(() => updateScrollButtons());
        container.addEventListener('scroll', updateScrollButtons);
        window.addEventListener('resize', updateScrollButtons);

        return () => {
            cancelAnimationFrame(raf);
            container.removeEventListener('scroll', updateScrollButtons);
            window.removeEventListener('resize', updateScrollButtons);
        };
    }, [updateScrollButtons, allReservations.length]);

    return (
        <MainLayout>
            <Head title={__('Reservations', true)} />

            <div className="min-h-screen pb-20 my-0 lg:my-3">
                <div className="w-full mx-auto overflow-x-hidden text-black max-w-7xl dark:text-main-text-dark sm:px-8">
                    <div className="px-4 mt-2 sm:px-0">
                        {/* Status filter tabs (mirrors My Orders) */}
                        {allReservations.length > 0 && (
                            <div className="w-full mt-3 mb-4">
                                <div className="relative grid w-full grid-cols-1 overflow-hidden">
                                    <div className="relative flex items-center w-full">
                                        {/* Left Arrow */}
                                        {canScrollLeft && (
                                            <button
                                                onClick={scrollLeft}
                                                className="absolute left-0 z-20 flex items-center justify-center flex-shrink-0 p-2 transition-all duration-200 rounded-full bg-surface-1-light hover:scale-110 hover:bg-surface-1-light dark:bg-surface-3-dark dark:hover:bg-surface-3-dark md:flex"
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
                                            className="flex items-center w-full overflow-x-auto flex-nowrap gap-7 scroll-smooth scrollbar-none"
                                            style={{
                                                transform: 'translateZ(0)',
                                                WebkitOverflowScrolling: 'touch',
                                                scrollbarWidth: 'none',
                                                msOverflowStyle: 'none',
                                                maxWidth: '100%',
                                                display: 'flex',
                                            }}
                                        >
                                            {TABS.map((tab) => (
                                                <TabButton
                                                    key={tab.key}
                                                    label={__(tab.label)}
                                                    count={countForTab(tab.key)}
                                                    active={activeTab === tab.key}
                                                    onClick={() => setActiveTab(tab.key)}
                                                />
                                            ))}
                                        </div>

                                        {/* Right Arrow */}
                                        {canScrollRight && (
                                            <button
                                                onClick={scrollRight}
                                                className="absolute right-0 z-20 flex items-center justify-center flex-shrink-0 p-2 transition-all duration-200 rounded-full bg-surface-1-light hover:scale-110 hover:bg-surface-1-light dark:bg-surface-3-dark dark:hover:bg-surface-3-dark md:flex"
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
                        )}

                        {visibleReservations.length === 0 ? (
                            <EmptyReservations __={__} />
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {visibleReservations.map((reservation) => (
                                    <ReservationCard
                                        key={reservation.id}
                                        reservation={reservation}
                                        __={__}
                                        setLinkCopied={setLinkCopied}
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
                    className="flex items-center justify-center gap-2 py-10 text-center transition-all duration-100 animate-pulse text-main-text-light dark:text-main-text-dark"
                >
                    <Spinner />
                    {__('Loading More')}...
                </div>
            )}

            <LinkCopiedModal
                linkCopied={linkCopied}
                setLinkCopied={setLinkCopied}
                message={__('Reservation No Copied')}
            />
        </MainLayout>
    );
}

// Tab Button Component (mirrors My Orders)
function TabButton({ label, count, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap border-b-[3px] py-3.5 pl-1 text-sm font-semibold transition-all ${
                active
                    ? 'border-main-text-light text-main-text-light dark:border-main-text-dark dark:text-main-text-dark'
                    : 'border-transparent text-main-text-light dark:text-main-text-dark hover:lg:border-main-text-light dark:lg:hover:border-main-text-dark'
            }`}
        >
            <span className="text-[24px] font-semibold text-main-text-light dark:text-main-text-dark">
                {label} {count > 0 ? `(${count})` : ''}
            </span>
        </button>
    );
}

// Reservation Card Component
function ReservationCard({ reservation, __, setLinkCopied }) {
    // Show "Complete Payment" ONLY before the customer has gone to NOWPayments: an approved,
    // not-yet-paid reservation (awaiting-payment / link-created) whose NP_id is still empty. Once
    // NOWPayments stores the NP_id (or the status moves on), the button is hidden. payment_url is
    // retained because the button is an anchor to it — without a link there is nothing to open.
    const canPay =
        ['HOTEL_APPROVED_AWAITING_PAYMENT', 'PAYMENT_PENDING'].includes(reservation.status) &&
        !reservation.nowpayments_payment_id;

    // Order-style STATIC "Expires in" countdown (verbatim My Orders helper) — computed ONCE at
    // render from the approved-unpaid deadline (approval_expires_at, the field the expiry cron
    // gates on). NO ticking; every page load/refresh recomputes the remaining time, exactly like
    // the My Orders list.
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

    const remainingTime = getRemainingTime(reservation?.approval_expires_at);

    return (
        <div className="overflow-hidden transition-all bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark">
            {/* Header */}
            <div className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                    <StatusBadge status={reservation.status} __={__} />
                    {/* Static "Expires in" countdown — ONLY while the 60-min approved-unpaid
                        window is live (same statuses as the Awaiting Payment tab / expiry cron).
                        Never on confirmed/expired/rejected/review states. */}
                    {TAB_GROUPS.awaiting_payment.includes(reservation.status) && (
                        <span className="text-[14px] font-semibold text-[#ff0000]">
                            {remainingTime &&
                                (remainingTime === 'Expired'
                                    ? __('Expired', true)
                                    : `${__('Expires in', true)} ${remainingTime}`)}
                        </span>
                    )}
                    <span className="flex items-center gap-1 text-sm text-sub-text-light dark:text-sub-text-dark">
                        {__('Reservation Number')}:{' '}
                        <span className="text-[14px] font-medium text-main-text-light dark:text-main-text-dark">
                            {reservation.reservation_no}
                        </span>
                        <button
                            className="font-semibold text-main-text-light dark:text-main-text-dark lg:hover:text-main-text-light/80 dark:lg:hover:text-main-text-dark/80"
                            onClick={() => {
                                navigator.clipboard.writeText(reservation.reservation_no);
                                setLinkCopied(true);
                            }}
                        >
                            <Copy className="size-3" />
                        </button>
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
                            className="w-3 h-3"
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

                <p className="max-w-xs mt-2 mb-8 text-sm leading-relaxed text-sub-text-light dark:text-sub-text-dark">
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
