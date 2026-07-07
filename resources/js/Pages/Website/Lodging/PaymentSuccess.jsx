import React, { useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/Website/MainLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import { CheckCircle2, Clock, XCircle, AlertTriangle, ChevronLeft } from 'lucide-react';
import {
    trackPixelEvent,
    buildEventId,
    isConfirmedOrLaterReservationStatus,
} from '@/Helpers/metaPixel';

/**
 * Stage 2.4 Fix 2 — Lodging payment success page (NOWPayments success_url landing).
 *
 * READ-ONLY UX: it shows the reservation's CURRENT status (derived server-side as
 * `display_state`). It never confirms payment — the scheduled poll command does that.
 * The customer gets a clean return experience with two non-dead actions.
 */
export default function PaymentSuccess() {
    const { reservation, my_reservations_url } = usePage().props;
    const { __ } = useTranslation();

    const state = reservation?.display_state ?? 'processing';

    // Meta Pixel Schedule — fires once the reservation's real status is 'CONFIRMED' OR any status
    // only reachable after having been confirmed (see CONFIRMED_OR_LATER_RESERVATION_STATUSES;
    // not REQUESTED/HOTEL_REVIEW_PENDING/any pending/review status — those belong to the earlier
    // funnel, not Schedule). This page is not itself a polling loop (the backend confirms
    // asynchronously), so this fires whenever the customer is viewing it with an already-confirmed
    // (or further-progressed) reservation. content_ids omitted: this page's props carry only
    // reservation-level fields, not the lodging product's public_id.
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

    // Map the server-derived display state -> icon + heading + message (all translated).
    const STATES = {
        confirmed: {
            Icon: CheckCircle2,
            tone: 'text-green-500',
            ring: 'bg-green-500/10',
            heading: __('Payment Confirmed'),
            message: __('Your payment is confirmed and your reservation is confirmed.'),
        },
        pending: {
            Icon: Clock,
            tone: 'text-amber-500',
            ring: 'bg-amber-500/10',
            heading: __('Payment Received'),
            message: __('We have received your payment and are confirming it. You will get an email once your reservation is confirmed.'),
        },
        expired: {
            Icon: AlertTriangle,
            tone: 'text-red-500',
            ring: 'bg-red-500/10',
            heading: __('Reservation Expired'),
            message: __('This reservation has expired.'),
        },
        failed: {
            Icon: XCircle,
            tone: 'text-red-500',
            ring: 'bg-red-500/10',
            heading: __('Payment Failed'),
            message: __('Your payment could not be completed.'),
        },
        processing: {
            Icon: Clock,
            tone: 'text-sky-500',
            ring: 'bg-sky-500/10',
            heading: __('Processing'),
            message: __('We are processing your reservation.'),
        },
    };

    const view = STATES[state] ?? STATES.processing;
    const Icon = view.Icon;

    const amount =
        reservation?.online_amount != null
            ? `${Number(reservation.online_amount).toFixed(2)} ${reservation?.currency_code ?? ''}`.trim()
            : null;

    const Row = ({ label, value }) =>
        value ? (
            <div className="flex items-start justify-between gap-4 py-2 border-b border-surface-3-light dark:border-surface-3-dark last:border-0">
                <span className="text-sm shrink-0 text-sub-text-light dark:text-sub-text-dark">{label}</span>
                <span className="min-w-0 text-sm font-medium text-right break-words text-main-text-light dark:text-main-text-dark">{value}</span>
            </div>
        ) : null;

    return (
        <MainLayout>
            <Head title={__('Reservation Payment', true)} />

            <div className="px-4 sm:px-6 lg:px-8">
                <div className="max-w-xl py-10 mx-auto">
                    <button
                        onClick={() => router.visit(route('home'))}
                        className="inline-flex items-center gap-1 mb-6 text-sm font-medium transition-colors text-main-text-light lg:hover:text-main-text-light/80 dark:text-main-text-dark dark:lg:hover:text-main-text-dark/80"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        {__('Back')}
                    </button>

                    <div className="p-6 bg-white border rounded-md border-surface-3-light dark:border-surface-3-dark dark:bg-surface-1-dark sm:p-8">
                        {/* Status icon + heading + message */}
                        <div className="flex flex-col items-center text-center">
                            <div className={`flex items-center justify-center w-16 h-16 rounded-full ${view.ring}`}>
                                <Icon className={`w-9 h-9 ${view.tone}`} />
                            </div>
                            <h1 className="mt-4 text-xl font-semibold text-main-text-light dark:text-main-text-dark">
                                {view.heading}
                            </h1>
                            <p className="max-w-md mt-2 text-sm text-sub-text-light dark:text-sub-text-dark">
                                {view.message}
                            </p>
                        </div>

                        {/* Reservation details */}
                        <div className="mt-6">
                            <Row label={__('Customer Name')} value={reservation?.customer_name} />
                            <Row label={__('Reservation Number')} value={reservation?.reservation_no} />
                            <Row label={__('Property')} value={reservation?.property_name_snapshot} />
                            <Row label={__('Room')} value={reservation?.room_name_snapshot} />
                            <Row label={__('Check-in')} value={reservation?.checkin_date} />
                            <Row label={__('Check-out')} value={reservation?.checkout_date} />
                            <Row label={__('Amount')} value={amount} />
                        </div>

                        {/* Actions — never dead links */}
                        <div className="flex flex-col gap-3 mt-8 sm:flex-row">
                            <Link
                                href={my_reservations_url}
                                className="inline-flex items-center justify-center flex-1 px-4 py-2.5 text-sm font-semibold transition-all rounded-md bg-main-text-light text-main-text-dark hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80"
                            >
                                {__('Go to My Reservations')}
                            </Link>
                            <button
                                onClick={() => router.visit(route('home'))}
                                className="inline-flex items-center justify-center flex-1 px-4 py-2.5 text-sm font-semibold transition-colors border rounded-md border-surface-3-light dark:border-surface-3-dark text-main-text-light dark:text-main-text-dark lg:hover:bg-surface-1-light dark:lg:hover:bg-surface-3-dark"
                            >
                                {__('Back')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
