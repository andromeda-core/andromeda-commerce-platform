import React, { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import Input from '@/Components/Input';

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

// Generic snake_case -> Title Case for option labels (stored value stays the raw key).
const titleize = (v) =>
    String(v)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
export const stayTypeOptions = (arr) =>
    Array.isArray(arr) ? arr.map((v) => ({ id: v, name: titleize(v) })) : [];

// Reusable flatpickr time-only picker (same options as the base check-in/out fields).
// Designed for dynamic, tab-hidden repeated rows: one flatpickr instance per mounted
// row, destroyed on unmount. The instance is created once but always calls the LATEST
// onChange (via a ref) so a stale closure can never write the wrong row, and it resyncs
// when the Value prop changes externally (e.g. an index-keyed row is reused on remove).
export function FlatpickrTimeInput({ InputName, Id, Name, Value, Error, onChange, Placeholder, Required = false }) {
    const inputRef = useRef(null);
    const fpRef = useRef(null);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    useEffect(() => {
        fpRef.current = flatpickr(inputRef.current, {
            enableTime: true,
            noCalendar: true,
            dateFormat: 'H:i',
            time_24hr: true,
            disableMobile: true,
            defaultDate: Value || null,
            onChange: (selectedDates, dateStr) => onChangeRef.current(dateStr),
        });
        return () => {
            fpRef.current?.destroy();
            fpRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Keep the picker in sync if the value changes from outside (row reuse / reset).
    useEffect(() => {
        const fp = fpRef.current;
        if (fp && (Value || '') !== (fp.input?.value || '')) {
            fp.setDate(Value || null, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [Value]);

    return (
        <Input
            InputName={InputName}
            Id={Id}
            Name={Name}
            Type={'text'}
            Required={Required}
            Placeholder={Placeholder}
            Value={Value}
            Error={Error}
            InputRef={inputRef}
            Action={() => {}}
        />
    );
}

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
    stay_type: '',
    minimum_nights: '',
    maximum_nights: '',
    booking_cutoff_time: '',
    same_day_booking_allowed: true,
    // Stage 3.4.2 — per-record content translations ([{language_id, fields:{}}]); not a DB column.
    translations: [],
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
    // Custom view text; only used/shown when view_type === 'other'.
    view_type_other: '',
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
    // Stage 3.4.2 — per-record content translations ([{language_id, fields:{}}]); not a DB column.
    translations: [],
});

export const defaultCheckinPolicy = () => ({
    checkin_time: '',
    checkout_time: '',
    early_checkin_available: false,
    early_checkin_fee: '',
    // Optional free-text override shown to the guest instead of the numeric fee (display-only).
    early_checkin_fee_display_text: '',
    late_checkout_available: false,
    late_checkout_fee: '',
    late_checkout_fee_display_text: '',
    checkin_method: '',
    front_desk_available: false,
    self_checkin_available: false,
    contactless_checkin_available: false,
    host_meet_checkin_available: false,
    instructions_sent_when: '',
    same_day_booking_notice: '',
    early_entry_penalty: '',
    late_checkout_penalty: '',
    id_verification_required: false,
    minor_policy: '',
    mixed_gender_policy: '',
    noise_party_restriction: '',
    party_policy: '',
    checkin_instruction_message: '',
    // Stage 3.4.2 — per-record content translations ([{language_id, fields:{}}]); not a DB column.
    translations: [],
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
    modified_vehicle_restriction: '',
    supercar_restriction: '',
    ev_charging_available: false,
    refund_if_no_parking: false,
    extra_parking_fee: '',
    // Optional free-text override shown to the guest instead of the numeric fee (display-only).
    extra_parking_fee_display_text: '',
    // Stage 3.4.2 — per-record content translations ([{language_id, fields:{}}]); not a DB column.
    translations: [],
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
    // Optional free-text overrides shown to the guest instead of the numeric on-site fee (display-only).
    extra_guest_fee_display_text: '',
    child_fee: '',
    child_fee_display_text: '',
    pet_fee: '',
    pet_fee_display_text: '',
    extension_fee: '',
    extension_fee_display_text: '',
    security_deposit: '',
    security_deposit_display_text: '',
    onsite_payment_amount: '',
    onsite_payment_amount_display_text: '',
    damage_fee: '',
    damage_fee_display_text: '',
    minibar_incidental_fee: '',
    minibar_incidental_fee_display_text: '',
    onsite_tax: '',
    onsite_tax_display_text: '',
    damage_policy: '',
    // Stage 3.4.2 — per-record content translations ([{language_id, fields:{}}]); not a DB column.
    translations: [],
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

// Stage 3.4.2 — TranslationsRepeater `fields` config per record type. The `key`s MUST match the
// backend $translatableFields (3.4.1) exactly; `content` uses textarea to mirror its English
// authoring input (a plain Textarea), keeping markup consistent across languages.
export const productTranslatableFields = [
    { key: 'property_name', label: 'Property Name', type: 'text' },
    { key: 'city_region', label: 'City / Region', type: 'text' },
    { key: 'location_name', label: 'Location Name', type: 'text' },
    { key: 'location_description', label: 'Location Description', type: 'textarea' },
    { key: 'content', label: 'Content', type: 'textarea' },
    { key: 'tag', label: 'Tag', type: 'text' },
];

export const roomTranslatableFields = [
    { key: 'room_name', label: 'Room Name', type: 'text' },
    { key: 'room_floor_label', label: 'Room Floor Label', type: 'text' },
    { key: 'bed_size', label: 'Bed Size', type: 'text' },
    { key: 'view_type_other', label: 'Custom View Type', type: 'text' },
];

export const ratePlanTranslatableFields = [
    { key: 'name', label: 'Rate Plan Name', type: 'text' },
];

export const checkinPolicyTranslatableFields = [
    { key: 'instructions_sent_when', label: 'Instructions Sent When', type: 'text' },
    { key: 'early_checkin_fee_display_text', label: 'Early Check-in Fee (Display Text)', type: 'text' },
    { key: 'late_checkout_fee_display_text', label: 'Late Check-out Fee (Display Text)', type: 'text' },
    { key: 'same_day_booking_notice', label: 'Same Day Booking Notice', type: 'textarea' },
    { key: 'early_entry_penalty', label: 'Early Entry Penalty', type: 'textarea' },
    { key: 'late_checkout_penalty', label: 'Late Check-out Penalty', type: 'textarea' },
    { key: 'minor_policy', label: 'Minor Policy', type: 'textarea' },
    { key: 'mixed_gender_policy', label: 'Mixed Gender Policy', type: 'textarea' },
    { key: 'noise_party_restriction', label: 'Noise Policy', type: 'textarea' },
    { key: 'party_policy', label: 'Party Policy', type: 'textarea' },
    { key: 'checkin_instruction_message', label: 'Check-in Instruction Message', type: 'textarea' },
];

export const cancellationPolicyTranslatableFields = [
    { key: 'free_cancellation_deadline', label: 'Free Cancellation Deadline', type: 'text' },
    { key: 'extra_guest_fee_display_text', label: 'Extra Guest Fee (Display Text)', type: 'text' },
    { key: 'child_fee_display_text', label: 'Child Fee (Display Text)', type: 'text' },
    { key: 'pet_fee_display_text', label: 'Pet Fee (Display Text)', type: 'text' },
    { key: 'extension_fee_display_text', label: 'Extension Fee (Display Text)', type: 'text' },
    { key: 'security_deposit_display_text', label: 'Security Deposit (Display Text)', type: 'text' },
    { key: 'onsite_payment_amount_display_text', label: 'On-site Payment Amount (Display Text)', type: 'text' },
    { key: 'damage_fee_display_text', label: 'Damage Fee (Display Text)', type: 'text' },
    { key: 'minibar_incidental_fee_display_text', label: 'Minibar / Incidental Fee (Display Text)', type: 'text' },
    { key: 'onsite_tax_display_text', label: 'On-site Tax (Display Text)', type: 'text' },
    { key: 'no_show_policy', label: 'No-show Policy', type: 'textarea' },
    { key: 'rejection_refund_policy', label: 'Rejection Refund Policy', type: 'textarea' },
    { key: 'non_refundable_reasons', label: 'Non-refundable Reasons', type: 'textarea' },
    { key: 'damage_policy', label: 'Damage Policy', type: 'textarea' },
];

export const parkingPolicyTranslatableFields = [
    { key: 'parking_availability_time', label: 'Parking Availability Time', type: 'text' },
    { key: 'extra_parking_fee_display_text', label: 'Extra Parking Fee (Display Text)', type: 'text' },
    { key: 'before_checkin_after_checkout', label: 'Before Check-in / After Check-out', type: 'textarea' },
    { key: 'full_lot_policy', label: 'Full Lot Policy', type: 'textarea' },
    { key: 'large_vehicle_restrictions', label: 'Large Vehicle Restriction', type: 'textarea' },
    { key: 'modified_vehicle_restriction', label: 'Modified Vehicle Restriction', type: 'textarea' },
    { key: 'supercar_restriction', label: 'Supercar Restriction', type: 'textarea' },
];
