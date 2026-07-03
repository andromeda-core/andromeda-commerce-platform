import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head } from '@inertiajs/react';
import { Fragment } from 'react';

const Field = ({ label, value }) => (
    <div className="flex flex-col">
        <span className="text-xs text-gray-400 uppercase">{label}</span>
        <span className="text-sm break-all text-main-text-light dark:text-main-text-dark">
            {value === null || value === undefined || value === '' ? 'N/A' : String(value)}
        </span>
    </div>
);

const Bool = ({ label, value }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm text-main-text-light dark:text-main-text-dark">{label}</span>
        <span className={`rounded px-2 py-0.5 text-xs text-white ${value ? 'bg-green-500' : 'bg-gray-400'}`}>
            {value ? 'Yes' : 'No'}
        </span>
    </div>
);

const Section = ({ title, children }) => (
    <div className="p-4 mb-6 border border-gray-200 rounded-xl dark:border-gray-700">
        <h3 className="mb-4 text-base font-semibold text-main-text-light dark:text-main-text-dark">
            {title}
        </h3>
        {children}
    </div>
);

// Display-only thousand separators for fee/price cells (1000 -> 1,000.00). Returns null for empty
// so <Field> shows "N/A". Never alters stored values — this is an admin verification page.
const money = (value) => {
    if (value === null || value === undefined || value === '' || Number.isNaN(Number(value))) {
        return null;
    }
    return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

// Join an array (payment_methods, bed_types, hashtags) into a readable comma list; pass through
// non-arrays unchanged so <Field> still renders/falls back to N/A.
const list = (value) =>
    Array.isArray(value)
        ? value.filter((v) => v !== null && v !== undefined && v !== '').join(', ')
        : value;

// Presence indicator for the reserved JSON blobs (element_bundle / external_api_payload_snapshot):
// "Present" when populated, null otherwise so <Field> shows N/A. Avoids dumping "[object Object]".
const present = (value) => {
    if (Array.isArray(value)) return value.length > 0 ? 'Present' : null;
    if (value && typeof value === 'object') return Object.keys(value).length > 0 ? 'Present' : null;
    return value ? 'Present' : null;
};

// refund_schedule is a JSON array of { label, refund_percent } rows — render a readable summary.
const refundScheduleText = (schedule) => {
    if (!Array.isArray(schedule) || schedule.length === 0) return null;
    return schedule
        .map((row) => {
            if (!row || typeof row !== 'object') return String(row ?? '');
            const label = String(row.label ?? '').trim();
            const pct = row.refund_percent;
            const pctText =
                pct !== null && pct !== undefined && String(pct).trim() !== '' ? `${pct}%` : '';
            return [label, pctText].filter(Boolean).join(': ');
        })
        .filter(Boolean)
        .join(', ');
};

export default function show({ lodging_product }) {
    const p = lodging_product ?? {};
    const checkin = p.checkin_policy ?? {};
    const parking = p.parking_policy ?? {};
    const cancellation = p.cancellation_policy ?? {};

    // Optional floor RANGE label ("1F - 3F"); floor (anchor) is shown separately above.
    const floorRange =
        p.floor_start?.name && p.floor_end?.name
            ? `${p.floor_start.name} - ${p.floor_end.name}`
            : null;

    return (
        <AuthenticatedLayout>
            <Head title="Lodging Product" />

            <BreadCrumb
                header={'Lodging Product'}
                parent={'Lodging Products'}
                parent_link={route('dashboard.lodging-products.index')}
                child={p.property_name || 'Lodging Product'}
            />

            <Card
                Content={
                    <>
                        <div className="flex flex-wrap justify-end my-3">
                            <LinkButton
                                Text={'Back To Lodging Products'}
                                URL={route('dashboard.lodging-products.index')}
                            />
                        </div>

                        <Section title={'Property Details'}>
                            <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-3">
                                <Field label={'Property Name'} value={p.property_name} />
                                <Field label={'Property Type'} value={p.property_type} />
                                <Field label={'Public ID'} value={p.public_id} />
                                <Field label={'City / Region'} value={p.city_region} />
                                <Field label={'Floor (Anchor)'} value={p.floor?.name} />
                                <Field label={'Floor Range'} value={floorRange} />
                                <Field label={'Location Name'} value={p.location_name} />
                                <Field label={'Latitude'} value={p.latitude} />
                                <Field label={'Longitude'} value={p.longitude} />
                                <Field label={'From Price'} value={money(p.from_price)} />
                                <Field label={'Base Check-in'} value={p.base_checkin_time} />
                                <Field label={'Base Check-out'} value={p.base_checkout_time} />
                                <Field label={'Tag'} value={p.tag} />
                                <Field
                                    label={'Assigned Dashboard User'}
                                    value={p.assigned_dashboard_user?.name}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                                <Bool label={'Active'} value={p.is_active} />
                                <Bool label={'Reservations Closed'} value={p.is_reservation_closed} />
                            </div>
                            <Field label={'Location Description'} value={p.location_description} />
                            <div className="mt-3">
                                <span className="text-xs text-gray-400 uppercase">Content</span>
                                <p className="text-sm break-all whitespace-pre-wrap text-main-text-light dark:text-main-text-dark">
                                    {p.content || 'N/A'}
                                </p>
                            </div>
                        </Section>

                        <Section title={'System & Integration (read-only)'}>
                            <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-3">
                                <Field label={'Slug'} value={p.slug} />
                                <Field label={'Booking Source'} value={p.booking_source} />
                                <Field label={'Source Of Truth'} value={p.source_of_truth} />
                                <Field label={'Sync Status'} value={p.sync_status} />
                                <Field label={'External Provider'} value={p.external_provider} />
                                <Field label={'External Listing ID'} value={p.external_listing_id} />
                                <Field label={'External API Render Mode'} value={p.external_api_render_mode} />
                                <Field label={'MSAP URI'} value={p.msap_uri} />
                                <Field label={'MSAP Event Ref'} value={p.msap_event_ref} />
                                <Field label={'External API Payload'} value={present(p.external_api_payload_snapshot)} />
                                <Field label={'Element Bundle'} value={present(p.element_bundle)} />
                            </div>
                            <Bool label={'MSAP Ready'} value={p.msap_ready} />
                        </Section>

                        <Section title={'Property Amenities'}>
                            <div className="flex flex-wrap gap-2">
                                {(p.amenities ?? []).length === 0 && (
                                    <span className="text-sm text-gray-500">No amenities.</span>
                                )}
                                {(p.amenities ?? []).map((a) => (
                                    <span
                                        key={a.id}
                                        className="px-3 py-1 text-xs text-white bg-blue-500 rounded-full"
                                    >
                                        {a.name}
                                    </span>
                                ))}
                            </div>
                        </Section>

                        <Section title={`Rooms (${(p.rooms ?? []).length})`}>
                            {(p.rooms ?? []).length === 0 && (
                                <span className="text-sm text-gray-500">No rooms.</span>
                            )}
                            {(p.rooms ?? []).map((room, idx) => (
                                <div
                                    key={room.id ?? idx}
                                    className="p-3 mb-4 border border-gray-200 rounded-lg dark:border-gray-700"
                                >
                                    <h4 className="mb-3 text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                        {room.room_name} <span className="text-gray-400">({room.room_type})</span>
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                        <Field label={'Standard Guests'} value={room.standard_guests} />
                                        <Field label={'Max Guests'} value={room.max_guests} />
                                        <Field label={'Bedrooms'} value={room.bedrooms_count} />
                                        <Field label={'Beds'} value={room.beds_count} />
                                        <Field label={'Bed Types'} value={(room.bed_types ?? []).join(', ')} />
                                        <Field label={'Bed Size'} value={room.bed_size} />
                                        <Field label={'Bathrooms'} value={room.bathrooms_count} />
                                        <Field label={'Toilets'} value={room.toilets_count} />
                                        <Field label={'View'} value={room.view_type} />
                                        <Field label={'Custom View'} value={room.view_type_other} />
                                        <Field label={'Room Size'} value={room.room_size} />
                                        <Field label={'Room Floor Label'} value={room.room_floor_label} />
                                        <Field label={'Remaining'} value={room.remaining_room_count} />
                                        <Field label={'External Room ID'} value={room.external_room_id} />
                                    </div>

                                    <div className="grid grid-cols-1 mt-3 gap-x-6 gap-y-1 sm:grid-cols-2 md:grid-cols-3">
                                        <Bool label={'Private Bathroom'} value={room.is_bathroom_private} />
                                        <Bool label={'Has Jacuzzi'} value={room.has_jacuzzi} />
                                        <Bool label={'Has Bathtub'} value={room.has_bathtub} />
                                        <Bool label={'Has Shower Booth'} value={room.has_shower_booth} />
                                        <Bool label={'Smoking Allowed'} value={room.is_smoking_allowed} />
                                        <Bool label={'Children Allowed'} value={room.children_allowed} />
                                        <Bool label={'Pets Allowed'} value={room.pets_allowed} />
                                        <Bool label={'Random Room Assignment'} value={room.is_random_assignment} />
                                        <Bool label={'Available'} value={room.is_available} />
                                    </div>

                                    {(room.amenities ?? []).length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {room.amenities.map((a) => (
                                                <span
                                                    key={a.id}
                                                    className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700 dark:bg-white/10 dark:text-gray-200"
                                                >
                                                    {a.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {(room.rate_plans ?? []).length > 0 && (
                                        <div className="mt-3 overflow-x-auto">
                                            <table className="w-full text-sm border-collapse">
                                                <thead>
                                                    <tr className="text-left text-gray-400">
                                                        <th className="p-2 border dark:border-gray-700">Plan</th>
                                                        <th className="p-2 border dark:border-gray-700">Sale Price</th>
                                                        <th className="p-2 border dark:border-gray-700">Original</th>
                                                        <th className="p-2 border dark:border-gray-700">Discount</th>
                                                        <th className="p-2 border dark:border-gray-700">Bookable</th>
                                                        <th className="p-2 border dark:border-gray-700">Cancellable</th>
                                                        <th className="p-2 border dark:border-gray-700">Active</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {room.rate_plans.map((plan) => (
                                                        <Fragment key={plan.id}>
                                                            <tr className="text-main-text-light dark:text-main-text-dark">
                                                                <td className="p-2 border dark:border-gray-700">{plan.name}</td>
                                                                <td className="p-2 border dark:border-gray-700">{money(plan.sale_price) ?? 'N/A'}</td>
                                                                <td className="p-2 border dark:border-gray-700">{money(plan.original_price) ?? 'N/A'}</td>
                                                                <td className="p-2 border dark:border-gray-700">{Number(plan.discount_rate) > 0 ? `${Number(plan.discount_rate)}%` : '—'}</td>
                                                                <td className="p-2 border dark:border-gray-700">{plan.is_bookable ? 'Yes' : 'No'}</td>
                                                                <td className="p-2 border dark:border-gray-700">{plan.is_cancellable ? 'Yes' : 'No'}</td>
                                                                <td className="p-2 border dark:border-gray-700">{plan.is_active ? 'Yes' : 'No'}</td>
                                                            </tr>
                                                            <tr className="text-main-text-light dark:text-main-text-dark">
                                                                <td colSpan={7} className="p-2 border dark:border-gray-700">
                                                                    <div className="flex flex-wrap text-xs text-gray-500 gap-x-6 gap-y-1">
                                                                        <span>
                                                                            Stay Type:{' '}
                                                                            <span className="text-main-text-light dark:text-main-text-dark">
                                                                                {plan.stay_type || 'N/A'}
                                                                            </span>
                                                                        </span>
                                                                        <span>
                                                                            Member Price:{' '}
                                                                            <span className="text-main-text-light dark:text-main-text-dark">
                                                                                {money(plan.member_price) ?? 'N/A'}
                                                                            </span>
                                                                        </span>
                                                                        <span>
                                                                            Min Nights:{' '}
                                                                            <span className="text-main-text-light dark:text-main-text-dark">
                                                                                {plan.minimum_nights ?? 'N/A'}
                                                                            </span>
                                                                        </span>
                                                                        <span>
                                                                            Max Nights:{' '}
                                                                            <span className="text-main-text-light dark:text-main-text-dark">
                                                                                {plan.maximum_nights ?? 'N/A'}
                                                                            </span>
                                                                        </span>
                                                                        <span>
                                                                            Booking Cutoff:{' '}
                                                                            <span className="text-main-text-light dark:text-main-text-dark">
                                                                                {plan.booking_cutoff_time || 'N/A'}
                                                                            </span>
                                                                        </span>
                                                                        <span>
                                                                            Remaining Rooms:{' '}
                                                                            <span className="text-main-text-light dark:text-main-text-dark">
                                                                                {plan.remaining_room_count ?? 'N/A'}
                                                                            </span>
                                                                        </span>
                                                                        <span>
                                                                            Payment Methods:{' '}
                                                                            <span className="text-main-text-light dark:text-main-text-dark">
                                                                                {list(plan.payment_methods) || 'N/A'}
                                                                            </span>
                                                                        </span>
                                                                        <span>
                                                                            External Rate Plan ID:{' '}
                                                                            <span className="text-main-text-light dark:text-main-text-dark">
                                                                                {plan.external_rate_plan_id || 'N/A'}
                                                                            </span>
                                                                        </span>
                                                                        <span>
                                                                            Same Day Booking:{' '}
                                                                            <span className="text-main-text-light dark:text-main-text-dark">
                                                                                {plan.same_day_booking_allowed ? 'Yes' : 'No'}
                                                                            </span>
                                                                        </span>
                                                                        <span>
                                                                            Consecutive Nights:{' '}
                                                                            <span className="text-main-text-light dark:text-main-text-dark">
                                                                                {plan.consecutive_nights_allowed ? 'Yes' : 'No'}
                                                                            </span>
                                                                        </span>
                                                                        <span>
                                                                            Crypto Supported:{' '}
                                                                            <span className="text-main-text-light dark:text-main-text-dark">
                                                                                {plan.crypto_supported ? 'Yes' : 'No'}
                                                                            </span>
                                                                        </span>
                                                                        <span>
                                                                            Non-Refundable:{' '}
                                                                            <span className="text-main-text-light dark:text-main-text-dark">
                                                                                {plan.is_non_refundable ? 'Yes' : 'No'}
                                                                            </span>
                                                                        </span>
                                                                        <span>
                                                                            Breakfast Included:{' '}
                                                                            <span className="text-main-text-light dark:text-main-text-dark">
                                                                                {plan.breakfast_included ? 'Yes' : 'No'}
                                                                            </span>
                                                                        </span>
                                                                        <span>
                                                                            Free Parking Included:{' '}
                                                                            <span className="text-main-text-light dark:text-main-text-dark">
                                                                                {plan.free_parking_included ? 'Yes' : 'No'}
                                                                            </span>
                                                                        </span>
                                                                        <span>
                                                                            Early Check-in Included:{' '}
                                                                            <span className="text-main-text-light dark:text-main-text-dark">
                                                                                {plan.early_checkin_included ? 'Yes' : 'No'}
                                                                            </span>
                                                                        </span>
                                                                        <span>
                                                                            Late Check-out Included:{' '}
                                                                            <span className="text-main-text-light dark:text-main-text-dark">
                                                                                {plan.late_checkout_included ? 'Yes' : 'No'}
                                                                            </span>
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </Fragment>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </Section>

                        <Section title={'Check-in Policy'}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Field label={'Check-in Time'} value={checkin.checkin_time} />
                                <Field label={'Check-out Time'} value={checkin.checkout_time} />
                                <Field label={'Check-in Method'} value={checkin.checkin_method} />
                                <Field label={'Early Check-in Fee'} value={money(checkin.early_checkin_fee)} />
                                <Field label={'Early Check-in Fee Display Text'} value={checkin.early_checkin_fee_display_text} />
                                <Field label={'Late Check-out Fee'} value={money(checkin.late_checkout_fee)} />
                                <Field label={'Late Check-out Fee Display Text'} value={checkin.late_checkout_fee_display_text} />
                                <Field label={'Instructions Sent When'} value={checkin.instructions_sent_when} />
                            </div>
                            <div className="grid grid-cols-1 mt-4 gap-x-6 gap-y-1 sm:grid-cols-2 md:grid-cols-3">
                                <Bool label={'Early Check-in Available'} value={checkin.early_checkin_available} />
                                <Bool label={'Late Check-out Available'} value={checkin.late_checkout_available} />
                                <Bool label={'ID Verification Required'} value={checkin.id_verification_required} />
                                <Bool label={'Front Desk Available'} value={checkin.front_desk_available} />
                                <Bool label={'Self Check-in Available'} value={checkin.self_checkin_available} />
                                <Bool label={'Contactless Check-in Available'} value={checkin.contactless_checkin_available} />
                                <Bool label={'Host-meet Check-in Available'} value={checkin.host_meet_checkin_available} />
                            </div>
                            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                                <Field label={'Noise Policy'} value={checkin.noise_party_restriction} />
                                <Field label={'Party Policy'} value={checkin.party_policy} />
                                <Field label={'Same Day Booking Notice'} value={checkin.same_day_booking_notice} />
                                <Field label={'Early Entry Penalty'} value={checkin.early_entry_penalty} />
                                <Field label={'Late Check-out Penalty'} value={checkin.late_checkout_penalty} />
                                <Field label={'Minor Policy'} value={checkin.minor_policy} />
                                <Field label={'Mixed Gender Policy'} value={checkin.mixed_gender_policy} />
                                <Field label={'Check-in Instruction Message'} value={checkin.checkin_instruction_message} />
                            </div>
                        </Section>

                        <Section title={'Parking Policy'}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Field label={'Parking Type'} value={parking.parking_type} />
                                <Field label={'Spaces Per Room'} value={parking.spaces_per_room} />
                                <Field label={'Extra Parking Fee'} value={money(parking.extra_parking_fee)} />
                                <Field label={'Extra Parking Fee Display Text'} value={parking.extra_parking_fee_display_text} />
                                <Field label={'Vehicle Height Limit'} value={parking.vehicle_height_limit} />
                                <Field label={'Availability Time'} value={parking.parking_availability_time} />
                            </div>
                            <div className="grid grid-cols-1 mt-4 gap-x-6 gap-y-1 sm:grid-cols-2 md:grid-cols-3">
                                <Bool label={'Parking Available'} value={parking.parking_available} />
                                <Bool label={'Parking Free'} value={parking.parking_free} />
                                <Bool label={'Pre-registration Required'} value={parking.pre_registration_required} />
                                <Bool label={'Nearby Parking Available'} value={parking.nearby_parking_available} />
                                <Bool label={'Fee Paid By Guest'} value={parking.fee_paid_by_guest} />
                                <Bool label={'EV Charging Available'} value={parking.ev_charging_available} />
                                <Bool label={'Refund If No Parking'} value={parking.refund_if_no_parking} />
                            </div>
                            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                                <Field label={'Before Check-in / After Check-out'} value={parking.before_checkin_after_checkout} />
                                <Field label={'Full Lot Policy'} value={parking.full_lot_policy} />
                                <Field label={'Large Vehicle Restriction'} value={parking.large_vehicle_restrictions} />
                                <Field label={'Modified Vehicle Restriction'} value={parking.modified_vehicle_restriction} />
                                <Field label={'Supercar Restriction'} value={parking.supercar_restriction} />
                            </div>
                        </Section>

                        <Section title={'Cancellation & Fee Policy'}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Field label={'Policy Name'} value={cancellation.policy_name} />
                                <Field label={'Free Cancellation Deadline'} value={cancellation.free_cancellation_deadline} />
                                <Field label={'Service Fee'} value={money(cancellation.service_fee)} />
                                <Field label={'Cleaning Fee'} value={money(cancellation.cleaning_fee)} />
                                <Field label={'Tax Amount'} value={money(cancellation.tax_amount)} />
                                <Field label={'Security Deposit'} value={money(cancellation.security_deposit)} />
                                <Field label={'Security Deposit Display Text'} value={cancellation.security_deposit_display_text} />
                                <Field label={'Extra Guest Fee'} value={money(cancellation.extra_guest_fee)} />
                                <Field label={'Extra Guest Fee Display Text'} value={cancellation.extra_guest_fee_display_text} />
                                <Field label={'Child Fee'} value={money(cancellation.child_fee)} />
                                <Field label={'Child Fee Display Text'} value={cancellation.child_fee_display_text} />
                                <Field label={'Pet Fee'} value={money(cancellation.pet_fee)} />
                                <Field label={'Pet Fee Display Text'} value={cancellation.pet_fee_display_text} />
                                <Field label={'Extension Fee'} value={money(cancellation.extension_fee)} />
                                <Field label={'Extension Fee Display Text'} value={cancellation.extension_fee_display_text} />
                                <Field label={'On-site Payment Amount'} value={money(cancellation.onsite_payment_amount)} />
                                <Field label={'On-site Payment Amount Display Text'} value={cancellation.onsite_payment_amount_display_text} />
                                <Field label={'Damage Fee'} value={money(cancellation.damage_fee)} />
                                <Field label={'Damage Fee Display Text'} value={cancellation.damage_fee_display_text} />
                                <Field label={'Minibar / Incidental Fee'} value={money(cancellation.minibar_incidental_fee)} />
                                <Field label={'Minibar / Incidental Fee Display Text'} value={cancellation.minibar_incidental_fee_display_text} />
                                <Field label={'On-site Tax'} value={money(cancellation.onsite_tax)} />
                                <Field label={'On-site Tax Display Text'} value={cancellation.onsite_tax_display_text} />
                            </div>
                            <div className="grid grid-cols-1 mt-4 gap-x-6 gap-y-1 sm:grid-cols-2 md:grid-cols-3">
                                <Bool label={'Service Fee Online'} value={cancellation.service_fee_online} />
                                <Bool label={'Cleaning Fee Online'} value={cancellation.cleaning_fee_online} />
                                <Bool label={'Tax Online'} value={cancellation.tax_online} />
                                <Bool label={'Requires Admin Confirmation'} value={cancellation.requires_admin_confirmation} />
                            </div>
                            <div className="mt-4">
                                <Field label={'Refund Schedule'} value={refundScheduleText(cancellation.refund_schedule)} />
                            </div>
                            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                                <Field label={'No-show Policy'} value={cancellation.no_show_policy} />
                                <Field label={'Rejection Refund Policy'} value={cancellation.rejection_refund_policy} />
                                <Field label={'Non-refundable Reasons'} value={cancellation.non_refundable_reasons} />
                                <Field label={'Damage Policy'} value={cancellation.damage_policy} />
                            </div>
                        </Section>

                        <Section title={'Assigned Distributor'}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Field label={'Name'} value={p.accommodation_distributor?.user?.name} />
                                <Field label={'Email'} value={p.accommodation_distributor?.user?.email} />
                            </div>
                        </Section>

                        <Section title={`Media (${(p.media ?? []).length})`}>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                {(p.media ?? []).length === 0 && (
                                    <span className="text-sm text-gray-500">No media.</span>
                                )}
                                {(p.media ?? []).map((media) => {
                                    const preview = media.type === 'video' ? media.thumbnail_url : media.file_url;
                                    return (
                                        <div
                                            key={media.id}
                                            className="overflow-hidden border border-gray-200 rounded-lg dark:border-gray-700"
                                        >
                                            {preview ? (
                                                <img src={preview} alt={media.alt_text || 'media'} className="object-cover w-full h-28" />
                                            ) : (
                                                <div className="flex items-center justify-center w-full text-xs text-gray-500 bg-gray-100 h-28 dark:bg-white/5">
                                                    {media.type === 'video' ? 'Video' : 'Image'} ({media.upload_status})
                                                </div>
                                            )}
                                            <div className="space-y-0.5 p-2 text-xs text-gray-500">
                                                <p className="capitalize">
                                                    {media.type} · {media.upload_status}
                                                </p>
                                                <p>
                                                    <span className="text-gray-400">Alt: </span>
                                                    {media.alt_text || 'N/A'}
                                                </p>
                                                <p>
                                                    <span className="text-gray-400">Caption: </span>
                                                    {media.caption || 'N/A'}
                                                </p>
                                                <p>
                                                    <span className="text-gray-400">Role: </span>
                                                    {media.evidence_role || 'N/A'}
                                                </p>
                                                <p>
                                                    <span className="text-gray-400">Visibility: </span>
                                                    {media.visibility || 'N/A'}
                                                </p>
                                                <p>
                                                    <span className="text-gray-400">Sort: </span>
                                                    {media.sort_order ?? 'N/A'}
                                                </p>
                                                <p className="truncate">
                                                    <span className="text-gray-400">File: </span>
                                                    {media.file_name || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Section>
                    </>
                }
            />
        </AuthenticatedLayout>
    );
}
