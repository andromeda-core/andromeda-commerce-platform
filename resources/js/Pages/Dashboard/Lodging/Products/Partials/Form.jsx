import { Head, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import Card from '@/Components/Card';
import Input from '@/Components/Input';
import SelectInput from '@/Components/SelectInput';
import Textarea from '@/Components/Textarea';
import PrimaryButton from '@/Components/PrimaryButton';
import LinkButton from '@/Components/LinkButton';
import Toast from '@/Components/Toast';
import RoomsRepeater from './RoomsRepeater';
import PolicySections from './PolicySections';
import MediaSection from './MediaSection';
import LocationDetector from './LocationDetector';
import TranslationsRepeater from '@/Components/TranslationsRepeater';
import {
    toOptions,
    boolsToInts,
    blankRoom,
    blankRatePlan,
    defaultCheckinPolicy,
    defaultParkingPolicy,
    defaultCancellationPolicy,
    mergePolicy,
    ToggleField,
    productTranslatableFields,
} from './helpers';

const productDefaults = () => ({
    property_name: '',
    property_type: '',
    city_region: '',
    location_description: '',
    latitude: '',
    longitude: '',
    location_name: '',
    floor_id: '',
    floor_start_id: '',
    floor_end_id: '',
    tag: '',
    content: '',
    base_checkin_time: '',
    base_checkout_time: '',
    from_price: '',
    is_active: true,
    is_reservation_closed: false,
    created_at: '',
    // Stage 3.4.2 — product-level content translations ([{language_id, fields:{}}]); not a DB column.
    translations: [],
});

// Copy only the template's keys from src (so persisted relation/system columns never leak
// into the submitted payload). Falls back to the template default for null/undefined.
const pickKeys = (src, template) => {
    const out = {};
    for (const key in template) {
        const value = src ? src[key] : undefined;
        out[key] = value === undefined || value === null ? template[key] : value;
    }
    return out;
};

const buildRatePlan = (rp) => ({
    ...pickKeys(rp, blankRatePlan()),
    id: rp?.id,
    payment_methods: rp?.payment_methods ?? [],
});

const buildRoom = (room) => ({
    ...pickKeys(room, blankRoom()),
    id: room?.id,
    amenity_ids: room?.amenity_ids ?? [],
    rate_plans: (room?.rate_plans ?? []).map(buildRatePlan),
});

const buildInitialData = (mode, product) => {
    if (mode === 'edit') {
        return {
            _method: 'put',
            ...pickKeys(product, productDefaults()),
            // datetime-local needs `YYYY-MM-DDTHH:MM` (16 chars), not the full ISO timestamp.
            created_at: product?.created_at ? product.created_at.slice(0, 16) : '',
            amenity_ids: product?.amenity_ids ?? [],
            rooms: (product?.rooms ?? []).map(buildRoom),
            checkin_policy: mergePolicy(defaultCheckinPolicy, product?.checkin_policy),
            parking_policy: mergePolicy(defaultParkingPolicy, product?.parking_policy),
            cancellation_policy: mergePolicy(defaultCancellationPolicy, product?.cancellation_policy),
            new_images: [],
            new_videos: [],
            deleted_media_ids: [],
        };
    }

    return {
        ...productDefaults(),
        amenity_ids: [],
        rooms: [],
        checkin_policy: defaultCheckinPolicy(),
        parking_policy: defaultParkingPolicy(),
        cancellation_policy: defaultCancellationPolicy(),
        images: [],
        videos: [],
    };
};

// ---- Validation-error popup helpers (admin/dashboard surface → plain English; NOT routed
// through the translation system). A failed submit returns Inertia's flat `errors` object:
// nested field errors keyed by dotted paths (e.g. `rooms.0.rate_plans.0.consecutive_nights_allowed`)
// plus a few special top-level keys (`translation_error` / `file_error` / `video_error`). We
// surface EVERY one of them in a single popup so no validation error can be silently swallowed,
// turning each raw key into a human location + a clean sentence (the dotted key is never shown).

const titleCaseSegment = (seg) =>
    String(seg)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

const SPECIAL_ERROR_LOCATIONS = {
    translation_error: 'Translations',
    file_error: 'Images',
    video_error: 'Videos',
};

const POLICY_ERROR_LABELS = {
    checkin_policy: 'Check-in Policy',
    parking_policy: 'Parking Policy',
    cancellation_policy: 'Cancellation Policy',
};

// Derive a human "location" (which room / rate plan / policy / section) and "field" name
// from a dotted error key, so the popup can read like "Room 1 · Rate plan 2: ...".
const describeErrorKey = (key) => {
    if (SPECIAL_ERROR_LOCATIONS[key]) {
        return { location: SPECIAL_ERROR_LOCATIONS[key], field: '' };
    }
    const seg = key.split('.');
    // rooms.{i}.rate_plans.{j}.{field...}
    if (seg[0] === 'rooms' && seg[2] === 'rate_plans' && seg.length >= 5) {
        return {
            location: `Room ${Number(seg[1]) + 1} · Rate plan ${Number(seg[3]) + 1}`,
            field: titleCaseSegment(seg.slice(4).join('_')),
        };
    }
    // rooms.{i}.{field...}
    if (seg[0] === 'rooms' && !Number.isNaN(Number(seg[1])) && seg.length >= 3) {
        return {
            location: `Room ${Number(seg[1]) + 1}`,
            field: titleCaseSegment(seg.slice(2).join('_')),
        };
    }
    // {policy}.{field}
    if (POLICY_ERROR_LABELS[seg[0]] && seg.length >= 2) {
        return {
            location: POLICY_ERROR_LABELS[seg[0]],
            field: titleCaseSegment(seg.slice(1).join('_')),
        };
    }
    // plain top-level field
    return { location: '', field: titleCaseSegment(key) };
};

// Laravel's default messages embed the raw attribute (e.g. "The rooms.0.room name field is
// required."). Strip that leaked dotted attribute so the operator never sees a raw key.
const cleanErrorMessage = (key, message, field) => {
    if (!message) return message;
    const displayable = key.replace(/_/g, ' '); // Laravel :attribute default form (dots kept)
    const human = (field || titleCaseSegment(key.split('.').pop())).toLowerCase();
    return String(message).split(displayable).join(human).split(key).join(human);
};

// Build the deduped, human-readable list of messages shown in the error popup.
const buildErrorMessages = (errors) => {
    const lines = [];
    const seen = new Set();
    for (const key in errors) {
        const raw = errors[key];
        const message = Array.isArray(raw) ? raw[0] : raw;
        if (!message) continue;
        const { location, field } = describeErrorKey(key);
        const cleaned = cleanErrorMessage(key, message, field);
        const line = location ? `${location}: ${cleaned}` : cleaned;
        if (seen.has(line)) continue;
        seen.add(line);
        lines.push(line);
    }
    return lines;
};

export default function Form({
    mode = 'create',
    from_floors = [],
    to_floors = [],
    amenities = [],
    dashboard_users = [],
    enums = {},
    languages = [],
    lodging_product = null,
    googleMapSettings = null,
}) {
    const isEdit = mode === 'edit';

    const { data, setData, post, processing, errors, transform } = useForm(
        buildInitialData(mode, lodging_product),
    );

    // Booleans -> 1/0 (Laravel `boolean` rule under multipart); File objects preserved.
    transform((payload) => boolsToInts(payload));

    // Base check-in / check-out time fields use the project's existing Flatpickr in
    // time-only mode (24h, HH:MM) so the stored string format is unchanged.
    const checkinTimeRef = useRef(null);
    const checkoutTimeRef = useRef(null);

    useEffect(() => {
        const timeOptions = {
            enableTime: true,
            noCalendar: true,
            dateFormat: 'H:i',
            time_24hr: true,
            disableMobile: true,
        };

        const checkinPicker = checkinTimeRef.current
            ? flatpickr(checkinTimeRef.current, {
                  ...timeOptions,
                  defaultDate: data.base_checkin_time || null,
                  onChange: (selectedDates, dateStr) => setData('base_checkin_time', dateStr),
              })
            : null;

        const checkoutPicker = checkoutTimeRef.current
            ? flatpickr(checkoutTimeRef.current, {
                  ...timeOptions,
                  defaultDate: data.base_checkout_time || null,
                  onChange: (selectedDates, dateStr) => setData('base_checkout_time', dateStr),
              })
            : null;

        return () => {
            checkinPicker?.destroy();
            checkoutPicker?.destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Single form organized into tabs (panels stay mounted via `hidden` so flatpickr,
    // refs and validation errors survive tab switches). Modular for a future split.
    const TABS = [
        { key: 'property', label: 'Property' },
        { key: 'rooms', label: 'Rooms' },
        { key: 'rate_plans', label: 'Rate Plans' },
        { key: 'amenities', label: 'Amenities' },
        { key: 'policies', label: 'Policies' },
        { key: 'media', label: 'Media' },
        { key: 'msap', label: 'MSAP / Future' },
    ];
    const [activeTab, setActiveTab] = useState('property');
    const [submitAttempted, setSubmitAttempted] = useState(false);

    // Every validation error (special top-level keys + nested rate-plan/room field keys) is
    // collected here so the popup below can guarantee nothing is silently swallowed.
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const errorMessages = buildErrorMessages(errors);

    // Frontend required UX (backend unchanged): at least one room, and at least one
    // rate plan per room.
    const noRooms = (data.rooms?.length ?? 0) === 0;
    const roomsMissingPlans = (data.rooms ?? []).some((r) => (r.rate_plans?.length ?? 0) === 0);

    const submit = (e) => {
        e.preventDefault();
        setSubmitAttempted(true);
        if (noRooms) {
            setActiveTab('rooms');
            return;
        }
        if (roomsMissingPlans) {
            setActiveTab('rate_plans');
            return;
        }
        // Open the all-errors popup whenever the backend returns validation errors, so nested
        // keys (e.g. the consecutive-nights rule on a toggle with no input slot) can't hide.
        const options = {
            onError: (errs) => {
                if (errs && Object.keys(errs).length) setErrorModalOpen(true);
            },
        };
        if (isEdit) {
            post(route('dashboard.lodging-products.update', lodging_product.id), options);
        } else {
            post(route('dashboard.lodging-products.store'), options);
        }
    };

    const hasNewFiles =
        (data.images?.length ?? 0) > 0 ||
        (data.videos?.length ?? 0) > 0 ||
        (data.new_images?.length ?? 0) > 0 ||
        (data.new_videos?.length ?? 0) > 0;

    const showProgressModal = processing && hasNewFiles;

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? 'Edit Lodging Product' : 'Create Lodging Product'} />

            <BreadCrumb
                header={isEdit ? 'Edit Lodging Product' : 'Create Lodging Product'}
                parent={'Lodging Products'}
                parent_link={route('dashboard.lodging-products.index')}
                child={isEdit ? 'Edit Lodging Product' : 'Create Lodging Product'}
            />

            {errors.file_error && <Toast flash={{ info: errors.file_error }} />}
            {errors.video_error && <Toast flash={{ info: errors.video_error }} />}

            <Card
                Content={
                    <>
                        <div className="flex flex-wrap justify-end my-3">
                            <LinkButton
                                Text={'Back To Lodging Products'}
                                URL={route('dashboard.lodging-products.index')}
                                Icon={
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="size-6"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                                        />
                                    </svg>
                                }
                            />
                        </div>

                        <form onSubmit={submit}>
                            <Card
                                Content={
                                    <>
                                        {/* Tab navigation */}
                                        <div className="flex flex-wrap gap-6 mb-6 overflow-auto border-b border-gray-200 dark:border-gray-700">
                                            {TABS.map((t) => {
                                                const isActive = activeTab === t.key;
                                                return (
                                                    <button
                                                        key={t.key}
                                                        type="button"
                                                        onClick={() => setActiveTab(t.key)}
                                                        aria-current={isActive ? 'page' : undefined}
                                                        className={`relative -mb-px border-b-2 pb-3 text-sm font-semibold transition-colors duration-200 ${
                                                            isActive
                                                                ? 'border-black text-black dark:border-white dark:text-white'
                                                                : 'border-transparent text-gray-600 hover:border-black hover:text-black dark:text-white/60 dark:hover:border-white dark:hover:text-white'
                                                        }`}
                                                    >
                                                        {t.label}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Property */}
                                        <div className={activeTab === 'property' ? '' : 'hidden'}>
                                        {/* Property details */}
                                        <h3 className="mb-3 text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                            Property Details
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <Input
                                                InputName={'Property Name'}
                                                Id={'property_name'}
                                                Name={'property_name'}
                                                Type={'text'}
                                                Required={true}
                                                Value={data.property_name}
                                                Error={errors.property_name}
                                                Action={(e) => setData('property_name', e.target.value)}
                                            />
                                            <SelectInput
                                                InputName={'Property Type'}
                                                Id={'property_type'}
                                                Name={'property_type'}
                                                Required={true}
                                                items={toOptions(enums.property_type)}
                                                itemKey={'name'}
                                                Value={data.property_type}
                                                Error={errors.property_type}
                                                Action={(value) => setData('property_type', value)}
                                            />
                                            <Input
                                                InputName={'City / Region'}
                                                Id={'city_region'}
                                                Name={'city_region'}
                                                Type={'text'}
                                                Value={data.city_region}
                                                Error={errors.city_region}
                                                Action={(e) => setData('city_region', e.target.value)}
                                            />
                                            {/* Optional floor RANGE (e.g. "1F - 3F"). Both or neither;
                                                the end must be at/above the start. The operator only
                                                fills Start + End — the spatiotemporal ANCHOR (floor_id)
                                                is derived server-side from Floor Range Start, so the
                                                "Floor (anchor)" input is intentionally NOT shown here. */}
                                            <SelectInput
                                                InputName={'Floor Range Start (optional)'}
                                                Id={'floor_start_id'}
                                                Name={'floor_start_id'}
                                                items={from_floors}
                                                itemKey={'name'}
                                                Value={data.floor_start_id}
                                                Error={errors.floor_start_id}
                                                Action={(value) => setData('floor_start_id', value)}
                                            />
                                            <SelectInput
                                                InputName={'Floor Range End (optional)'}
                                                Id={'floor_end_id'}
                                                Name={'floor_end_id'}
                                                items={to_floors}
                                                itemKey={'name'}
                                                Value={data.floor_end_id}
                                                Error={errors.floor_end_id}
                                                Action={(value) => setData('floor_end_id', value)}
                                            />
                                            <LocationDetector
                                                data={data}
                                                setData={setData}
                                                errors={errors}
                                                googleMapSettings={googleMapSettings}
                                            />
                                            <Input
                                                InputName={'Tag'}
                                                Id={'tag'}
                                                Name={'tag'}
                                                Type={'text'}
                                                Value={data.tag}
                                                Error={errors.tag}
                                                Action={(e) => setData('tag', e.target.value)}
                                            />
                                            <Input
                                                InputName={'Custom Date & Time (Optional)'}
                                                Error={errors.created_at}
                                                Value={data.created_at}
                                                Action={(e) => setData('created_at', e.target.value)}
                                                Id={'created_at'}
                                                Name={'created_at'}
                                                Type={'datetime-local'}
                                                    ClassName={'picker-full-click'}

                                                Required={false}
                                            />



                                            <Input
                                                InputName={'Base Check-in Time'}
                                                Id={'base_checkin_time'}
                                                Name={'base_checkin_time'}
                                                Type={'text'}
                                                Placeholder={'e.g. 15:00'}
                                                Value={data.base_checkin_time}
                                                Error={errors.base_checkin_time}
                                                InputRef={checkinTimeRef}
                                                Action={(e) => setData('base_checkin_time', e.target.value)}
                                            />
                                            <Input
                                                InputName={'Base Check-out Time'}
                                                Id={'base_checkout_time'}
                                                Name={'base_checkout_time'}
                                                Type={'text'}
                                                Placeholder={'e.g. 11:00'}
                                                Value={data.base_checkout_time}
                                                Error={errors.base_checkout_time}
                                                InputRef={checkoutTimeRef}
                                                Action={(e) => setData('base_checkout_time', e.target.value)}
                                            />
                                            <Input
                                                InputName={'From Price'}
                                                Id={'from_price'}
                                                Name={'from_price'}
                                                Type={'number'}
                                                Value={data.from_price}
                                                Error={errors.from_price}
                                                Action={(e) => setData('from_price', e.target.value)}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 mt-2 gap-x-6 md:grid-cols-2">
                                            <ToggleField
                                                id={'is_active'}
                                                label={'Active'}
                                                checked={data.is_active}
                                                onChange={(v) => setData('is_active', v)}
                                            />
                                            <ToggleField
                                                id={'is_reservation_closed'}
                                                label={'Reservations Closed'}
                                                checked={data.is_reservation_closed}
                                                onChange={(v) => setData('is_reservation_closed', v)}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 mt-4">
                                            <Textarea
                                                InputName={'Location Description'}
                                                Id={'location_description'}
                                                Name={'location_description'}
                                                Value={data.location_description}
                                                Error={errors.location_description}
                                                Action={(e) => setData('location_description', e.target.value)}
                                            />
                                            <Textarea
                                                InputName={'Content'}
                                                Id={'content'}
                                                Name={'content'}
                                                Rows={10}
                                                Value={data.content}
                                                Error={errors.content}
                                                Action={(e) => setData('content', e.target.value)}
                                            />
                                        </div>

                                        {/* Per-language overrides for the product free-text fields above. */}
                                        <TranslationsRepeater
                                            value={data.translations}
                                            onChange={(next) => setData('translations', next)}
                                            languages={languages}
                                            fields={productTranslatableFields}
                                        />

                                        </div>

                                        {/* Rooms */}
                                        <div className={activeTab === 'rooms' ? '' : 'hidden'}>
                                            {submitAttempted && noRooms && (
                                                <p className="mb-3 text-sm text-red-500">
                                                    At least one room is required.
                                                </p>
                                            )}
                                            <RoomsRepeater
                                                section={'rooms'}
                                                data={data}
                                                setData={setData}
                                                errors={errors}
                                                enums={enums}
                                                amenities={amenities}
                                                languages={languages}
                                            />
                                        </div>

                                        {/* Rate Plans */}
                                        <div className={activeTab === 'rate_plans' ? '' : 'hidden'}>
                                            {submitAttempted && !noRooms && roomsMissingPlans && (
                                                <p className="mb-3 text-sm text-red-500">
                                                    Each room must have at least one rate plan.
                                                </p>
                                            )}
                                            <RoomsRepeater
                                                section={'rate_plans'}
                                                data={data}
                                                setData={setData}
                                                errors={errors}
                                                enums={enums}
                                                amenities={amenities}
                                                languages={languages}
                                            />
                                        </div>

                                        {/* Amenities */}
                                        <div className={activeTab === 'amenities' ? '' : 'hidden'}>
                                            <h3 className="mb-3 text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                                Property Amenities
                                            </h3>
                                            <SelectInput
                                                InputName={'Property Amenities'}
                                                Id={'amenity_ids'}
                                                Name={'amenity_ids'}
                                                Multiple={true}
                                                items={amenities}
                                                itemKey={'name'}
                                                Value={data.amenity_ids}
                                                Error={errors.amenity_ids}
                                                Action={(value) => setData('amenity_ids', value)}
                                            />
                                        </div>

                                        {/* Policies */}
                                        <div className={activeTab === 'policies' ? '' : 'hidden'}>
                                            <PolicySections
                                                data={data}
                                                setData={setData}
                                                errors={errors}
                                                enums={enums}
                                                languages={languages}
                                            />
                                        </div>

                                        {/* Media */}
                                        <div className={activeTab === 'media' ? '' : 'hidden'}>
                                            <MediaSection
                                                mode={mode}
                                                data={data}
                                                setData={setData}
                                                errors={errors}
                                                existingMedia={lodging_product?.media ?? []}
                                            />
                                        </div>

                                        {/* MSAP / Future Integration */}
                                        <div className={activeTab === 'msap' ? '' : 'hidden'}>
                                            <h3 className="mb-3 text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                                                MSAP / Future Integration
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                These fields are reserved for future MSAP / external booking
                                                integration and are managed by the system. No manual input is
                                                required at launch.
                                            </p>
                                            {isEdit && (
                                                <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                                                    <div className="p-3 text-sm border border-gray-200 rounded-lg dark:border-gray-700">
                                                        <span className="block text-xs text-gray-400">Booking Source</span>
                                                        <span className="text-main-text-light dark:text-main-text-dark">
                                                            {lodging_product?.booking_source ?? 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="p-3 text-sm border border-gray-200 rounded-lg dark:border-gray-700">
                                                        <span className="block text-xs text-gray-400">Source Of Truth</span>
                                                        <span className="text-main-text-light dark:text-main-text-dark">
                                                            {lodging_product?.source_of_truth ?? 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="p-3 text-sm border border-gray-200 rounded-lg dark:border-gray-700">
                                                        <span className="block text-xs text-gray-400">Sync Status</span>
                                                        <span className="text-main-text-light dark:text-main-text-dark">
                                                            {lodging_product?.sync_status ?? 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="p-3 text-sm border border-gray-200 rounded-lg dark:border-gray-700">
                                                        <span className="block text-xs text-gray-400">MSAP Ready</span>
                                                        <span className="text-main-text-light dark:text-main-text-dark">
                                                            {lodging_product?.msap_ready ? 'Yes' : 'No'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-8">
                                            <PrimaryButton
                                                Text={isEdit ? 'Update Lodging Product' : 'Create Lodging Product'}
                                                Type={'submit'}
                                                CustomClass={'w-[260px]'}
                                                Spinner={processing}
                                                Disabled={
                                                    processing ||
                                                    data.property_name.trim() === '' ||
                                                    data.property_type === ''
                                                }
                                                Icon={
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="size-6"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M12 4.5v15m7.5-7.5h-15"
                                                        />
                                                    </svg>
                                                }
                                            />
                                        </div>
                                    </>
                                }
                            />
                        </form>

                        {showProgressModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                                <div className="fixed inset-0 backdrop-blur-[32px]"></div>
                                <div className="relative z-10 w-full max-w-lg max-h-screen p-6 overflow-y-auto bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal sm:p-8">
                                    <div className="text-center">
                                        <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                            Please Wait While We Are Uploading Your Files
                                        </h2>
                                        <div className="flex items-center justify-center mt-5">
                                            <div className="w-8 h-8 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* All-errors popup: lists EVERY validation error returned by the backend
                            (special top-level keys + nested room/rate-plan field keys) so none can
                            be silently swallowed — including the consecutive-nights rule attached to
                            a toggle that has no input-bottom message slot. */}
                        {errorModalOpen && errorMessages.length > 0 && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                                <div
                                    className="fixed inset-0 backdrop-blur-[32px]"
                                    onClick={() => setErrorModalOpen(false)}
                                ></div>
                                <div className="relative z-10 w-full max-w-lg max-h-screen p-6 overflow-y-auto bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal sm:p-8">
                                    <div className="flex items-start justify-between gap-4">
                                        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
                                            {errorMessages.length === 1
                                                ? 'Please fix the following error'
                                                : `Please fix the following ${errorMessages.length} errors`}
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={() => setErrorModalOpen(false)}
                                            aria-label="Close"
                                            className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="size-6"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M6 18 18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                    <ul className="mt-4 max-h-[60vh] space-y-2 overflow-y-auto pl-5 text-sm list-disc text-main-text-light dark:text-main-text-dark">
                                        {errorMessages.map((msg, i) => (
                                            <li key={i}>{msg}</li>
                                        ))}
                                    </ul>
                                    <div className="flex justify-end mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setErrorModalOpen(false)}
                                            className="rounded-md bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                }
            />
        </AuthenticatedLayout>
    );
}
