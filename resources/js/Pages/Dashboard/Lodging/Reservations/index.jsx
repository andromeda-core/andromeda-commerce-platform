import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Table from '@/Components/Table';
import SelectInput from '@/Components/SelectInput';
import { useEffect, useState } from 'react';

// Full Doc 2 sec 4 lifecycle, grouped into badge colors.
const STATUS_OPTIONS = [
    'REQUESTED',
    'HOTEL_REVIEW_PENDING',
    'HOTEL_APPROVED_AWAITING_PAYMENT',
    'PAYMENT_LINK_CREATED',
    'PAYMENT_PENDING',
    'PAYMENT_CONFIRMED',
    'CONFIRMED',
    'HOTEL_REJECTED',
    'PAYMENT_EXPIRED',
    'PAYMENT_FAILED',
    'CANCELLED',
    'COMPLETED',
    'EXPIRED_NO_RESPONSE',
    'PAID_AWAITING_HOTEL_CONFIRMATION',
    'REJECTED_REFUND_REQUIRED',
];

const statusBadgeClass = (status) => {
    switch (status) {
        case 'CONFIRMED':
        case 'PAYMENT_CONFIRMED':
        case 'COMPLETED':
            return 'bg-green-500';
        case 'HOTEL_APPROVED_AWAITING_PAYMENT':
        case 'PAYMENT_LINK_CREATED':
        case 'PAYMENT_PENDING':
        case 'PAID_AWAITING_HOTEL_CONFIRMATION':
            return 'bg-blue-500';
        case 'REQUESTED':
        case 'HOTEL_REVIEW_PENDING':
            return 'bg-amber-500';
        case 'HOTEL_REJECTED':
        case 'PAYMENT_EXPIRED':
        case 'PAYMENT_FAILED':
        case 'CANCELLED':
        case 'EXPIRED_NO_RESPONSE':
        case 'REJECTED_REFUND_REQUIRED':
            return 'bg-red-500';
        default:
            return 'bg-gray-400';
    }
};

const fmtDate = (v) => (v ? String(v).slice(0, 10) : 'N/A');

const humanize = (v) =>
    v ? String(v).replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'N/A';

// SelectInput consumes `items` + `itemKey`; STATUS_OPTIONS is a flat string array. Map it so the
// option value = raw status (via `id`) and the visible label = humanized status (via itemKey="label").
const STATUS_SELECT_ITEMS = STATUS_OPTIONS.map((s) => ({
    id: s,
    label: humanize(s),
}));

export default function index({ lodging_reservations }) {
    const { props } = usePage();
    const [columns, setColumns] = useState([]);
    const [actions, setActions] = useState([]);
    const [status, setStatus] = useState(props?.status ?? '');

    useEffect(() => {
        const columns = [
            {
                label: 'Reservation No',
                render: (item) => (
                    <Link
                        href={route('dashboard.lodging-reservations.show', item?.reservation_no)}
                        className="cursor-pointer text-blue-500 underline"
                    >
                        {item.reservation_no || 'N/A'}
                    </Link>
                ),
            },
            {
                label: 'Property',
                render: (item) => item?.property_name_snapshot || 'N/A',
            },
            {
                label: 'Room / Rate Plan',
                render: (item) => (
                    <div className="flex flex-col">
                        <span>{item?.room_name_snapshot || 'N/A'}</span>
                        <span className="text-xs text-gray-400">
                            {item?.rate_plan_name_snapshot || 'N/A'}
                        </span>
                    </div>
                ),
            },
            {
                label: 'Check-in',
                render: (item) => fmtDate(item?.checkin_date),
            },
            {
                label: 'Check-out',
                render: (item) => fmtDate(item?.checkout_date),
            },
            {
                label: 'Guests',
                render: (item) => item?.guest_count ?? 'N/A',
            },
            {
                label: 'Guest',
                render: (item) => item?.customer?.user?.name || 'N/A',
            },
            {
                label: 'Booking Status',
                render: (item) => (
                    <span
                        className={`whitespace-nowrap rounded-lg p-2 text-xs text-white ${statusBadgeClass(item.status)}`}
                    >
                        {humanize(item.status)}
                    </span>
                ),
            },
            {
                label: 'Hotel Approval',
                render: (item) => humanize(item?.hotel_approval_status),
            },
            {
                label: 'Payment',
                render: (item) => {
                    const payments = item?.payments ?? [];
                    if (payments.length === 0) return 'No payment';
                    return humanize(payments[payments.length - 1]?.status);
                },
            },
            {
                label: 'Created',
                render: (item) => fmtDate(item?.created_at),
            },
            {
                // Doc 2 sec 7 — operator no-response deadline (now+24h, set on creation in Stage 2.4).
                label: 'Approval Deadline',
                render: (item) => fmtDate(item?.hotel_response_deadline),
            },
        ];

        const customActions = [
            {
                label: 'View',
                type: 'link',
                href: (item) => route('dashboard.lodging-reservations.show', item?.reservation_no),
            },
        ];

        setActions(customActions);
        setColumns(columns);
    }, []);

    const applyStatusFilter = (value) => {
        setStatus(value);
        router.get(
            route('dashboard.lodging-reservations.index', {
                ...(value ? { status: value } : {}),
                ...(props?.search ? { search: props.search } : {}),
            }),
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Lodging Reservations" />

            <BreadCrumb
                header={'Lodging Reservations'}
                parent={'Dashboard'}
                parent_link={route('dashboard')}
                child={'Lodging Reservations'}
            />

            <Card
                Content={
                    <Table
                        SearchRoute={'dashboard.lodging-reservations.index'}
                        Search={true}
                        DefaultSearchInput={true}
                        items={lodging_reservations}
                        props={props}
                        searchProps={{ ...(status ? { status } : {}) }}
                        columns={columns}
                        customActions={actions}
                        DeleteAction={false}
                        canSelect={false}
                        EditRoute={null}
                        customSearch={
                            <SelectInput
                                InputName={'Status'}
                                Id={'reservation-status-filter'}
                                Name={'status'}
                                items={STATUS_SELECT_ITEMS}
                                itemKey={'label'}
                                Value={status}
                                Action={(val) => applyStatusFilter(val ?? '')}
                                customPlaceHolder={true}
                                Placeholder={'All Statuses'}
                                CustomCss={'mt-3 w-full sm:w-[260px]'}
                            />
                        }
                    />
                }
            />
        </AuthenticatedLayout>
    );
}
