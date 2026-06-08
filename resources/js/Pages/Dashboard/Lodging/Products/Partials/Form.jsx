import { Head, useForm } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
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
    tag: '',
    content: '',
    base_checkin_time: '',
    base_checkout_time: '',
    from_price: '',
    is_active: true,
    is_reservation_closed: false,
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

export default function Form({
    mode = 'create',
    floors = [],
    amenities = [],
    dashboard_users = [],
    enums = {},
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

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            post(route('dashboard.lodging-products.update', lodging_product.id));
        } else {
            post(route('dashboard.lodging-products.store'));
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
                        <div className="my-3 flex flex-wrap justify-end">
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
                                            <SelectInput
                                                InputName={'Floor'}
                                                Id={'floor_id'}
                                                Name={'floor_id'}
                                                items={floors}
                                                itemKey={'name'}
                                                Value={data.floor_id}
                                                Error={errors.floor_id}
                                                Action={(value) => setData('floor_id', value)}
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

                                        <div className="mt-2 grid grid-cols-1 gap-x-6 md:grid-cols-2">
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

                                        <div className="mt-4 grid grid-cols-1 gap-4">
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

                                        {/* Product amenities */}
                                        <div className="mt-6">
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

                                        <RoomsRepeater
                                            data={data}
                                            setData={setData}
                                            errors={errors}
                                            enums={enums}
                                            amenities={amenities}
                                        />

                                        <PolicySections
                                            data={data}
                                            setData={setData}
                                            errors={errors}
                                            enums={enums}
                                        />

                                        <MediaSection
                                            mode={mode}
                                            data={data}
                                            setData={setData}
                                            errors={errors}
                                            existingMedia={lodging_product?.media ?? []}
                                        />

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
                            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
                                <div className="fixed inset-0 backdrop-blur-[32px]"></div>
                                <div className="relative z-10 max-h-screen w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-deepcharcoal sm:p-8">
                                    <div className="text-center">
                                        <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                            Please Wait While We Are Uploading Your Files
                                        </h2>
                                        <div className="mt-5 flex items-center justify-center">
                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                                        </div>
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
