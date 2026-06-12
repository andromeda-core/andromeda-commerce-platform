import { useEffect } from 'react';
import Input from '@/Components/Input';
import SelectInput from '@/Components/SelectInput';
import PrimaryButton from '@/Components/PrimaryButton';
import TranslationsRepeater from '@/Components/TranslationsRepeater';
import { blankRoom, blankRatePlan, toOptions, bedTypeOptions, stayTypeOptions, ToggleField, FlatpickrTimeInput, roomTranslatableFields, ratePlanTranslatableFields } from './helpers';

// Sale price is derived from original price and discount rate (display only — the
// backend sale_price column is unchanged). Empty original -> '' (field stays blank);
// empty/0 discount -> original; never negative; rounded to 2 decimals.
const computeSalePrice = (original, discount) => {
    const o = parseFloat(original);
    if (Number.isNaN(o)) return '';
    const d = parseFloat(discount);
    const rate = Number.isNaN(d) ? 0 : d;
    const sale = o - (o * rate) / 100;
    return Math.round((sale < 0 ? 0 : sale) * 100) / 100;
};

// Display-only comma formatting for the read-only auto Sale Price field (1000 -> 1,000.00).
// The submitted sale_price comes from the rate-plan state set on price/discount change, never
// from this field's text — so formatting here changes nothing that is stored or calculated.
const formatSalePriceDisplay = (original, discount) => {
    const sale = computeSalePrice(original, discount);
    if (sale === '' || sale === null || sale === undefined) return '';
    return Number(sale).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

// `section` controls which half renders so Rooms and Rate Plans can live in separate
// tabs while staying nested in the same data.rooms state (modular for a future split,
// no DB change). 'rooms' = room fields only, 'rate_plans' = the per-room rate-plan
// editors only, 'all' = both (default — backward compatible).
export default function RoomsRepeater({ data, setData, errors, enums, amenities, languages = [], section = 'all' }) {
    const rooms = data.rooms ?? [];
    const showRooms = section === 'all' || section === 'rooms';
    const showRatePlans = section === 'all' || section === 'rate_plans';

    // Crypto Supported is locked on for launch (NOWPayments crypto only). Force every
    // loaded rate plan's crypto_supported to true on mount so the payload always sends
    // true, regardless of any stored value on edit. New plans already default to true.
    useEffect(() => {
        let changed = false;
        const normalized = rooms.map((room) => {
            const plans = room.rate_plans ?? [];
            let roomChanged = false;
            const newPlans = plans.map((plan) => {
                if (plan.crypto_supported !== true) {
                    roomChanged = true;
                    return { ...plan, crypto_supported: true };
                }
                return plan;
            });
            if (roomChanged) {
                changed = true;
                return { ...room, rate_plans: newPlans };
            }
            return room;
        });
        if (changed) setData('rooms', normalized);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addRoom = () => setData('rooms', [...rooms, blankRoom()]);

    const removeRoom = (index) =>
        setData('rooms', rooms.filter((_, i) => i !== index));

    const updateRoom = (index, field, value) =>
        setData('rooms', rooms.map((room, i) => (i === index ? { ...room, [field]: value } : room)));

    const addRatePlan = (roomIndex) =>
        setData('rooms', rooms.map((room, i) =>
            i === roomIndex ? { ...room, rate_plans: [...(room.rate_plans ?? []), blankRatePlan()] } : room,
        ));

    const removeRatePlan = (roomIndex, planIndex) =>
        setData('rooms', rooms.map((room, i) =>
            i === roomIndex
                ? { ...room, rate_plans: (room.rate_plans ?? []).filter((_, j) => j !== planIndex) }
                : room,
        ));

    const updateRatePlan = (roomIndex, planIndex, field, value) =>
        setData('rooms', rooms.map((room, i) =>
            i === roomIndex
                ? {
                      ...room,
                      rate_plans: (room.rate_plans ?? []).map((plan, j) =>
                          j === planIndex ? { ...plan, [field]: value } : plan,
                      ),
                  }
                : room,
        ));

    // Booking cutoff time is driven by a flatpickr instance created once per row. Use the
    // functional setData form so its (latest-ref) onChange always merges into the freshest
    // state and never overwrites other rate-plan fields via a stale `rooms` snapshot.
    const setBookingCutoff = (roomIndex, planIndex, value) =>
        setData((prev) => ({
            ...prev,
            rooms: (prev.rooms ?? []).map((room, i) =>
                i === roomIndex
                    ? {
                          ...room,
                          rate_plans: (room.rate_plans ?? []).map((plan, j) =>
                              j === planIndex ? { ...plan, booking_cutoff_time: value } : plan,
                          ),
                      }
                    : room,
            ),
        }));

    // Update several fields of one rate plan in a single setData (so a changed price
    // and its recomputed sale_price are written together, not via two racing updates).
    const updateRatePlanFields = (roomIndex, planIndex, patch) =>
        setData('rooms', rooms.map((room, i) =>
            i === roomIndex
                ? {
                      ...room,
                      rate_plans: (room.rate_plans ?? []).map((plan, j) =>
                          j === planIndex ? { ...plan, ...patch } : plan,
                      ),
                  }
                : room,
        ));

    // The rate-plan editor for one room (shared by the 'rate_plans' and 'all' sections).
    const ratePlansBlock = (room, index) => (
        <div className="p-4 mt-2 rounded-lg bg-gray-50 dark:bg-white/5">
            <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                    Rate Plans
                </h5>
                <PrimaryButton
                    Text={'Add Rate Plan'}
                    Type={'button'}
                    Id={`add_rate_plan_${index}`}
                    CustomClass={'w-[170px]'}
                    Action={() => addRatePlan(index)}
                />
            </div>

            {(room.rate_plans ?? []).length === 0 && (
                <p className="text-xs text-gray-500">No rate plans added yet.</p>
            )}

            {(room.rate_plans ?? []).map((plan, planIndex) => (
                <div
                    key={planIndex}
                    className="p-4 mb-4 bg-white border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-deepcharcoal"
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-main-text-light dark:text-main-text-dark">
                            Rate Plan #{planIndex + 1}
                        </span>
                        <PrimaryButton
                            Type={'button'}
                            Id={`remove_rate_plan_${index}_${planIndex}`}
                            Action={() => removeRatePlan(index, planIndex)}
                            CustomClass={'w-[50px] bg-red-500 hover:bg-red-600 [&>div]:hidden'}
                            Text={'X'}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Input
                            InputName={'Plan Name'}
                            Id={`rooms_${index}_rate_plans_${planIndex}_name`}
                            Name={`rooms_${index}_rate_plans_${planIndex}_name`}
                            Type={'text'}
                            Required={true}
                            Value={plan.name}
                            Error={errors[`rooms.${index}.rate_plans.${planIndex}.name`]}
                            Action={(e) => updateRatePlan(index, planIndex, 'name', e.target.value)}
                        />
                        <SelectInput
                            InputName={'Stay Type'}
                            Id={`rooms_${index}_rate_plans_${planIndex}_stay_type`}
                            Name={`rooms_${index}_rate_plans_${planIndex}_stay_type`}
                            items={stayTypeOptions(enums?.stay_type)}
                            itemKey={'name'}
                            Value={plan.stay_type}
                            Error={errors[`rooms.${index}.rate_plans.${planIndex}.stay_type`]}
                            Action={(value) => updateRatePlan(index, planIndex, 'stay_type', value)}
                        />
                        <Input
                            InputName={'Original Price'}
                            Id={`rooms_${index}_rate_plans_${planIndex}_original_price`}
                            Name={`rooms_${index}_rate_plans_${planIndex}_original_price`}
                            Type={'number'}
                            Value={plan.original_price}
                            Error={errors[`rooms.${index}.rate_plans.${planIndex}.original_price`]}
                            Action={(e) =>
                                updateRatePlanFields(index, planIndex, {
                                    original_price: e.target.value,
                                    sale_price: computeSalePrice(e.target.value, plan.discount_rate),
                                })
                            }
                        />
                        <Input
                            InputName={'Discount Rate (%)'}
                            Id={`rooms_${index}_rate_plans_${planIndex}_discount_rate`}
                            Name={`rooms_${index}_rate_plans_${planIndex}_discount_rate`}
                            Type={'number'}
                            Value={plan.discount_rate}
                            Error={errors[`rooms.${index}.rate_plans.${planIndex}.discount_rate`]}
                            Action={(e) =>
                                updateRatePlanFields(index, planIndex, {
                                    discount_rate: e.target.value,
                                    sale_price: computeSalePrice(plan.original_price, e.target.value),
                                })
                            }
                        />
                        <Input
                            InputName={'Sale Price (Auto)'}
                            Id={`rooms_${index}_rate_plans_${planIndex}_sale_price`}
                            Name={`rooms_${index}_rate_plans_${planIndex}_sale_price`}
                            // Text (not number) so thousand separators render; the field is read-only
                            // and decorative — the stored sale_price lives in rate-plan state.
                            Type={'text'}
                            Required={true}
                            readOnly={true}
                            Value={formatSalePriceDisplay(plan.original_price, plan.discount_rate)}
                            Error={errors[`rooms.${index}.rate_plans.${planIndex}.sale_price`]}
                        />
                        <Input
                            InputName={'Member Price'}
                            Id={`rooms_${index}_rate_plans_${planIndex}_member_price`}
                            Name={`rooms_${index}_rate_plans_${planIndex}_member_price`}
                            Type={'number'}
                            Value={plan.member_price}
                            Error={errors[`rooms.${index}.rate_plans.${planIndex}.member_price`]}
                            Action={(e) => updateRatePlan(index, planIndex, 'member_price', e.target.value)}
                        />
                        <Input
                            InputName={'Minimum Nights'}
                            Id={`rooms_${index}_rate_plans_${planIndex}_minimum_nights`}
                            Name={`rooms_${index}_rate_plans_${planIndex}_minimum_nights`}
                            Type={'number'}
                            Value={plan.minimum_nights}
                            Error={errors[`rooms.${index}.rate_plans.${planIndex}.minimum_nights`]}
                            Action={(e) => updateRatePlan(index, planIndex, 'minimum_nights', e.target.value)}
                        />
                        <Input
                            InputName={'Maximum Nights'}
                            Id={`rooms_${index}_rate_plans_${planIndex}_maximum_nights`}
                            Name={`rooms_${index}_rate_plans_${planIndex}_maximum_nights`}
                            Type={'number'}
                            Value={plan.maximum_nights}
                            Error={errors[`rooms.${index}.rate_plans.${planIndex}.maximum_nights`]}
                            Action={(e) => updateRatePlan(index, planIndex, 'maximum_nights', e.target.value)}
                        />
                        <FlatpickrTimeInput
                            InputName={'Booking Cutoff Time'}
                            Id={`rooms_${index}_rate_plans_${planIndex}_booking_cutoff_time`}
                            Name={`rooms_${index}_rate_plans_${planIndex}_booking_cutoff_time`}
                            Placeholder={'e.g. 18:00'}
                            Value={plan.booking_cutoff_time}
                            Error={errors[`rooms.${index}.rate_plans.${planIndex}.booking_cutoff_time`]}
                            onChange={(v) => setBookingCutoff(index, planIndex, v)}
                        />
                        <Input
                            InputName={'Remaining Room Count'}
                            Id={`rooms_${index}_rate_plans_${planIndex}_remaining_room_count`}
                            Name={`rooms_${index}_rate_plans_${planIndex}_remaining_room_count`}
                            Type={'number'}
                            Value={plan.remaining_room_count}
                            Error={errors[`rooms.${index}.rate_plans.${planIndex}.remaining_room_count`]}
                            Action={(e) => updateRatePlan(index, planIndex, 'remaining_room_count', e.target.value)}
                        />
                        <SelectInput
                            InputName={'Payment Methods'}
                            Id={`rooms_${index}_rate_plans_${planIndex}_payment_methods`}
                            Name={`rooms_${index}_rate_plans_${planIndex}_payment_methods`}
                            Multiple={true}
                            items={toOptions(enums?.payment_methods)}
                            itemKey={'name'}
                            Value={plan.payment_methods}
                            Error={errors[`rooms.${index}.rate_plans.${planIndex}.payment_methods`]}
                            Action={(value) => updateRatePlan(index, planIndex, 'payment_methods', value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 mt-2 gap-x-6 md:grid-cols-2">
                        <ToggleField
                            id={`rooms_${index}_rate_plans_${planIndex}_crypto_supported`}
                            label={'Crypto Supported'}
                            hint={'For now this stays always on. As discussed for launch, only NOWPayments crypto payment is supported.'}
                            checked={true}
                            disabled={true}
                            onChange={() => {}}
                        />
                        <ToggleField
                            id={`rooms_${index}_rate_plans_${planIndex}_same_day_booking_allowed`}
                            label={'Same-day Booking Allowed'}
                            checked={plan.same_day_booking_allowed}
                            onChange={(v) => updateRatePlan(index, planIndex, 'same_day_booking_allowed', v)}
                        />
                        <ToggleField
                            id={`rooms_${index}_rate_plans_${planIndex}_is_bookable`}
                            label={'Bookable'}
                            checked={plan.is_bookable}
                            onChange={(v) => updateRatePlan(index, planIndex, 'is_bookable', v)}
                        />
                        <ToggleField
                            id={`rooms_${index}_rate_plans_${planIndex}_is_active`}
                            label={'Active'}
                            checked={plan.is_active}
                            onChange={(v) => updateRatePlan(index, planIndex, 'is_active', v)}
                        />
                        <ToggleField
                            id={`rooms_${index}_rate_plans_${planIndex}_is_cancellable`}
                            label={'Cancellable'}
                            checked={plan.is_cancellable}
                            onChange={(v) => updateRatePlan(index, planIndex, 'is_cancellable', v)}
                        />
                        <ToggleField
                            id={`rooms_${index}_rate_plans_${planIndex}_is_non_refundable`}
                            label={'Non Refundable'}
                            checked={plan.is_non_refundable}
                            onChange={(v) => updateRatePlan(index, planIndex, 'is_non_refundable', v)}
                        />
                        <ToggleField
                            id={`rooms_${index}_rate_plans_${planIndex}_breakfast_included`}
                            label={'Breakfast Included'}
                            checked={plan.breakfast_included}
                            onChange={(v) => updateRatePlan(index, planIndex, 'breakfast_included', v)}
                        />
                        <ToggleField
                            id={`rooms_${index}_rate_plans_${planIndex}_free_parking_included`}
                            label={'Free Parking Included'}
                            checked={plan.free_parking_included}
                            onChange={(v) => updateRatePlan(index, planIndex, 'free_parking_included', v)}
                        />
                        <ToggleField
                            id={`rooms_${index}_rate_plans_${planIndex}_early_checkin_included`}
                            label={'Early Check-in Included'}
                            checked={plan.early_checkin_included}
                            onChange={(v) => updateRatePlan(index, planIndex, 'early_checkin_included', v)}
                        />
                        <ToggleField
                            id={`rooms_${index}_rate_plans_${planIndex}_late_checkout_included`}
                            label={'Late Check-out Included'}
                            checked={plan.late_checkout_included}
                            onChange={(v) => updateRatePlan(index, planIndex, 'late_checkout_included', v)}
                        />
                        <ToggleField
                            id={`rooms_${index}_rate_plans_${planIndex}_consecutive_nights_allowed`}
                            label={'Consecutive Nights Allowed'}
                            checked={plan.consecutive_nights_allowed}
                            onChange={(v) => updateRatePlan(index, planIndex, 'consecutive_nights_allowed', v)}
                        />
                    </div>

                    {/* The consecutive-nights cross-field rule errors against this toggle, which has
                        no input-bottom slot — surface it here (it concerns the minimum/maximum nights
                        above) mirroring how the number inputs render their errors[...] message. */}
                    {errors[`rooms.${index}.rate_plans.${planIndex}.consecutive_nights_allowed`] && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors[`rooms.${index}.rate_plans.${planIndex}.consecutive_nights_allowed`]}
                        </p>
                    )}

                    {/* Per-language overrides for this rate plan's name. */}
                    <TranslationsRepeater
                        value={plan.translations}
                        onChange={(next) => updateRatePlan(index, planIndex, 'translations', next)}
                        languages={languages}
                        fields={ratePlanTranslatableFields}
                    />
                </div>
            ))}
        </div>
    );

    return (
        <div className="mt-8">
            {/* ---- Rooms section ---- */}
            {showRooms && (
                <>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                            Rooms
                        </h3>
                        <PrimaryButton
                            Text={'Add Room'}
                            Type={'button'}
                            Id={'add_room'}
                            CustomClass={'w-[150px]'}
                            Action={addRoom}
                        />
                    </div>

                    {rooms.length === 0 && (
                        <p className="p-4 text-sm text-gray-500 rounded-lg bg-gray-50 dark:bg-white/5">
                            No rooms added yet.
                        </p>
                    )}

                    {rooms.map((room, index) => (
                        <div
                            key={index}
                            className="p-4 mb-6 border border-gray-200 rounded-xl dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-base font-semibold text-main-text-light dark:text-main-text-dark">
                                    Room #{index + 1}
                                </h4>
                                <PrimaryButton
                                    Type={'button'}
                                    Id={`remove_room_${index}`}
                                    Action={() => removeRoom(index)}
                                    CustomClass={'w-[50px] bg-red-500 hover:bg-red-600 [&>div]:hidden'}
                                    Text={'X'}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Input
                                    InputName={'Room Name'}
                                    Id={`rooms_${index}_room_name`}
                                    Name={`rooms_${index}_room_name`}
                                    Type={'text'}
                                    Required={true}
                                    Value={room.room_name}
                                    Error={errors[`rooms.${index}.room_name`]}
                                    Action={(e) => updateRoom(index, 'room_name', e.target.value)}
                                />
                                <SelectInput
                                    InputName={'Room Type'}
                                    Id={`rooms_${index}_room_type`}
                                    Name={`rooms_${index}_room_type`}
                                    Required={true}
                                    items={toOptions(enums?.room_type)}
                                    itemKey={'name'}
                                    Value={room.room_type}
                                    Error={errors[`rooms.${index}.room_type`]}
                                    Action={(value) => updateRoom(index, 'room_type', value)}
                                />
                                <Input
                                    InputName={'Standard Guests'}
                                    Id={`rooms_${index}_standard_guests`}
                                    Name={`rooms_${index}_standard_guests`}
                                    Type={'number'}
                                    Required={true}
                                    Value={room.standard_guests}
                                    Error={errors[`rooms.${index}.standard_guests`]}
                                    Action={(e) => updateRoom(index, 'standard_guests', e.target.value)}
                                />
                                <Input
                                    InputName={'Max Guests'}
                                    Id={`rooms_${index}_max_guests`}
                                    Name={`rooms_${index}_max_guests`}
                                    Type={'number'}
                                    Value={room.max_guests}
                                    Error={errors[`rooms.${index}.max_guests`]}
                                    Action={(e) => updateRoom(index, 'max_guests', e.target.value)}
                                />
                                <Input
                                    InputName={'Bedrooms Count'}
                                    Id={`rooms_${index}_bedrooms_count`}
                                    Name={`rooms_${index}_bedrooms_count`}
                                    Type={'number'}
                                    Value={room.bedrooms_count}
                                    Error={errors[`rooms.${index}.bedrooms_count`]}
                                    Action={(e) => updateRoom(index, 'bedrooms_count', e.target.value)}
                                />
                                <Input
                                    InputName={'Beds Count'}
                                    Id={`rooms_${index}_beds_count`}
                                    Name={`rooms_${index}_beds_count`}
                                    Type={'number'}
                                    Value={room.beds_count}
                                    Error={errors[`rooms.${index}.beds_count`]}
                                    Action={(e) => updateRoom(index, 'beds_count', e.target.value)}
                                />
                                <SelectInput
                                    InputName={'Bed Types'}
                                    Id={`rooms_${index}_bed_types`}
                                    Name={`rooms_${index}_bed_types`}
                                    Multiple={true}
                                    items={bedTypeOptions(enums?.bed_types)}
                                    itemKey={'name'}
                                    Value={room.bed_types}
                                    Error={errors[`rooms.${index}.bed_types`]}
                                    Action={(value) => updateRoom(index, 'bed_types', value)}
                                />
                                <Input
                                    InputName={'Bed Size'}
                                    Id={`rooms_${index}_bed_size`}
                                    Name={`rooms_${index}_bed_size`}
                                    Type={'text'}
                                    Value={room.bed_size}
                                    Error={errors[`rooms.${index}.bed_size`]}
                                    Action={(e) => updateRoom(index, 'bed_size', e.target.value)}
                                />
                                <Input
                                    InputName={'Bathrooms Count'}
                                    Id={`rooms_${index}_bathrooms_count`}
                                    Name={`rooms_${index}_bathrooms_count`}
                                    Type={'number'}
                                    Value={room.bathrooms_count}
                                    Error={errors[`rooms.${index}.bathrooms_count`]}
                                    Action={(e) => updateRoom(index, 'bathrooms_count', e.target.value)}
                                />
                                <Input
                                    InputName={'Toilets Count'}
                                    Id={`rooms_${index}_toilets_count`}
                                    Name={`rooms_${index}_toilets_count`}
                                    Type={'number'}
                                    Value={room.toilets_count}
                                    Error={errors[`rooms.${index}.toilets_count`]}
                                    Action={(e) => updateRoom(index, 'toilets_count', e.target.value)}
                                />
                                <SelectInput
                                    InputName={'View Type'}
                                    Id={`rooms_${index}_view_type`}
                                    Name={`rooms_${index}_view_type`}
                                    items={toOptions(enums?.view_type)}
                                    itemKey={'name'}
                                    Value={room.view_type}
                                    Error={errors[`rooms.${index}.view_type`]}
                                    // Set both fields atomically: clear the custom text whenever the
                                    // view type is not 'other' (two updateRoom calls would race on the
                                    // same stale `rooms` closure and drop one of the changes).
                                    Action={(value) =>
                                        setData(
                                            'rooms',
                                            rooms.map((r, i) =>
                                                i === index
                                                    ? {
                                                          ...r,
                                                          view_type: value,
                                                          view_type_other:
                                                              value === 'other' ? r.view_type_other : '',
                                                      }
                                                    : r,
                                            ),
                                        )
                                    }
                                />
                                {room.view_type === 'other' && (
                                    <Input
                                        InputName={'Custom View Type'}
                                        Id={`rooms_${index}_view_type_other`}
                                        Name={`rooms_${index}_view_type_other`}
                                        Type={'text'}
                                        Value={room.view_type_other}
                                        Error={errors[`rooms.${index}.view_type_other`]}
                                        Action={(e) =>
                                            updateRoom(index, 'view_type_other', e.target.value)
                                        }
                                    />
                                )}
                                <Input
                                    InputName={'Room Size'}
                                    Id={`rooms_${index}_room_size`}
                                    Name={`rooms_${index}_room_size`}
                                    Type={'text'}
                                    Value={room.room_size}
                                    Error={errors[`rooms.${index}.room_size`]}
                                    Action={(e) => updateRoom(index, 'room_size', e.target.value)}
                                />
                                <Input
                                    InputName={'Room Floor Label'}
                                    Id={`rooms_${index}_room_floor_label`}
                                    Name={`rooms_${index}_room_floor_label`}
                                    Type={'text'}
                                    Value={room.room_floor_label}
                                    Error={errors[`rooms.${index}.room_floor_label`]}
                                    Action={(e) => updateRoom(index, 'room_floor_label', e.target.value)}
                                />
                                <Input
                                    InputName={'Remaining Room Count'}
                                    Id={`rooms_${index}_remaining_room_count`}
                                    Name={`rooms_${index}_remaining_room_count`}
                                    Type={'number'}
                                    Value={room.remaining_room_count}
                                    Error={errors[`rooms.${index}.remaining_room_count`]}
                                    Action={(e) => updateRoom(index, 'remaining_room_count', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 mt-2 gap-x-6 md:grid-cols-2">
                                <ToggleField
                                    id={`rooms_${index}_is_bathroom_private`}
                                    label={'Private Bathroom'}
                                    checked={room.is_bathroom_private}
                                    onChange={(v) => updateRoom(index, 'is_bathroom_private', v)}
                                />
                                <ToggleField
                                    id={`rooms_${index}_has_jacuzzi`}
                                    label={'Has Jacuzzi'}
                                    checked={room.has_jacuzzi}
                                    onChange={(v) => updateRoom(index, 'has_jacuzzi', v)}
                                />
                                <ToggleField
                                    id={`rooms_${index}_has_bathtub`}
                                    label={'Has Bathtub'}
                                    checked={room.has_bathtub}
                                    onChange={(v) => updateRoom(index, 'has_bathtub', v)}
                                />
                                <ToggleField
                                    id={`rooms_${index}_has_shower_booth`}
                                    label={'Has Shower Booth'}
                                    checked={room.has_shower_booth}
                                    onChange={(v) => updateRoom(index, 'has_shower_booth', v)}
                                />
                                <ToggleField
                                    id={`rooms_${index}_is_smoking_allowed`}
                                    label={'Smoking Allowed'}
                                    checked={room.is_smoking_allowed}
                                    onChange={(v) => updateRoom(index, 'is_smoking_allowed', v)}
                                />
                                <ToggleField
                                    id={`rooms_${index}_children_allowed`}
                                    label={'Children Allowed'}
                                    checked={room.children_allowed}
                                    onChange={(v) => updateRoom(index, 'children_allowed', v)}
                                />
                                <ToggleField
                                    id={`rooms_${index}_pets_allowed`}
                                    label={'Pets Allowed'}
                                    checked={room.pets_allowed}
                                    onChange={(v) => updateRoom(index, 'pets_allowed', v)}
                                />
                                <ToggleField
                                    id={`rooms_${index}_is_random_assignment`}
                                    label={'Random Room Assignment'}
                                    checked={room.is_random_assignment}
                                    onChange={(v) => updateRoom(index, 'is_random_assignment', v)}
                                />
                                <ToggleField
                                    id={`rooms_${index}_is_available`}
                                    label={'Available'}
                                    checked={room.is_available}
                                    onChange={(v) => updateRoom(index, 'is_available', v)}
                                />
                            </div>

                            <div className="mt-4">
                                <SelectInput
                                    InputName={'Room Amenities'}
                                    Id={`rooms_${index}_amenity_ids`}
                                    Name={`rooms_${index}_amenity_ids`}
                                    Multiple={true}
                                    items={amenities ?? []}
                                    itemKey={'name'}
                                    Value={room.amenity_ids}
                                    Error={errors[`rooms.${index}.amenity_ids`]}
                                    Action={(value) => updateRoom(index, 'amenity_ids', value)}
                                />
                            </div>

                            {/* Per-language overrides for this room's free-text fields. The custom
                                view-type override only applies when view_type === 'other' (same
                                condition as the main form input), so drop it from the translation
                                fields otherwise. */}
                            <TranslationsRepeater
                                value={room.translations}
                                onChange={(next) => updateRoom(index, 'translations', next)}
                                languages={languages}
                                fields={
                                    room.view_type === 'other'
                                        ? roomTranslatableFields
                                        : roomTranslatableFields.filter(
                                              (f) => f.key !== 'view_type_other',
                                          )
                                }
                            />

                            {/* In the combined ('all') view the rate plans stay nested here. */}
                            {section === 'all' && <div className="mt-6">{ratePlansBlock(room, index)}</div>}
                        </div>
                    ))}
                </>
            )}

            {/* ---- Rate Plans section (separate tab; rate plans grouped per room) ---- */}
            {showRatePlans && section !== 'all' && (
                <>
                    <h3 className="mb-3 text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                        Rate Plans
                    </h3>

                    {rooms.length === 0 && (
                        <p className="p-4 text-sm text-gray-500 rounded-lg bg-gray-50 dark:bg-white/5">
                            Add a room in the Rooms tab first, then attach its rate plans here.
                        </p>
                    )}

                    {rooms.map((room, index) => (
                        <div
                            key={index}
                            className="p-4 mb-6 border border-gray-200 rounded-xl dark:border-gray-700"
                        >
                            <h4 className="mb-1 text-base font-semibold text-main-text-light dark:text-main-text-dark">
                                {room.room_name?.trim() ? room.room_name : `Room #${index + 1}`}
                            </h4>
                            {ratePlansBlock(room, index)}
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}
