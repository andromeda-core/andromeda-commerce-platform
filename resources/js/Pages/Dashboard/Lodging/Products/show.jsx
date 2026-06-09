import Card from '@/Components/Card';
import LinkButton from '@/Components/LinkButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head } from '@inertiajs/react';
import { Fragment } from 'react';

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
        <span className={`rounded px-2 py-0.5 text-xs text-white ${value ? 'bg-green-500' : 'bg-gray-400'}`}>
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

export default function show({ lodging_product }) {
    const p = lodging_product ?? {};
    const checkin = p.checkin_policy ?? {};
    const parking = p.parking_policy ?? {};
    const cancellation = p.cancellation_policy ?? {};

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
                        <div className="my-3 flex flex-wrap justify-end">
                            <LinkButton
                                Text={'Back To Lodging Products'}
                                URL={route('dashboard.lodging-products.index')}
                            />
                        </div>

                        <Section title={'Property Details'}>
                            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Field label={'Property Name'} value={p.property_name} />
                                <Field label={'Property Type'} value={p.property_type} />
                                <Field label={'Public ID'} value={p.public_id} />
                                <Field label={'City / Region'} value={p.city_region} />
                                <Field label={'Floor'} value={p.floor?.name} />
                                <Field label={'Location Name'} value={p.location_name} />
                                <Field label={'Latitude'} value={p.latitude} />
                                <Field label={'Longitude'} value={p.longitude} />
                                <Field label={'From Price'} value={p.from_price} />
                                <Field label={'Base Check-in'} value={p.base_checkin_time} />
                                <Field label={'Base Check-out'} value={p.base_checkout_time} />
                                <Field label={'Tag'} value={p.tag} />
                                <Field
                                    label={'Assigned Dashboard User'}
                                    value={p.assigned_dashboard_user?.name}
                                />
                            </div>
                            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Bool label={'Active'} value={p.is_active} />
                                <Bool label={'Reservations Closed'} value={p.is_reservation_closed} />
                            </div>
                            <Field label={'Location Description'} value={p.location_description} />
                            <div className="mt-3">
                                <span className="text-xs uppercase text-gray-400">Content</span>
                                <p className="whitespace-pre-wrap text-sm text-main-text-light dark:text-main-text-dark">
                                    {p.content || 'N/A'}
                                </p>
                            </div>
                        </Section>

                        <Section title={'Property Amenities'}>
                            <div className="flex flex-wrap gap-2">
                                {(p.amenities ?? []).length === 0 && (
                                    <span className="text-sm text-gray-500">No amenities.</span>
                                )}
                                {(p.amenities ?? []).map((a) => (
                                    <span
                                        key={a.id}
                                        className="rounded-full bg-blue-500 px-3 py-1 text-xs text-white"
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
                                    className="mb-4 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
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
                                        <Field label={'Room Size'} value={room.room_size} />
                                        <Field label={'Room Floor Label'} value={room.room_floor_label} />
                                        <Field label={'Remaining'} value={room.remaining_room_count} />
                                    </div>

                                    <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2 md:grid-cols-3">
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
                                        <div className="mt-3 flex flex-wrap gap-2">
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
                                            <table className="w-full border-collapse text-sm">
                                                <thead>
                                                    <tr className="text-left text-gray-400">
                                                        <th className="border p-2 dark:border-gray-700">Plan</th>
                                                        <th className="border p-2 dark:border-gray-700">Sale Price</th>
                                                        <th className="border p-2 dark:border-gray-700">Original</th>
                                                        <th className="border p-2 dark:border-gray-700">Discount</th>
                                                        <th className="border p-2 dark:border-gray-700">Bookable</th>
                                                        <th className="border p-2 dark:border-gray-700">Cancellable</th>
                                                        <th className="border p-2 dark:border-gray-700">Active</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {room.rate_plans.map((plan) => (
                                                        <Fragment key={plan.id}>
                                                            <tr className="text-main-text-light dark:text-main-text-dark">
                                                                <td className="border p-2 dark:border-gray-700">{plan.name}</td>
                                                                <td className="border p-2 dark:border-gray-700">{plan.sale_price}</td>
                                                                <td className="border p-2 dark:border-gray-700">{plan.original_price ?? 'N/A'}</td>
                                                                <td className="border p-2 dark:border-gray-700">{Number(plan.discount_rate) > 0 ? `${Number(plan.discount_rate)}%` : '—'}</td>
                                                                <td className="border p-2 dark:border-gray-700">{plan.is_bookable ? 'Yes' : 'No'}</td>
                                                                <td className="border p-2 dark:border-gray-700">{plan.is_cancellable ? 'Yes' : 'No'}</td>
                                                                <td className="border p-2 dark:border-gray-700">{plan.is_active ? 'Yes' : 'No'}</td>
                                                            </tr>
                                                            <tr className="text-main-text-light dark:text-main-text-dark">
                                                                <td colSpan={7} className="border p-2 dark:border-gray-700">
                                                                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
                                                                        <span>
                                                                            Stay Type:{' '}
                                                                            <span className="text-main-text-light dark:text-main-text-dark">
                                                                                {plan.stay_type || 'N/A'}
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
                                                                            Same Day Booking:{' '}
                                                                            <span className="text-main-text-light dark:text-main-text-dark">
                                                                                {plan.same_day_booking_allowed ? 'Yes' : 'No'}
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
                                <Field label={'Early Check-in Fee'} value={checkin.early_checkin_fee} />
                                <Field label={'Late Check-out Fee'} value={checkin.late_checkout_fee} />
                                <Field label={'Instructions Sent When'} value={checkin.instructions_sent_when} />
                            </div>
                            <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2 md:grid-cols-3">
                                <Bool label={'Front Desk Available'} value={checkin.front_desk_available} />
                                <Bool label={'Self Check-in Available'} value={checkin.self_checkin_available} />
                                <Bool label={'Contactless Check-in Available'} value={checkin.contactless_checkin_available} />
                                <Bool label={'Host-meet Check-in Available'} value={checkin.host_meet_checkin_available} />
                            </div>
                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Field label={'Noise Policy'} value={checkin.noise_party_restriction} />
                                <Field label={'Party Policy'} value={checkin.party_policy} />
                            </div>
                        </Section>

                        <Section title={'Parking Policy'}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Field label={'Parking Type'} value={parking.parking_type} />
                                <Field label={'Spaces Per Room'} value={parking.spaces_per_room} />
                                <Field label={'Extra Parking Fee'} value={parking.extra_parking_fee} />
                                <Field label={'Vehicle Height Limit'} value={parking.vehicle_height_limit} />
                                <Field label={'Availability Time'} value={parking.parking_availability_time} />
                            </div>
                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Field label={'Large Vehicle Restriction'} value={parking.large_vehicle_restrictions} />
                                <Field label={'Modified Vehicle Restriction'} value={parking.modified_vehicle_restriction} />
                                <Field label={'Supercar Restriction'} value={parking.supercar_restriction} />
                            </div>
                        </Section>

                        <Section title={'Cancellation & Fee Policy'}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Field label={'Policy Name'} value={cancellation.policy_name} />
                                <Field label={'Free Cancellation Deadline'} value={cancellation.free_cancellation_deadline} />
                                <Field label={'Service Fee'} value={cancellation.service_fee} />
                                <Field label={'Cleaning Fee'} value={cancellation.cleaning_fee} />
                                <Field label={'Tax Amount'} value={cancellation.tax_amount} />
                                <Field label={'Security Deposit'} value={cancellation.security_deposit} />
                                <Field label={'Extra Guest Fee'} value={cancellation.extra_guest_fee} />
                                <Field label={'Child Fee'} value={cancellation.child_fee} />
                                <Field label={'Pet Fee'} value={cancellation.pet_fee} />
                                <Field label={'Extension Fee'} value={cancellation.extension_fee} />
                                <Field label={'On-site Payment Amount'} value={cancellation.onsite_payment_amount} />
                                <Field label={'Damage Fee'} value={cancellation.damage_fee} />
                                <Field label={'Minibar / Incidental Fee'} value={cancellation.minibar_incidental_fee} />
                                <Field label={'On-site Tax'} value={cancellation.onsite_tax} />
                            </div>
                            <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2 md:grid-cols-3">
                                <Bool label={'Service Fee Online'} value={cancellation.service_fee_online} />
                                <Bool label={'Cleaning Fee Online'} value={cancellation.cleaning_fee_online} />
                                <Bool label={'Tax Online'} value={cancellation.tax_online} />
                            </div>
                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Field label={'No-show Policy'} value={cancellation.no_show_policy} />
                                <Field label={'Rejection Refund Policy'} value={cancellation.rejection_refund_policy} />
                                <Field label={'Non-refundable Reasons'} value={cancellation.non_refundable_reasons} />
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
                                            className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                                        >
                                            {preview ? (
                                                <img src={preview} alt={media.alt_text || 'media'} className="h-28 w-full object-cover" />
                                            ) : (
                                                <div className="flex h-28 w-full items-center justify-center bg-gray-100 text-xs text-gray-500 dark:bg-white/5">
                                                    {media.type === 'video' ? 'Video' : 'Image'} ({media.upload_status})
                                                </div>
                                            )}
                                            <div className="p-2 text-xs capitalize text-gray-500">
                                                {media.type} · {media.upload_status}
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
