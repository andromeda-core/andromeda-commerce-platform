import React from 'react';

// Map an enum string array (from the `enums` prop) into SelectInput-friendly options.
export const toOptions = (arr) => (Array.isArray(arr) ? arr.map((v) => ({ id: v, name: v })) : []);

// Human-readable labels for bed_types values (the stored value stays the raw key).
const BED_TYPE_LABELS = {
    single: 'Single',
    super_single: 'Super Single',
    double: 'Double',
    queen: 'Queen',
    king: 'King',
    bunk: 'Bunk',
    sofa_bed: 'Sofa Bed',
    floor_bedding: 'Floor Bedding',
};
export const bedTypeOptions = (arr) =>
    Array.isArray(arr) ? arr.map((v) => ({ id: v, name: BED_TYPE_LABELS[v] ?? v })) : [];

// Deep-convert JS booleans to 1/0 so Laravel's `boolean` rule accepts them under
// multipart (FormData) submissions. File/Blob instances are preserved untouched so
// Inertia's file detection keeps working.
export const boolsToInts = (val) => {
    if (val === null || val === undefined) return val;
    if (typeof val === 'boolean') return val ? 1 : 0;
    if (typeof File !== 'undefined' && val instanceof File) return val;
    if (typeof Blob !== 'undefined' && val instanceof Blob) return val;
    if (Array.isArray(val)) return val.map(boolsToInts);
    if (typeof val === 'object') {
        const out = {};
        for (const key in val) out[key] = boolsToInts(val[key]);
        return out;
    }
    return val;
};

export const blankRatePlan = () => ({
    name: '',
    original_price: '',
    sale_price: '',
    discount_rate: '',
    member_price: '',
    crypto_supported: true,
    payment_methods: [],
    is_cancellable: true,
    is_non_refundable: false,
    breakfast_included: false,
    free_parking_included: false,
    early_checkin_included: false,
    late_checkout_included: false,
    consecutive_nights_allowed: true,
    remaining_room_count: '',
    is_bookable: true,
    is_active: true,
});

export const blankRoom = () => ({
    room_name: '',
    room_type: '',
    standard_guests: 1,
    max_guests: 1,
    bedrooms_count: '',
    beds_count: '',
    bed_types: [],
    bed_size: '',
    bathrooms_count: '',
    toilets_count: '',
    is_bathroom_private: false,
    has_jacuzzi: false,
    has_bathtub: false,
    has_shower_booth: false,
    view_type: '',
    room_size: '',
    room_floor_label: '',
    is_smoking_allowed: false,
    children_allowed: true,
    pets_allowed: false,
    is_random_assignment: false,
    remaining_room_count: '',
    is_available: true,
    amenity_ids: [],
    rate_plans: [],
});

export const defaultCheckinPolicy = () => ({
    checkin_time: '',
    checkout_time: '',
    early_checkin_available: false,
    early_checkin_fee: '',
    late_checkout_available: false,
    late_checkout_fee: '',
    checkin_method: '',
    instructions_sent_when: '',
    same_day_booking_notice: '',
    early_entry_penalty: '',
    late_checkout_penalty: '',
    id_verification_required: false,
    minor_policy: '',
    mixed_gender_policy: '',
    noise_party_restriction: '',
    checkin_instruction_message: '',
});

export const defaultParkingPolicy = () => ({
    parking_available: false,
    parking_free: false,
    spaces_per_room: '',
    parking_type: '',
    pre_registration_required: false,
    parking_availability_time: '',
    before_checkin_after_checkout: '',
    full_lot_policy: '',
    nearby_parking_available: false,
    fee_paid_by_guest: false,
    vehicle_height_limit: '',
    large_vehicle_restrictions: '',
    ev_charging_available: false,
    refund_if_no_parking: false,
    extra_parking_fee: '',
});

export const defaultCancellationPolicy = () => ({
    policy_name: '',
    free_cancellation_deadline: '',
    refund_schedule: [],
    no_show_policy: '',
    rejection_refund_policy: '',
    non_refundable_reasons: '',
    requires_admin_confirmation: true,
    service_fee: '',
    service_fee_online: false,
    cleaning_fee: '',
    cleaning_fee_online: false,
    tax_amount: '',
    tax_online: false,
    extra_guest_fee: '',
    child_fee: '',
    pet_fee: '',
    extension_fee: '',
    security_deposit: '',
    onsite_payment_amount: '',
    damage_fee: '',
    minibar_incidental_fee: '',
    onsite_tax: '',
    damage_policy: '',
});

// Merge a possibly-partial persisted policy onto the defaults (edit mode).
export const mergePolicy = (defaults, existing) => {
    const base = defaults();
    if (!existing || typeof existing !== 'object') return base;
    const out = { ...base };
    for (const key in base) {
        if (existing[key] !== undefined && existing[key] !== null) {
            out[key] = existing[key];
        }
    }
    return out;
};

// Small accessible toggle that mirrors the dashboard's switch styling.
export function ToggleField({ label, checked, onChange, id, hint, disabled = false }) {
    return (
        <div className="flex items-center justify-between gap-3 py-2">
            <div>
                <span className="text-sm font-medium text-main-text-light dark:text-main-text-dark">
                    {label}
                </span>
                {hint && <p className="text-xs text-gray-400">{hint}</p>}
            </div>
            <label
                htmlFor={id}
                className={`inline-flex items-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <input
                    id={id}
                    type="checkbox"
                    className="peer sr-only"
                    checked={!!checked}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <div
                    className={`peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-green-500 ${disabled ? 'opacity-70' : ''}`}
                ></div>
            </label>
        </div>
    );
}

// Lightweight collapsible section used for the policy accordions.
export function Accordion({ title, subtitle, open, onToggle, children }) {
    return (
        <div className="mb-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
                <span>
                    <span className="text-base font-semibold text-main-text-light dark:text-main-text-dark">
                        {title}
                    </span>
                    {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
                </span>
                <svg
                    className={`size-5 text-gray-500 transition-transform dark:text-gray-300 ${open ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M4.79175 7.39584L10.0001 12.6042L15.2084 7.39585"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
            {open && <div className="border-t border-gray-200 p-4 dark:border-gray-700">{children}</div>}
        </div>
    );
}
