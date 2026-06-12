import React, { useState } from 'react';
import DisplayPrice from '@/Components/DisplayPrice';

const hasValue = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (Array.isArray(value)) return value.length > 0;
    return value !== false;
};

const hasPositiveNumber = (value) => value !== null && value !== undefined && Number(value) > 0;

// Exported so the feed headers (DesktopFeed / LodgingMobileFeedGallery) route property_type through
// the SAME snake_case -> Title Case transform, so the __() key matches the seeded global label.
export const humanize = (value) => {
    if (!hasValue(value)) return '';
    return String(value)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatMoney = (value, currency) => {
    if (!hasValue(value) || Number.isNaN(Number(value)) || Number(value) <= 0) return null;
    // Display-only thousand separators (1000 -> 1,000.00); never alters the stored value.
    const formatted = Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return `${currency ?? ''} ${formatted}`.trim();
};

// On-site fee for display: a present free-text override (already translated server-side with English
// fallback) wins and is shown VERBATIM; otherwise the comma-formatted numeric amount. The text is
// NEVER passed into Number()/formatMoney. Returns null when neither is meaningful, so the row hides
// (consistent with formatMoney's null contract + the DetailGrid/PolicyAccordion value filter).
const feeValue = (displayText, amount, currency) =>
    hasValue(displayText) ? String(displayText).trim() : formatMoney(amount, currency);

const formatList = (value, __) => {
    const items = Array.isArray(value) ? value : [value];
    return items
        .filter(hasValue)
        .map((item) => {
            // bed_types is stored as an array of string keys (e.g. 'king'); defensively unwrap an
            // object item too ({type|name|value}) so it can never stringify to "[object Object]".
            const raw =
                item && typeof item === 'object'
                    ? (item.type ?? item.name ?? item.value ?? '')
                    : item;
            const label = humanize(raw);
            const translated = __(label);
            // While translations are still loading, __ returns a React element (the "Loading...."
            // span); joining those with .join(', ') would stringify to "[object Object]". Fall back
            // to the humanized string so the list always renders as readable text.
            return typeof translated === 'string' ? translated : label;
        })
        .join(', ');
};

// free_cancellation_deadline may be a bare number (e.g. 48 -> hours) or a descriptive string
// (e.g. "7 days before"). Humanize the number case; show a string as-is.
const formatCancellationDeadline = (value, __) => {
    if (!hasValue(value)) return null;
    const str = String(value).trim();
    return /^\d+$/.test(str) ? `${str} ${__('hours')}` : str;
};

// refund_schedule is a JSON array of { label, refund_percent } rows (dashboard repeater). Render a
// readable summary ("7+ days before: 50%, ...") instead of the raw objects ("[object Object]").
const formatRefundSchedule = (value) => {
    if (!Array.isArray(value) || value.length === 0) return null;
    return value
        .map((row) => {
            if (!row || typeof row !== 'object') return String(row ?? '');
            const label = String(row.label ?? '').trim();
            const pct = row.refund_percent;
            const pctText =
                pct !== null && pct !== undefined && String(pct).trim() !== '' ? `${pct}%` : '';
            return [label, pctText].filter(Boolean).join(': ');
        })
        .filter((part) => part !== '')
        .join(', ');
};

const isMeaningfulPolicyValue = (value) => {
    if (!hasValue(value)) return false;
    if (!Number.isNaN(Number(value)) && String(value).trim() !== '') return Number(value) > 0;
    if (typeof value === 'number') return value > 0;
    return true;
};

const hasMeaningfulPolicy = (policy, fields) => {
    if (!policy) return false;
    return fields.some((field) => isMeaningfulPolicyValue(policy[field]));
};

const DetailGrid = ({ items }) => {
    const visibleItems = items.filter((item) => hasValue(item.value));
    if (visibleItems.length === 0) return null;

    return (
        <div className="grid grid-cols-1 gap-2 mt-3 sm:grid-cols-2">
            {visibleItems.map((item) => (
                <div
                    key={item.label}
                    className="px-3 py-2 text-xs rounded-sm bg-surface-1-light dark:bg-surface-2-dark"
                >
                    <span className="font-medium text-main-text-light dark:text-main-text-dark">
                        {item.label}:
                    </span>{' '}
                    <span className="text-sub-text-light dark:text-sub-text-dark">
                        {item.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

const FeatureBadges = ({ items }) => {
    const visibleItems = items.filter((item) => item.active);
    if (visibleItems.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 mt-3">
            {visibleItems.map((item) => (
                <span
                    key={item.label}
                    className="px-3 py-1 text-xs rounded-full bg-surface-1-light text-main-text-light dark:bg-surface-2-dark dark:text-main-text-dark"
                >
                    {item.label}
                </span>
            ))}
        </div>
    );
};

const AmenityBadges = ({ amenities, __ }) => {
    if (!Array.isArray(amenities) || amenities.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 mt-3">
            {amenities.map((amenity) => (
                <span
                    key={amenity.id}
                    className="px-3 py-1 text-xs transition-colors rounded-full bg-surface-1-light text-main-text-light hover:bg-surface-2-light dark:bg-surface-2-dark dark:text-main-text-dark dark:hover:bg-surface-3-dark"
                >
                    {amenity.icon && <span className="mr-1">{amenity.icon}</span>}
                    {/* Stage 3.4.3 — amenity name is a global System-2 label (key = the stored name). */}
                    {__(amenity.name)}
                </span>
            ))}
        </div>
    );
};

// Each policy renders as an accordion item cloned from SmartphoneContentAccordion (same button /
// chevron / divider classes + toggle pattern) — open by default, toggleable. The body is a tabular
// list of key-value rows (label left muted, value right). Rendered only when it has visible rows.
const PolicyAccordion = ({ title, rows }) => {
    const visibleRows = rows.filter((row) => hasValue(row.value));
    const [isOpen, setIsOpen] = useState(true);

    if (visibleRows.length === 0) return null;

    return (
        <div className="w-full">
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                className="flex items-center justify-between w-full px-2 py-4 -mx-2 text-left transition-colors rounded-md focus:outline-none "
                aria-expanded={isOpen}
            >
                <span className="flex-1 min-w-0 pr-2 text-base font-medium truncate text-main-text-light dark:text-main-text-dark">
                    {title}
                </span>
                <svg
                    className={`h-5 w-5 flex-shrink-0 text-main-text-light transition-transform duration-200 dark:text-main-text-dark ${
                        isOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="flex flex-col pt-2 pb-2">
                    {visibleRows.map((row) => {
                        // Long paragraph values (check-in instructions, no-show / damage / party
                        // policies, noise restriction, etc.) read better left-aligned and wrapped;
                        // short values (times, fees, enums, booleans) stay right-aligned.
                        const isLong = String(row.value ?? '').length > 60;
                        return (
                            <div
                                key={row.label}
                                className="flex items-start gap-3 py-2 border-b border-surface-3-light dark:border-surface-3-dark last:border-0"
                            >
                                <span className="w-2/5 text-sm leading-snug shrink-0 text-main-text-light dark:text-main-text-dark">
                                    {row.label}
                                </span>
                                <span
                                    className={`flex-1 break-words text-sm leading-snug ${
                                        isLong ? 'whitespace-pre-line text-left' : 'text-right'
                                    } ${
                                        row.tone === 'warning'
                                            ? 'font-semibold text-red-600 dark:text-red-400'
                                            : 'text-main-text-light dark:text-main-text-dark'
                                    }`}
                                >
                                    {row.value}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="h-px w-full bg-[#c8c8c8] dark:bg-surface-3-dark" />
        </div>
    );
};

const RatePlan = ({ lodging, room, plan, openReservationPanel, __ }) => {
    const canReserve =
        room?.is_available !== false && plan?.is_bookable !== false && plan?.is_active !== false;
    const originalPrice = Number(plan?.original_price);
    const salePrice = Number(plan?.sale_price);
    const hasDiscount =
        hasPositiveNumber(plan?.original_price) &&
        hasPositiveNumber(plan?.sale_price) &&
        originalPrice > salePrice;

    return (
        <div className="p-4 transition-colors border rounded-md border-surface-3-light bg-surface-1-light dark:border-surface-3-dark dark:bg-surface-2-dark ">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <span className="block min-w-0 text-xs font-semibold break-words text-main-text-light dark:text-main-text-dark">
                        {plan.name}
                    </span>
                    {plan.sale_price != null && (
                        <div className="mt-2">
                            {/* Struck original price + discount pill on their own line (no collision). */}
                            {hasDiscount && (
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="text-xs line-through text-sub-text-light dark:text-sub-text-dark">
                                        {formatMoney(plan.original_price, lodging.currency_code)}
                                    </span>
                                    {hasPositiveNumber(plan.discount_rate) && (
                                        <span className="rounded-full bg-surface-3-light px-2 py-0.5 text-[11px] font-semibold text-main-text-light dark:bg-surface-3-dark dark:text-main-text-dark">
                                            {Number(plan.discount_rate).toFixed(0)}% {__('off')}
                                        </span>
                                    )}
                                </div>
                            )}
                            {/* Sale price in its own block — DisplayPrice's USD / approx / payment-note
                                lines stack cleanly with breathing room. */}
                            <DisplayPrice
                                usdAmount={plan.sale_price}
                                isLodgingProduct={true}
                                paymentDisplay={true}
                                size="sm"
                                className="text-main-text-light dark:text-main-text-dark"
                            />
                        </div>
                    )}
                    <DetailGrid
                        items={[
                            {
                                label: __('Stay type'),
                                value: plan.stay_type ? __(humanize(plan.stay_type)) : null,
                            },
                            {
                                label: __('Min'),
                                value: hasPositiveNumber(plan.minimum_nights)
                                    ? `${plan.minimum_nights} ${__('nights')}`
                                    : null,
                            },
                            {
                                label: __('Max'),
                                value: hasPositiveNumber(plan.maximum_nights)
                                    ? `${plan.maximum_nights} ${__('nights')}`
                                    : null,
                            },
                            { label: __('Booking cutoff'), value: plan.booking_cutoff_time },
                            { label: __('Rooms left'), value: plan.remaining_room_count },
                        ]}
                    />
                    <FeatureBadges
                        items={[
                            {
                                label: __('Breakfast included'),
                                active: plan.breakfast_included === true,
                            },
                            {
                                label: __('Free parking'),
                                active: plan.free_parking_included === true,
                            },
                            {
                                label: __('Early check-in'),
                                active: plan.early_checkin_included === true,
                            },
                            {
                                label: __('Late check-out'),
                                active: plan.late_checkout_included === true,
                            },
                            {
                                label: __('Free cancellation'),
                                active: plan.is_cancellable === true,
                            },
                            {
                                label: __('Non-refundable'),
                                active: plan.is_non_refundable === true,
                            },
                            {
                                label: __('Crypto accepted'),
                                active: plan.crypto_supported === true,
                            },
                            {
                                label: __('Same-day booking'),
                                active: plan.same_day_booking_allowed === true,
                            },
                            {
                                label: __('No consecutive nights'),
                                active: plan.consecutive_nights_allowed === false,
                            },
                        ]}
                    />
                    {!canReserve && lodging?.is_reservation_closed !== true && (
                        <span className="block mt-2 text-xs italic text-sub-text-light dark:text-sub-text-dark">
                            {__('Not available for reservation')}
                        </span>
                    )}
                </div>
                {lodging?.is_reservation_closed !== true && (
                    <button
                        type="button"
                        disabled={!canReserve}
                        onClick={
                            canReserve
                                ? () => openReservationPanel({ lodging, room, ratePlan: plan })
                                : undefined
                        }
                        className={`shrink-0 rounded-md bg-main-text-light px-4 py-2 text-xs font-semibold text-main-text-dark transition hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80 ${
                            canReserve
                                ? ''
                                : 'cursor-not-allowed opacity-50 hover:bg-main-text-light dark:hover:bg-main-text-dark'
                        }`}
                    >
                        {__('Reserve')}
                    </button>
                )}
            </div>
        </div>
    );
};

const RoomCard = ({ lodging, room, openReservationPanel, __ }) => (
    <div className="p-4 border rounded-md border-surface-3-light dark:border-surface-3-dark">
        <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold break-words text-main-text-light dark:text-main-text-dark">
                {room.room_name}
            </p>
            {room.room_type && (
                <p className="text-xs capitalize text-sub-text-light dark:text-sub-text-dark">
                    {__(humanize(room.room_type))}
                </p>
            )}
            {(room.max_guests != null || room.standard_guests != null) && (
                <p className="text-xs text-sub-text-light dark:text-sub-text-dark">
                    {__('Sleeps')} {room.max_guests ?? room.standard_guests}
                </p>
            )}
        </div>

        <DetailGrid
            items={[
                {
                    label: __('Bedrooms'),
                    value: hasPositiveNumber(room.bedrooms_count) ? room.bedrooms_count : null,
                },
                {
                    label: __('Beds'),
                    value: hasPositiveNumber(room.beds_count) ? room.beds_count : null,
                },
                { label: __('Bed types'), value: formatList(room.bed_types, __) },
                { label: __('Bed size'), value: room.bed_size },
                {
                    label: __('Bathrooms'),
                    value: hasPositiveNumber(room.bathrooms_count) ? room.bathrooms_count : null,
                },
                {
                    label: __('Toilets'),
                    value: hasPositiveNumber(room.toilets_count) ? room.toilets_count : null,
                },
                {
                    label: __('View'),
                    // When the operator picked "Other" and entered a custom view, show that text
                    // verbatim (it is already the translatedValue from the payload, never blank).
                    // Fall back to the translated "Other" label if somehow no custom text was set.
                    // Every other enum value renders its System-2 humanized label as before.
                    value:
                        room.view_type === 'other'
                            ? hasValue(room.view_type_other)
                                ? room.view_type_other
                                : __(humanize('other'))
                            : room.view_type
                              ? __(humanize(room.view_type))
                              : null,
                },
                { label: __('Room size'), value: room.room_size },
                { label: __('Floor'), value: room.room_floor_label },
                { label: __('Rooms left'), value: room.remaining_room_count },
            ]}
        />

        <FeatureBadges
            items={[
                { label: __('Private bathroom'), active: room.is_bathroom_private === true },
                { label: __('Jacuzzi'), active: room.has_jacuzzi === true },
                { label: __('Bathtub'), active: room.has_bathtub === true },
                { label: __('Shower booth'), active: room.has_shower_booth === true },
                { label: __('Smoking allowed'), active: room.is_smoking_allowed === true },
                { label: __('Children allowed'), active: room.children_allowed === true },
                { label: __('Pets allowed'), active: room.pets_allowed === true },
            ]}
        />

        <AmenityBadges amenities={room.amenities} __={__} />

        {Array.isArray(room.rate_plans) && room.rate_plans.length > 0 && (
            <div className="flex flex-col gap-2 mt-3">
                {room.rate_plans.map((plan) => (
                    <RatePlan
                        key={plan.id}
                        lodging={lodging}
                        room={room}
                        plan={plan}
                        openReservationPanel={openReservationPanel}
                        __={__}
                    />
                ))}
            </div>
        )}
    </div>
);

const LodgingDetailSections = ({ lodging, openReservationPanel, __, variant = 'desktop' }) => {
    const dividerClass =
        variant === 'mobile'
            ? 'mb-4 h-px w-full bg-[#c8c8c8] dark:bg-surface-3-dark'
            : 'h-px w-full bg-[#c8c8c8] dark:bg-surface-3-dark';
    const sectionClass = variant === 'mobile' ? 'mb-4' : 'w-full';
    const rooms = Array.isArray(lodging?.rooms) ? lodging.rooms : [];
    const amenities = Array.isArray(lodging?.amenities) ? lodging.amenities : [];
    const policies = lodging?.policies || {};
    const currency = lodging?.currency_code;
    const checkin = policies.checkin;
    const cancellation = policies.cancellation;
    const parking = policies.parking;

    // Property floor: show the configured RANGE ("1F - 3F") when present, otherwise the single
    // anchor floor name. floor_range is pre-built by the payload builder; floor is the anchor object.
    const floorDisplay = hasValue(lodging?.floor_range)
        ? lodging.floor_range
        : lodging?.floor?.name ?? null;

    const checkinFields = [
        'checkin_time',
        'checkout_time',
        'early_checkin_available',
        'early_checkin_fee',
        'early_checkin_fee_display_text',
        'late_checkout_available',
        'late_checkout_fee',
        'late_checkout_fee_display_text',
        'checkin_method',
        'front_desk_available',
        'self_checkin_available',
        'contactless_checkin_available',
        'host_meet_checkin_available',
        'instructions_sent_when',
        'same_day_booking_notice',
        'early_entry_penalty',
        'late_checkout_penalty',
        'id_verification_required',
        'minor_policy',
        'mixed_gender_policy',
        'noise_party_restriction',
        'party_policy',
        'checkin_instruction_message',
    ];
    const cancellationFields = [
        'policy_name',
        'free_cancellation_deadline',
        'refund_schedule',
        'no_show_policy',
        'rejection_refund_policy',
        'non_refundable_reasons',
        'requires_admin_confirmation',
        'service_fee',
        'cleaning_fee',
        'tax_amount',
        'extra_guest_fee',
        'extra_guest_fee_display_text',
        'child_fee',
        'child_fee_display_text',
        'pet_fee',
        'pet_fee_display_text',
        'extension_fee',
        'extension_fee_display_text',
        'security_deposit',
        'security_deposit_display_text',
        'onsite_payment_amount',
        'onsite_payment_amount_display_text',
        'damage_fee',
        'damage_fee_display_text',
        'minibar_incidental_fee',
        'minibar_incidental_fee_display_text',
        'onsite_tax',
        'onsite_tax_display_text',
        'damage_policy',
    ];
    const parkingFields = [
        'parking_available',
        'parking_free',
        'spaces_per_room',
        'parking_type',
        'pre_registration_required',
        'parking_availability_time',
        'before_checkin_after_checkout',
        'full_lot_policy',
        'nearby_parking_available',
        'fee_paid_by_guest',
        'vehicle_height_limit',
        'large_vehicle_restrictions',
        'modified_vehicle_restriction',
        'supercar_restriction',
        'ev_charging_available',
        'refund_if_no_parking',
        'extra_parking_fee',
        'extra_parking_fee_display_text',
    ];

    const showCheckin = hasMeaningfulPolicy(checkin, checkinFields);
    const showCancellation = hasMeaningfulPolicy(cancellation, cancellationFields);
    const showParking = hasMeaningfulPolicy(parking, parkingFields);
    const showPolicies = showCheckin || showCancellation || showParking;

    return (
        <>
            {hasValue(floorDisplay) && (
                <div className={sectionClass}>
                    <DetailGrid items={[{ label: __('Floor'), value: floorDisplay }]} />
                </div>
            )}

            {rooms.length > 0 && (
                <>
                    <div className={dividerClass} />
                    <div className={sectionClass}>
                        <h3 className="mb-3 text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                            {__('Rooms')}
                        </h3>
                        {lodging?.is_reservation_closed === true && (
                            <p className="mb-3 text-sm italic text-sub-text-light dark:text-sub-text-dark">
                                {__('Not available for reservation')}
                            </p>
                        )}
                        <div className="flex flex-col gap-3">
                            {rooms.map((room) => (
                                <RoomCard
                                    key={room.id}
                                    lodging={lodging}
                                    room={room}
                                    openReservationPanel={openReservationPanel}
                                    __={__}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}

            {amenities.length > 0 && (
                <>
                    <div className={dividerClass} />
                    <div className={sectionClass}>
                        <h3 className="mb-3 text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                            {__('Amenities')}
                        </h3>
                        <AmenityBadges amenities={amenities} __={__} />
                    </div>
                </>
            )}

            {showPolicies && (
                <>
                    <div className={dividerClass} />
                    <div className={sectionClass}>
                        <h3 className="mb-3 text-lg font-semibold text-main-text-light dark:text-main-text-dark">
                            {__('Policies')}
                        </h3>
                        <div className="flex flex-col gap-3">
                            {showCheckin && (
                                <PolicyAccordion
                                    title={__('Check-in Policy')}
                                    rows={[
                                        { label: __('Check-in'), value: checkin.checkin_time },
                                        { label: __('Check-out'), value: checkin.checkout_time },
                                        {
                                            label: __('Check-in method'),
                                            value: checkin.checkin_method
                                                ? __(humanize(checkin.checkin_method))
                                                : null,
                                        },
                                        {
                                            label: __('Early check-in'),
                                            value: checkin.early_checkin_available
                                                ? __('Available')
                                                : null,
                                        },
                                        {
                                            label: __('Early check-in fee'),
                                            value: feeValue(
                                                checkin.early_checkin_fee_display_text,
                                                checkin.early_checkin_fee,
                                                currency,
                                            ),
                                        },
                                        {
                                            label: __('Late check-out'),
                                            value: checkin.late_checkout_available
                                                ? __('Available')
                                                : null,
                                        },
                                        {
                                            label: __('Late check-out fee'),
                                            value: feeValue(
                                                checkin.late_checkout_fee_display_text,
                                                checkin.late_checkout_fee,
                                                currency,
                                            ),
                                        },
                                        {
                                            label: __('Front desk'),
                                            value: checkin.front_desk_available
                                                ? __('Available')
                                                : null,
                                        },
                                        {
                                            label: __('Self check-in'),
                                            value: checkin.self_checkin_available
                                                ? __('Available')
                                                : null,
                                        },
                                        {
                                            label: __('Contactless check-in'),
                                            value: checkin.contactless_checkin_available
                                                ? __('Available')
                                                : null,
                                        },
                                        {
                                            label: __('Host meet check-in'),
                                            value: checkin.host_meet_checkin_available
                                                ? __('Available')
                                                : null,
                                        },
                                        {
                                            label: __('Instructions sent'),
                                            value: checkin.instructions_sent_when,
                                        },
                                        {
                                            label: __('Same-day booking notice'),
                                            value: checkin.same_day_booking_notice,
                                        },
                                        {
                                            label: __('Early entry penalty'),
                                            value: checkin.early_entry_penalty,
                                        },
                                        {
                                            label: __('Late check-out penalty'),
                                            value: checkin.late_checkout_penalty,
                                        },
                                        {
                                            label: __('ID verification required'),
                                            value: checkin.id_verification_required
                                                ? __('Required')
                                                : null,
                                        },
                                        { label: __('Minor policy'), value: checkin.minor_policy },
                                        {
                                            label: __('Mixed gender policy'),
                                            value: checkin.mixed_gender_policy,
                                        },
                                        {
                                            label: __('Noise restriction'),
                                            value: checkin.noise_party_restriction,
                                        },
                                        { label: __('Party policy'), value: checkin.party_policy },
                                        {
                                            label: __('Check-in instructions'),
                                            value: checkin.checkin_instruction_message,
                                        },
                                    ]}
                                />
                            )}
                            {showCancellation && (
                                <PolicyAccordion
                                    title={__('Cancellation Policy')}
                                    rows={[
                                        {
                                            label: __('Cancellation'),
                                            value: cancellation.policy_name
                                                ? __(humanize(cancellation.policy_name))
                                                : null,
                                        },
                                        {
                                            label: __('Free cancellation until'),
                                            value: formatCancellationDeadline(
                                                cancellation.free_cancellation_deadline,
                                                __,
                                            ),
                                        },
                                        {
                                            label: __('Refund schedule'),
                                            value: formatRefundSchedule(
                                                cancellation.refund_schedule,
                                            ),
                                        },
                                        {
                                            label: __('No-show policy'),
                                            value: cancellation.no_show_policy,
                                        },
                                        {
                                            label: __('Rejection refund policy'),
                                            value: cancellation.rejection_refund_policy,
                                        },
                                        {
                                            label: __('Non-refundable reasons'),
                                            value: cancellation.non_refundable_reasons,
                                        },
                                        {
                                            label: __('Admin confirmation'),
                                            value: cancellation.requires_admin_confirmation
                                                ? __('Required')
                                                : null,
                                        },
                                        {
                                            label: __('Service fee'),
                                            value: formatMoney(cancellation.service_fee, currency),
                                        },
                                        {
                                            label: __('Cleaning fee'),
                                            value: formatMoney(cancellation.cleaning_fee, currency),
                                        },
                                        {
                                            label: __('Tax'),
                                            value: formatMoney(cancellation.tax_amount, currency),
                                        },
                                        {
                                            label: __('Extra guest fee'),
                                            value: feeValue(
                                                cancellation.extra_guest_fee_display_text,
                                                cancellation.extra_guest_fee,
                                                currency,
                                            ),
                                        },
                                        {
                                            label: __('Child fee'),
                                            value: feeValue(
                                                cancellation.child_fee_display_text,
                                                cancellation.child_fee,
                                                currency,
                                            ),
                                        },
                                        {
                                            label: __('Pet fee'),
                                            value: feeValue(
                                                cancellation.pet_fee_display_text,
                                                cancellation.pet_fee,
                                                currency,
                                            ),
                                        },
                                        {
                                            label: __('Extension fee'),
                                            value: feeValue(
                                                cancellation.extension_fee_display_text,
                                                cancellation.extension_fee,
                                                currency,
                                            ),
                                        },
                                        {
                                            label: __('Security deposit'),
                                            value: feeValue(
                                                cancellation.security_deposit_display_text,
                                                cancellation.security_deposit,
                                                currency,
                                            ),
                                        },
                                        {
                                            label: __('Onsite payment amount'),
                                            value: feeValue(
                                                cancellation.onsite_payment_amount_display_text,
                                                cancellation.onsite_payment_amount,
                                                currency,
                                            ),
                                        },
                                        {
                                            label: __('Damage fee'),
                                            value: feeValue(
                                                cancellation.damage_fee_display_text,
                                                cancellation.damage_fee,
                                                currency,
                                            ),
                                        },
                                        {
                                            label: __('Minibar incidental fee'),
                                            value: feeValue(
                                                cancellation.minibar_incidental_fee_display_text,
                                                cancellation.minibar_incidental_fee,
                                                currency,
                                            ),
                                        },
                                        {
                                            label: __('Onsite tax'),
                                            value: feeValue(
                                                cancellation.onsite_tax_display_text,
                                                cancellation.onsite_tax,
                                                currency,
                                            ),
                                        },
                                        {
                                            label: __('Damage policy'),
                                            value: cancellation.damage_policy,
                                        },
                                    ]}
                                />
                            )}
                            {showParking && (
                                <PolicyAccordion
                                    title={__('Parking Policy')}
                                    rows={[
                                        {
                                            // Single, clear parking availability state at the TOP of
                                            // the section. Unavailable when EITHER the operator turned
                                            // the parking_available toggle OFF (=== false) OR the type
                                            // is 'no_parking' — reconciled into one "Not available"
                                            // line (prominent, tone: warning) so the page never gives
                                            // the misleading impression that parking is available.
                                            // The remaining parking detail rows below stay visible.
                                            // null only when availability is genuinely unknown
                                            // (not configured and not no_parking).
                                            label: __('Parking'),
                                            value:
                                                parking.parking_type === 'no_parking' ||
                                                parking.parking_available === false
                                                    ? __('Not available')
                                                    : parking.parking_available === true
                                                      ? __('Available')
                                                      : null,
                                            tone:
                                                parking.parking_type === 'no_parking' ||
                                                parking.parking_available === false
                                                    ? 'warning'
                                                    : undefined,
                                        },
                                        {
                                            label: __('Free parking'),
                                            value: parking.parking_free ? __('Available') : null,
                                        },
                                        {
                                            label: __('Spaces per room'),
                                            value: parking.spaces_per_room,
                                        },
                                        {
                                            label: __('Parking type'),
                                            // Suppress for 'no_parking' — the "Parking" row above
                                            // already shows the not-available label, so this would
                                            // just repeat it.
                                            value:
                                                parking.parking_type &&
                                                parking.parking_type !== 'no_parking'
                                                    ? __(humanize(parking.parking_type))
                                                    : null,
                                        },
                                        {
                                            label: __('Pre-registration required'),
                                            value: parking.pre_registration_required
                                                ? __('Required')
                                                : null,
                                        },
                                        {
                                            label: __('Parking availability time'),
                                            value: parking.parking_availability_time,
                                        },
                                        {
                                            label: __('Before check-in / after check-out'),
                                            value: parking.before_checkin_after_checkout,
                                        },
                                        {
                                            label: __('Full lot policy'),
                                            value: parking.full_lot_policy,
                                        },
                                        {
                                            label: __('Nearby parking'),
                                            value: parking.nearby_parking_available
                                                ? __('Available')
                                                : null,
                                        },
                                        {
                                            label: __('Fee paid by guest'),
                                            value: parking.fee_paid_by_guest
                                                ? __('Required')
                                                : null,
                                        },
                                        {
                                            label: __('Vehicle height limit'),
                                            value: parking.vehicle_height_limit,
                                        },
                                        {
                                            label: __('Large vehicle restrictions'),
                                            value: parking.large_vehicle_restrictions,
                                        },
                                        {
                                            label: __('Modified vehicle restriction'),
                                            value: parking.modified_vehicle_restriction,
                                        },
                                        {
                                            label: __('Supercar restriction'),
                                            value: parking.supercar_restriction,
                                        },
                                        {
                                            label: __('EV charging'),
                                            value: parking.ev_charging_available
                                                ? __('Available')
                                                : null,
                                        },
                                        {
                                            label: __('Refund if no parking'),
                                            value: parking.refund_if_no_parking
                                                ? __('Available')
                                                : null,
                                        },
                                        {
                                            label: __('Extra parking fee'),
                                            value: feeValue(
                                                parking.extra_parking_fee_display_text,
                                                parking.extra_parking_fee,
                                                currency,
                                            ),
                                        },
                                    ]}
                                />
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default LodgingDetailSections;
