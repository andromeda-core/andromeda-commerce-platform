import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import Textarea from '@/Components/Textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';

const Field = ({ label, value }) => (
    <div className="flex flex-col">
        <span className="text-xs uppercase text-gray-400">{label}</span>
        <span className="text-sm text-main-text-light dark:text-main-text-dark">
            {value === null || value === undefined || value === '' ? 'N/A' : String(value)}
        </span>
    </div>
);

const Bool = ({ label, value }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm text-main-text-light dark:text-main-text-dark">{label}</span>
        <span
            className={`rounded px-2 py-0.5 text-xs text-white ${value ? 'bg-green-500' : 'bg-gray-400'}`}
        >
            {value ? 'Yes' : 'No'}
        </span>
    </div>
);

const Section = ({ title, children }) => (
    <div className="mb-6 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
        <h3 className="mb-4 text-base font-semibold text-main-text-light dark:text-main-text-dark">
            {title}
        </h3>
        {children}
    </div>
);

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
const fmtDateTime = (v) => (v ? String(v).replace('T', ' ').slice(0, 19) : 'N/A');
const humanize = (v) =>
    v ? String(v).replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'N/A';
const money = (amount, currency) =>
    amount === null || amount === undefined || amount === ''
        ? 'N/A'
        : `${amount}${currency ? ' ' + currency : ''}`;

