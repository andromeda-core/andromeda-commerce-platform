import { useEffect, useRef, useState } from 'react';
import Input from '@/Components/Input';
import SelectInput from '@/Components/SelectInput';
import Textarea from '@/Components/Textarea';
import PrimaryButton from '@/Components/PrimaryButton';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { Accordion, ToggleField, toOptions } from './helpers';

export default function PolicySections({ data, setData, errors, enums }) {
    const [open, setOpen] = useState(null);
    const toggle = (key) => setOpen((prev) => (prev === key ? null : key));

    const updatePolicy = (group, field, value) =>
        setData(group, { ...data[group], [field]: value });

    // Refund schedule sub-repeater (cancellation policy → JSON array).
    const refundRows = data.cancellation_policy?.refund_schedule ?? [];
    const addRefundRow = () =>
        updatePolicy('cancellation_policy', 'refund_schedule', [
            ...refundRows,
            { label: '', refund_percent: '' },
        ]);
    const removeRefundRow = (i) =>
        updatePolicy(
            'cancellation_policy',
            'refund_schedule',
            refundRows.filter((_, idx) => idx !== i),
        );
    const updateRefundRow = (i, field, value) =>
        updatePolicy(
            'cancellation_policy',
            'refund_schedule',
            refundRows.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)),
        );

    const checkin = data.checkin_policy ?? {};
    const parking = data.parking_policy ?? {};
    const cancellation = data.cancellation_policy ?? {};

    // Check-in / Check-out time use the same flatpickr time-only picker as the property's
    // base time fields (24h, HH:MM, no calendar). Stored value format is unchanged.
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

        // Functional setData reads the latest checkin_policy, so changing the time never
        // overwrites other check-in fields edited after the picker is initialized.
        const writeTime = (field) => (selectedDates, dateStr) =>
            setData((prev) => ({
                ...prev,
                checkin_policy: { ...(prev.checkin_policy ?? {}), [field]: dateStr },
            }));

        const checkinPicker = checkinTimeRef.current
            ? flatpickr(checkinTimeRef.current, {
                  ...timeOptions,
                  defaultDate: checkin.checkin_time || null,
                  onChange: writeTime('checkin_time'),
              })
            : null;

        const checkoutPicker = checkoutTimeRef.current
            ? flatpickr(checkoutTimeRef.current, {
                  ...timeOptions,
                  defaultDate: checkin.checkout_time || null,
                  onChange: writeTime('checkout_time'),
              })
            : null;

        return () => {
            checkinPicker?.destroy();
            checkoutPicker?.destroy();
        };
        // Re-run when the open accordion changes: the Accordion conditionally renders its
        // children ({open && ...}), so these inputs (and their refs) only exist once the
        // Check-in Policy section is opened. A mount-only effect attached to nothing.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    return (
        <div className="mt-8">
            <h3 className="mb-3 text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                Policies
            </h3>

            {/* Check-in policy */}
            <Accordion
                title={'Check-in Policy'}
                open={open === 'checkin'}
                onToggle={() => toggle('checkin')}
            >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                        InputName={'Check-in Time'}
                        Id={'checkin_time'}
                        Name={'checkin_time'}
                        Type={'text'}
                        Placeholder={'e.g. 15:00'}
                        Value={checkin.checkin_time}
                        Error={errors['checkin_policy.checkin_time']}
                        InputRef={checkinTimeRef}
                        Action={(e) => updatePolicy('checkin_policy', 'checkin_time', e.target.value)}
                    />
                    <Input
                        InputName={'Check-out Time'}
                        Id={'checkout_time'}
                        Name={'checkout_time'}
                        Type={'text'}
                        Placeholder={'e.g. 11:00'}
                        Value={checkin.checkout_time}
                        Error={errors['checkin_policy.checkout_time']}
                        InputRef={checkoutTimeRef}
                        Action={(e) => updatePolicy('checkin_policy', 'checkout_time', e.target.value)}
                    />
                    <Input
                        InputName={'Early Check-in Fee'}
                        Id={'early_checkin_fee'}
                        Name={'early_checkin_fee'}
                        Type={'number'}
                        Value={checkin.early_checkin_fee}
                        Error={errors['checkin_policy.early_checkin_fee']}
                        Action={(e) => updatePolicy('checkin_policy', 'early_checkin_fee', e.target.value)}
                    />
                    <Input
                        InputName={'Late Check-out Fee'}
                        Id={'late_checkout_fee'}
                        Name={'late_checkout_fee'}
                        Type={'number'}
                        Value={checkin.late_checkout_fee}
                        Error={errors['checkin_policy.late_checkout_fee']}
                        Action={(e) => updatePolicy('checkin_policy', 'late_checkout_fee', e.target.value)}
                    />
                    <SelectInput
                        InputName={'Check-in Method'}
                        Id={'checkin_method'}
                        Name={'checkin_method'}
                        items={toOptions(enums?.checkin_method)}
                        itemKey={'name'}
                        Value={checkin.checkin_method}
                        Error={errors['checkin_policy.checkin_method']}
                        Action={(value) => updatePolicy('checkin_policy', 'checkin_method', value)}
                    />
                    <Input
                        InputName={'Instructions Sent When'}
                        Id={'instructions_sent_when'}
                        Name={'instructions_sent_when'}
                        Type={'text'}
                        Value={checkin.instructions_sent_when}
                        Error={errors['checkin_policy.instructions_sent_when']}
                        Action={(e) => updatePolicy('checkin_policy', 'instructions_sent_when', e.target.value)}
                    />
                </div>

                <div className="mt-2 grid grid-cols-1 gap-x-6 md:grid-cols-2">
                    <ToggleField
                        id={'early_checkin_available'}
                        label={'Early Check-in Available'}
                        checked={checkin.early_checkin_available}
                        onChange={(v) => updatePolicy('checkin_policy', 'early_checkin_available', v)}
                    />
                    <ToggleField
                        id={'late_checkout_available'}
                        label={'Late Check-out Available'}
                        checked={checkin.late_checkout_available}
                        onChange={(v) => updatePolicy('checkin_policy', 'late_checkout_available', v)}
                    />
                    <ToggleField
                        id={'id_verification_required'}
                        label={'ID Verification Required'}
                        checked={checkin.id_verification_required}
                        onChange={(v) => updatePolicy('checkin_policy', 'id_verification_required', v)}
                    />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4">
                    <Textarea
                        InputName={'Same Day Booking Notice'}
                        Id={'same_day_booking_notice'}
                        Name={'same_day_booking_notice'}
                        Value={checkin.same_day_booking_notice}
                        Error={errors['checkin_policy.same_day_booking_notice']}
                        Action={(e) => updatePolicy('checkin_policy', 'same_day_booking_notice', e.target.value)}
                    />
                    <Textarea
                        InputName={'Early Entry Penalty'}
                        Id={'early_entry_penalty'}
                        Name={'early_entry_penalty'}
                        Value={checkin.early_entry_penalty}
                        Error={errors['checkin_policy.early_entry_penalty']}
                        Action={(e) => updatePolicy('checkin_policy', 'early_entry_penalty', e.target.value)}
                    />
                    <Textarea
                        InputName={'Late Check-out Penalty'}
                        Id={'late_checkout_penalty'}
                        Name={'late_checkout_penalty'}
                        Value={checkin.late_checkout_penalty}
                        Error={errors['checkin_policy.late_checkout_penalty']}
                        Action={(e) => updatePolicy('checkin_policy', 'late_checkout_penalty', e.target.value)}
                    />
                    <Textarea
                        InputName={'Minor Policy'}
                        Id={'minor_policy'}
                        Name={'minor_policy'}
                        Value={checkin.minor_policy}
                        Error={errors['checkin_policy.minor_policy']}
                        Action={(e) => updatePolicy('checkin_policy', 'minor_policy', e.target.value)}
                    />
                    <Textarea
                        InputName={'Mixed Gender Policy'}
                        Id={'mixed_gender_policy'}
                        Name={'mixed_gender_policy'}
                        Value={checkin.mixed_gender_policy}
                        Error={errors['checkin_policy.mixed_gender_policy']}
                        Action={(e) => updatePolicy('checkin_policy', 'mixed_gender_policy', e.target.value)}
                    />
                    <Textarea
                        InputName={'Noise / Party Restriction'}
                        Id={'noise_party_restriction'}
                        Name={'noise_party_restriction'}
                        Value={checkin.noise_party_restriction}
                        Error={errors['checkin_policy.noise_party_restriction']}
                        Action={(e) => updatePolicy('checkin_policy', 'noise_party_restriction', e.target.value)}
                    />
                    <Textarea
                        InputName={'Check-in Instruction Message'}
                        Id={'checkin_instruction_message'}
                        Name={'checkin_instruction_message'}
                        Value={checkin.checkin_instruction_message}
                        Error={errors['checkin_policy.checkin_instruction_message']}
                        Action={(e) => updatePolicy('checkin_policy', 'checkin_instruction_message', e.target.value)}
                    />
                </div>
            </Accordion>

            {/* Parking policy */}
            <Accordion
                title={'Parking Policy'}
                open={open === 'parking'}
                onToggle={() => toggle('parking')}
            >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                        InputName={'Spaces Per Room'}
                        Id={'spaces_per_room'}
                        Name={'spaces_per_room'}
                        Type={'number'}
                        Value={parking.spaces_per_room}
                        Error={errors['parking_policy.spaces_per_room']}
                        Action={(e) => updatePolicy('parking_policy', 'spaces_per_room', e.target.value)}
                    />
                    <SelectInput
                        InputName={'Parking Type'}
                        Id={'parking_type'}
                        Name={'parking_type'}
                        items={toOptions(enums?.parking_type)}
                        itemKey={'name'}
                        Value={parking.parking_type}
                        Error={errors['parking_policy.parking_type']}
                        Action={(value) => updatePolicy('parking_policy', 'parking_type', value)}
                    />
                    <Input
                        InputName={'Parking Availability Time'}
                        Id={'parking_availability_time'}
                        Name={'parking_availability_time'}
                        Type={'text'}
                        Value={parking.parking_availability_time}
                        Error={errors['parking_policy.parking_availability_time']}
                        Action={(e) => updatePolicy('parking_policy', 'parking_availability_time', e.target.value)}
                    />
                    <Input
                        InputName={'Vehicle Height Limit'}
                        Id={'vehicle_height_limit'}
                        Name={'vehicle_height_limit'}
                        Type={'text'}
                        Value={parking.vehicle_height_limit}
                        Error={errors['parking_policy.vehicle_height_limit']}
                        Action={(e) => updatePolicy('parking_policy', 'vehicle_height_limit', e.target.value)}
                    />
                    <Input
                        InputName={'Extra Parking Fee'}
                        Id={'extra_parking_fee'}
                        Name={'extra_parking_fee'}
                        Type={'number'}
                        Value={parking.extra_parking_fee}
                        Error={errors['parking_policy.extra_parking_fee']}
                        Action={(e) => updatePolicy('parking_policy', 'extra_parking_fee', e.target.value)}
                    />
                </div>

                <div className="mt-2 grid grid-cols-1 gap-x-6 md:grid-cols-2">
                    <ToggleField
                        id={'parking_available'}
                        label={'Parking Available'}
                        checked={parking.parking_available}
                        onChange={(v) => updatePolicy('parking_policy', 'parking_available', v)}
                    />
                    <ToggleField
                        id={'parking_free'}
                        label={'Parking Free'}
                        checked={parking.parking_free}
                        onChange={(v) => updatePolicy('parking_policy', 'parking_free', v)}
                    />
                    <ToggleField
                        id={'pre_registration_required'}
                        label={'Pre-registration Required'}
                        checked={parking.pre_registration_required}
                        onChange={(v) => updatePolicy('parking_policy', 'pre_registration_required', v)}
                    />
                    <ToggleField
                        id={'nearby_parking_available'}
                        label={'Nearby Parking Available'}
                        checked={parking.nearby_parking_available}
                        onChange={(v) => updatePolicy('parking_policy', 'nearby_parking_available', v)}
                    />
                    <ToggleField
                        id={'fee_paid_by_guest'}
                        label={'Fee Paid By Guest'}
                        checked={parking.fee_paid_by_guest}
                        onChange={(v) => updatePolicy('parking_policy', 'fee_paid_by_guest', v)}
                    />
                    <ToggleField
                        id={'ev_charging_available'}
                        label={'EV Charging Available'}
                        checked={parking.ev_charging_available}
                        onChange={(v) => updatePolicy('parking_policy', 'ev_charging_available', v)}
                    />
                    <ToggleField
                        id={'refund_if_no_parking'}
                        label={'Refund If No Parking'}
                        checked={parking.refund_if_no_parking}
                        onChange={(v) => updatePolicy('parking_policy', 'refund_if_no_parking', v)}
                    />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4">
                    <Textarea
                        InputName={'Before Check-in / After Check-out'}
                        Id={'before_checkin_after_checkout'}
                        Name={'before_checkin_after_checkout'}
                        Value={parking.before_checkin_after_checkout}
                        Error={errors['parking_policy.before_checkin_after_checkout']}
                        Action={(e) => updatePolicy('parking_policy', 'before_checkin_after_checkout', e.target.value)}
                    />
                    <Textarea
                        InputName={'Full Lot Policy'}
                        Id={'full_lot_policy'}
                        Name={'full_lot_policy'}
                        Value={parking.full_lot_policy}
                        Error={errors['parking_policy.full_lot_policy']}
                        Action={(e) => updatePolicy('parking_policy', 'full_lot_policy', e.target.value)}
                    />
                    <Textarea
                        InputName={'Large Vehicle Restrictions'}
                        Id={'large_vehicle_restrictions'}
                        Name={'large_vehicle_restrictions'}
                        Value={parking.large_vehicle_restrictions}
                        Error={errors['parking_policy.large_vehicle_restrictions']}
                        Action={(e) => updatePolicy('parking_policy', 'large_vehicle_restrictions', e.target.value)}
                    />
                </div>
            </Accordion>

            {/* Cancellation / fee policy */}
            <Accordion
                title={'Cancellation & Fee Policy'}
                open={open === 'cancellation'}
                onToggle={() => toggle('cancellation')}
            >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <SelectInput
                        InputName={'Policy Name'}
                        Id={'policy_name'}
                        Name={'policy_name'}
                        items={toOptions(enums?.policy_name)}
                        itemKey={'name'}
                        Value={cancellation.policy_name}
                        Error={errors['cancellation_policy.policy_name']}
                        Action={(value) => updatePolicy('cancellation_policy', 'policy_name', value)}
                    />
                    <Input
                        InputName={'Free Cancellation Deadline'}
                        Id={'free_cancellation_deadline'}
                        Name={'free_cancellation_deadline'}
                        Type={'text'}
                        Value={cancellation.free_cancellation_deadline}
                        Error={errors['cancellation_policy.free_cancellation_deadline']}
                        Action={(e) => updatePolicy('cancellation_policy', 'free_cancellation_deadline', e.target.value)}
                    />
                </div>

                <ToggleField
                    id={'requires_admin_confirmation'}
                    label={'Requires Admin Confirmation'}
                    checked={cancellation.requires_admin_confirmation}
                    onChange={(v) => updatePolicy('cancellation_policy', 'requires_admin_confirmation', v)}
                />

                {/* Refund schedule repeater */}
                <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-white/5">
                    <div className="mb-3 flex items-center justify-between">
                        <h5 className="text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                            Refund Schedule
                        </h5>
                        <PrimaryButton
                            Text={'Add Row'}
                            Type={'button'}
                            Id={'add_refund_row'}
                            CustomClass={'w-[130px]'}
                            Action={addRefundRow}
                        />
                    </div>
                    {refundRows.length === 0 && (
                        <p className="text-xs text-gray-500">No refund rows added.</p>
                    )}
                    {refundRows.map((row, i) => (
                        <div key={i} className="mb-3 grid grid-cols-1 items-end gap-3 md:grid-cols-[1fr,1fr,auto]">
                            <Input
                                InputName={'Label / Deadline'}
                                Id={`refund_schedule_${i}_label`}
                                Name={`refund_schedule_${i}_label`}
                                Type={'text'}
                                Placeholder={'e.g. 7+ days before'}
                                Value={row.label}
                                Action={(e) => updateRefundRow(i, 'label', e.target.value)}
                            />
                            <Input
                                InputName={'Refund Percent'}
                                Id={`refund_schedule_${i}_refund_percent`}
                                Name={`refund_schedule_${i}_refund_percent`}
                                Type={'number'}
                                Placeholder={'0 - 100'}
                                Value={row.refund_percent}
                                Action={(e) => updateRefundRow(i, 'refund_percent', e.target.value)}
                            />
                            <PrimaryButton
                                Type={'button'}
                                Id={`remove_refund_row_${i}`}
                                Action={() => removeRefundRow(i)}
                                CustomClass={'w-[50px] bg-red-500 hover:bg-red-600 mb-2 [&>div]:hidden'}
                                Text={'X'}
                            />
                        </div>
                    ))}
                </div>

                {/* Online-eligible fees + their online toggles */}
                <div className="mt-6">
                    <h5 className="mb-2 text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                        Online-charged fees
                    </h5>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Input
                            InputName={'Service Fee'}
                            Id={'service_fee'}
                            Name={'service_fee'}
                            Type={'number'}
                            Value={cancellation.service_fee}
                            Error={errors['cancellation_policy.service_fee']}
                            Action={(e) => updatePolicy('cancellation_policy', 'service_fee', e.target.value)}
                        />
                        <ToggleField
                            id={'service_fee_online'}
                            label={'Service Fee Charged Online'}
                            checked={cancellation.service_fee_online}
                            onChange={(v) => updatePolicy('cancellation_policy', 'service_fee_online', v)}
                        />
                        <Input
                            InputName={'Cleaning Fee'}
                            Id={'cleaning_fee'}
                            Name={'cleaning_fee'}
                            Type={'number'}
                            Value={cancellation.cleaning_fee}
                            Error={errors['cancellation_policy.cleaning_fee']}
                            Action={(e) => updatePolicy('cancellation_policy', 'cleaning_fee', e.target.value)}
                        />
                        <ToggleField
                            id={'cleaning_fee_online'}
                            label={'Cleaning Fee Charged Online'}
                            checked={cancellation.cleaning_fee_online}
                            onChange={(v) => updatePolicy('cancellation_policy', 'cleaning_fee_online', v)}
                        />
                        <Input
                            InputName={'Tax Amount'}
                            Id={'tax_amount'}
                            Name={'tax_amount'}
                            Type={'number'}
                            Value={cancellation.tax_amount}
                            Error={errors['cancellation_policy.tax_amount']}
                            Action={(e) => updatePolicy('cancellation_policy', 'tax_amount', e.target.value)}
                        />
                        <ToggleField
                            id={'tax_online'}
                            label={'Tax Charged Online'}
                            checked={cancellation.tax_online}
                            onChange={(v) => updatePolicy('cancellation_policy', 'tax_online', v)}
                        />
                    </div>
                </div>

                {/* On-site / display-only fees */}
                <div className="mt-6">
                    <h5 className="mb-1 text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                        On-site fees
                    </h5>
                    <p className="mb-3 text-xs text-gray-400">
                        Shown to the guest, not charged online at launch.
                    </p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Input InputName={'Extra Guest Fee'} Id={'extra_guest_fee'} Name={'extra_guest_fee'} Type={'number'} Value={cancellation.extra_guest_fee} Error={errors['cancellation_policy.extra_guest_fee']} Action={(e) => updatePolicy('cancellation_policy', 'extra_guest_fee', e.target.value)} />
                        <Input InputName={'Child Fee'} Id={'child_fee'} Name={'child_fee'} Type={'number'} Value={cancellation.child_fee} Error={errors['cancellation_policy.child_fee']} Action={(e) => updatePolicy('cancellation_policy', 'child_fee', e.target.value)} />
                        <Input InputName={'Pet Fee'} Id={'pet_fee'} Name={'pet_fee'} Type={'number'} Value={cancellation.pet_fee} Error={errors['cancellation_policy.pet_fee']} Action={(e) => updatePolicy('cancellation_policy', 'pet_fee', e.target.value)} />
                        <Input InputName={'Extension Fee'} Id={'extension_fee'} Name={'extension_fee'} Type={'number'} Value={cancellation.extension_fee} Error={errors['cancellation_policy.extension_fee']} Action={(e) => updatePolicy('cancellation_policy', 'extension_fee', e.target.value)} />
                        <Input InputName={'Security Deposit'} Id={'security_deposit'} Name={'security_deposit'} Type={'number'} Value={cancellation.security_deposit} Error={errors['cancellation_policy.security_deposit']} Action={(e) => updatePolicy('cancellation_policy', 'security_deposit', e.target.value)} />
                        <Input InputName={'On-site Payment Amount'} Id={'onsite_payment_amount'} Name={'onsite_payment_amount'} Type={'number'} Value={cancellation.onsite_payment_amount} Error={errors['cancellation_policy.onsite_payment_amount']} Action={(e) => updatePolicy('cancellation_policy', 'onsite_payment_amount', e.target.value)} />
                        <Input InputName={'Damage Fee'} Id={'damage_fee'} Name={'damage_fee'} Type={'number'} Value={cancellation.damage_fee} Error={errors['cancellation_policy.damage_fee']} Action={(e) => updatePolicy('cancellation_policy', 'damage_fee', e.target.value)} />
                        <Input InputName={'Minibar / Incidental Fee'} Id={'minibar_incidental_fee'} Name={'minibar_incidental_fee'} Type={'number'} Value={cancellation.minibar_incidental_fee} Error={errors['cancellation_policy.minibar_incidental_fee']} Action={(e) => updatePolicy('cancellation_policy', 'minibar_incidental_fee', e.target.value)} />
                        <Input InputName={'On-site Tax'} Id={'onsite_tax'} Name={'onsite_tax'} Type={'number'} Value={cancellation.onsite_tax} Error={errors['cancellation_policy.onsite_tax']} Action={(e) => updatePolicy('cancellation_policy', 'onsite_tax', e.target.value)} />
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4">
                    <Textarea InputName={'No-show Policy'} Id={'no_show_policy'} Name={'no_show_policy'} Value={cancellation.no_show_policy} Error={errors['cancellation_policy.no_show_policy']} Action={(e) => updatePolicy('cancellation_policy', 'no_show_policy', e.target.value)} />
                    <Textarea InputName={'Rejection Refund Policy'} Id={'rejection_refund_policy'} Name={'rejection_refund_policy'} Value={cancellation.rejection_refund_policy} Error={errors['cancellation_policy.rejection_refund_policy']} Action={(e) => updatePolicy('cancellation_policy', 'rejection_refund_policy', e.target.value)} />
                    <Textarea InputName={'Non-refundable Reasons'} Id={'non_refundable_reasons'} Name={'non_refundable_reasons'} Value={cancellation.non_refundable_reasons} Error={errors['cancellation_policy.non_refundable_reasons']} Action={(e) => updatePolicy('cancellation_policy', 'non_refundable_reasons', e.target.value)} />
                    <Textarea InputName={'Damage Policy'} Id={'damage_policy'} Name={'damage_policy'} Value={cancellation.damage_policy} Error={errors['cancellation_policy.damage_policy']} Action={(e) => updatePolicy('cancellation_policy', 'damage_policy', e.target.value)} />
                </div>
            </Accordion>
        </div>
    );
}