export default function show({ lodging_reservation }) {
    const r = lodging_reservation ?? {};
    const guest = r.customer?.user ?? {};
    const payments = r.payments ?? [];

    // Approve / Reject are only valid while the reservation awaits hotel review.
    const canReview = r.status === 'HOTEL_REVIEW_PENDING';
    const paymentLink = payments.find((p) => p.nowpayments_payment_url)?.nowpayments_payment_url ?? null;

    const approveForm = useForm({});
    const rejectForm = useForm({ hotel_rejected_reason: '', hotel_rejection_note: '' });
    const suggestForm = useForm({ alternative_room_suggestion: '', alternative_date_suggestion: '' });
    const noteForm = useForm({ note: '' });

    const submitApprove = (e) => {
        e.preventDefault();
        approveForm.post(route('dashboard.lodging-reservations.approve', r.reservation_no), {
            preserveScroll: true,
        });
    };
    const submitReject = (e) => {
        e.preventDefault();
        rejectForm.post(route('dashboard.lodging-reservations.reject', r.reservation_no), {
            preserveScroll: true,
        });
    };
    const submitSuggest = (e) => {
        e.preventDefault();
        suggestForm.post(route('dashboard.lodging-reservations.suggest', r.reservation_no), {
            preserveScroll: true,
        });
    };
    const submitNote = (e) => {
        e.preventDefault();
        noteForm.post(route('dashboard.lodging-reservations.note', r.reservation_no), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Lodging Reservation" />

            <BreadCrumb
                header={'Lodging Reservation'}
                parent={'Lodging Reservations'}
                parent_link={route('dashboard.lodging-reservations.index')}
                child={r.reservation_no || 'Lodging Reservation'}
            />

            <Card
                Content={
                    <>
                        <div className="my-3 flex flex-wrap justify-end">
                            <LinkButton
                                Text={'Back To Lodging Reservations'}
                                URL={route('dashboard.lodging-reservations.index')}
                            />
                        </div>

                        {/* Operator Actions (Stage 2.3) — operator-facing, English. */}
                        <Section title={'Operator Actions'}>
                            {paymentLink && (
                                <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
                                    <span className="text-xs uppercase text-gray-400">
                                        Customer Payment Link (NOWPayments)
                                    </span>
                                    <div className="mt-1 break-all">
                                        <a
                                            href={paymentLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 underline dark:text-blue-400"
                                        >
                                            {paymentLink}
                                        </a>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-400">
                                        Delivering this link to the customer (notification) is handled
                                        in a later stage.
                                    </p>
                                </div>
                            )}

                            {canReview ? (
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <form
                                        onSubmit={submitApprove}
                                        className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                                    >
                                        <h4 className="mb-2 text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                            Approve
                                        </h4>
                                        <p className="mb-3 text-xs text-gray-400">
                                            Approves the request and automatically creates a
                                            NOWPayments crypto invoice. A 60-minute payment window is
                                            started.
                                        </p>
                                        <PrimaryButton
                                            Type={'submit'}
                                            Text={'Approve & Create Payment Link'}
                                            Spinner={approveForm.processing}
                                            Disabled={approveForm.processing}
                                            CustomClass={
                                                'bg-green-600 lg:hover:bg-green-700 text-white w-full '
                                            }
                                        />
                                    </form>

                                    <form
                                        onSubmit={submitReject}
                                        className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                                    >
                                        <h4 className="mb-2 text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                            Reject
                                        </h4>
                                        <Textarea
                                            InputName={'Rejection Reason'}
                                            Id={'hotel_rejected_reason'}
                                            Name={'hotel_rejected_reason'}
                                            Required={true}
                                            Rows={2}
                                            Value={rejectForm.data.hotel_rejected_reason}
                                            Action={(e) =>
                                                rejectForm.setData(
                                                    'hotel_rejected_reason',
                                                    e.target.value,
                                                )
                                            }
                                            Error={rejectForm.errors.hotel_rejected_reason}
                                            Placeholder={'Reason for the rejection'}
                                        />
                                        <Textarea
                                            InputName={'Internal Note (optional)'}
                                            Id={'hotel_rejection_note'}
                                            Name={'hotel_rejection_note'}
                                            Rows={2}
                                            Value={rejectForm.data.hotel_rejection_note}
                                            Action={(e) =>
                                                rejectForm.setData(
                                                    'hotel_rejection_note',
                                                    e.target.value,
                                                )
                                            }
                                            Error={rejectForm.errors.hotel_rejection_note}
                                            Placeholder={'Operator-only note'}
                                        />
                                        <PrimaryButton
                                            Type={'submit'}
                                            Text={'Reject Reservation'}
                                            Spinner={rejectForm.processing}
                                            Disabled={rejectForm.processing}
                                            CustomClass={
                                                'bg-red-600 lg:hover:bg-red-700 text-white w-full '
                                            }
                                        />
                                    </form>
                                </div>
                            ) : (
                                <p className="mb-4 text-sm text-gray-500">
                                    Approve / Reject are only available while the reservation is
                                    awaiting hotel review (current status:{' '}
                                    <span className="font-semibold">{humanize(r.status)}</span>).
                                </p>
                            )}

                            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                                <form
                                    onSubmit={submitSuggest}
                                    className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                                >
                                    <h4 className="mb-2 text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                        Suggest Alternative
                                    </h4>
                                    <Textarea
                                        InputName={'Alternative Room Suggestion'}
                                        Id={'alternative_room_suggestion'}
                                        Name={'alternative_room_suggestion'}
                                        Rows={2}
                                        Value={suggestForm.data.alternative_room_suggestion}
                                        Action={(e) =>
                                            suggestForm.setData(
                                                'alternative_room_suggestion',
                                                e.target.value,
                                            )
                                        }
                                        Error={suggestForm.errors.alternative_room_suggestion}
                                    />
                                    <Textarea
                                        InputName={'Alternative Date Suggestion'}
                                        Id={'alternative_date_suggestion'}
                                        Name={'alternative_date_suggestion'}
                                        Rows={2}
                                        Value={suggestForm.data.alternative_date_suggestion}
                                        Action={(e) =>
                                            suggestForm.setData(
                                                'alternative_date_suggestion',
                                                e.target.value,
                                            )
                                        }
                                        Error={suggestForm.errors.alternative_date_suggestion}
                                    />
                                    <PrimaryButton
                                        Type={'submit'}
                                        Text={'Save Suggestion'}
                                        Spinner={suggestForm.processing}
                                        Disabled={suggestForm.processing}
                                        CustomClass={'w-full '}
                                    />
                                </form>

                                <form
                                    onSubmit={submitNote}
                                    className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                                >
                                    <h4 className="mb-2 text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                        Add Internal Note
                                    </h4>
                                    <Textarea
                                        InputName={'Internal Note'}
                                        Id={'note'}
                                        Name={'note'}
                                        Required={true}
                                        Rows={4}
                                        Value={noteForm.data.note}
                                        Action={(e) => noteForm.setData('note', e.target.value)}
                                        Error={noteForm.errors.note}
                                        Placeholder={'Operator-only note'}
                                    />
                                    <PrimaryButton
                                        Type={'submit'}
                                        Text={'Save Note'}
                                        Spinner={noteForm.processing}
                                        Disabled={noteForm.processing}
                                        CustomClass={'w-full '}
                                    />
                                </form>
                            </div>
                        </Section>

                        <Section title={'Reservation Summary'}>
                            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Field label={'Reservation No'} value={r.reservation_no} />
                                <Field label={'Public ID'} value={r.public_id} />
                                <div className="flex flex-col">
                                    <span className="text-xs uppercase text-gray-400">
                                        Booking Status
                                    </span>
                                    <span>
                                        <span
                                            className={`inline-block rounded px-2 py-0.5 text-xs text-white ${statusBadgeClass(r.status)}`}
                                        >
                                            {humanize(r.status)}
                                        </span>
                                    </span>
                                </div>
                                <Field label={'Previous Status'} value={humanize(r.previous_status)} />
                                <Field label={'Created At'} value={fmtDateTime(r.created_at)} />
                                <Field label={'Updated At'} value={fmtDateTime(r.updated_at)} />
                            </div>
                        </Section>

                        <Section title={'Guest'}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Field label={'Guest Name'} value={guest.name} />
                                <Field label={'Guest Email'} value={guest.email} />
                                <Field label={'Guest Count'} value={r.guest_count} />
                            </div>
                            <div className="mt-3">
                                <span className="text-xs uppercase text-gray-400">
                                    Request Message
                                </span>
                                <p className="whitespace-pre-wrap text-sm text-main-text-light dark:text-main-text-dark">
                                    {r.request_message || 'N/A'}
                                </p>
                            </div>
                        </Section>

                        <Section title={'Booking (Snapshots at Create)'}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Field label={'Property (snapshot)'} value={r.property_name_snapshot} />
                                <Field label={'Room (snapshot)'} value={r.room_name_snapshot} />
                                <Field
                                    label={'Rate Plan (snapshot)'}
                                    value={r.rate_plan_name_snapshot}
                                />
                                <Field label={'Check-in Date'} value={fmtDate(r.checkin_date)} />
                                <Field label={'Check-out Date'} value={fmtDate(r.checkout_date)} />
                                <Field label={'Nights'} value={r.nights} />
                            </div>
                        </Section>

                        <Section title={'Pricing'}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Field
                                    label={'Price Snapshot (per night)'}
                                    value={money(r.price_snapshot, r.currency_code)}
                                />
                                <Field
                                    label={'Online Amount'}
                                    value={money(r.online_amount, r.currency_code)}
                                />
                                <Field label={'Currency'} value={r.currency_code} />
                            </div>
                            <p className="mt-3 text-xs text-gray-400">
                                Online amount = price × nights + online-flagged service/cleaning/tax
                                fees. On-site fees are collected at the property and are not included
                                here.
                            </p>
                        </Section>

                        <Section title={'Linked Catalog (current)'}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Field
                                    label={'Property'}
                                    value={r.lodging_product?.property_name}
                                />
                                <Field label={'Room'} value={r.lodging_room?.room_name} />
                                <Field label={'Rate Plan'} value={r.lodging_rate_plan?.name} />
                            </div>
                        </Section>

                        <Section title={'Operator / Approval'}>
                            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Field
                                    label={'Availability Mode'}
                                    value={humanize(r.availability_mode)}
                                />
                                <Field label={'Payment Timing'} value={humanize(r.payment_timing)} />
                                <Field
                                    label={'Approval Source'}
                                    value={humanize(r.approval_source)}
                                />
                                <Field
                                    label={'Hotel Approval Status'}
                                    value={humanize(r.hotel_approval_status)}
                                />
                                <Field
                                    label={'Assigned Dashboard User'}
                                    value={r.assigned_dashboard_user?.name}
                                />
                                <Field
                                    label={'Hotel Approved By'}
                                    value={r.hotel_approved_by?.name}
                                />
                                <Field
                                    label={'Hotel Approved At'}
                                    value={fmtDateTime(r.hotel_approved_at)}
                                />
                                <Field
                                    label={'Approval Expires At'}
                                    value={fmtDateTime(r.approval_expires_at)}
                                />
                                <Field
                                    label={'Hotel Response Deadline'}
                                    value={fmtDateTime(r.hotel_response_deadline)}
                                />
                            </div>
                            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Bool
                                    label={'Requires Hotel Approval'}
                                    value={r.requires_hotel_approval}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Field
                                    label={'Hotel Rejected Reason'}
                                    value={r.hotel_rejected_reason}
                                />
                                <Field
                                    label={'Hotel Rejection Note'}
                                    value={r.hotel_rejection_note}
                                />
                                <Field
                                    label={'Alternative Room Suggestion'}
                                    value={r.alternative_room_suggestion}
                                />
                                <Field
                                    label={'Alternative Date Suggestion'}
                                    value={r.alternative_date_suggestion}
                                />
                            </div>
                        </Section>

                        <Section title={`Payments (${payments.length})`}>
                            {payments.length === 0 && (
                                <span className="text-sm text-gray-500">
                                    No payment yet. A payment is created only after hotel approval
                                    (Stage 2.3).
                                </span>
                            )}
                            {payments.map((pay, idx) => (
                                <div
                                    key={pay.id ?? idx}
                                    className="mb-4 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                                >
                                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                        <Field label={'Status'} value={humanize(pay.status)} />
                                        <Field label={'Method'} value={humanize(pay.method_type)} />
                                        <Field
                                            label={'Amount'}
                                            value={money(pay.amount, pay.price_currency)}
                                        />
                                        <Field label={'Pay Currency'} value={pay.pay_currency} />
                                        <Field
                                            label={'NOWPayments Status'}
                                            value={pay.nowpayments_payment_status}
                                        />
                                        <Field label={'Tx Hash'} value={pay.tx_hash} />
                                        <Field
                                            label={'Created At'}
                                            value={fmtDateTime(pay.created_at)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </Section>

                        <Section title={'MSAP / Future (read-only)'}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Field label={'Booking Source'} value={r.booking_source} />
                                <Field label={'Source of Truth'} value={r.source_of_truth} />
                                <Field label={'Sync Status'} value={r.sync_status} />
                                <Field label={'External Provider'} value={r.external_provider} />
                                <Field label={'External Listing ID'} value={r.external_listing_id} />
                                <Field label={'External Room ID'} value={r.external_room_id} />
                                <Field
                                    label={'External Rate Plan ID'}
                                    value={r.external_rate_plan_id}
                                />
                                <Field label={'External Booking ID'} value={r.external_booking_id} />
                                <Field label={'External Case ID'} value={r.external_case_id} />
                                <Field label={'MSAP URI'} value={r.msap_uri} />
                                <Field label={'MSAP Event Ref'} value={r.msap_event_ref} />
                                <Field label={'Event ID'} value={r.event_id} />
                            </div>
                        </Section>
                    </>
                }
            />
        </AuthenticatedLayout>
    );
}
