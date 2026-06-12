<?php

namespace App\Models;

use App\Traits\HasContentTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LodgingCheckinPolicy extends Model
{
    use HasContentTranslations;

    // System 1 customer-facing free-text only. checkin_method is a preset enum (System 2);
    // the *_available bools, times, numeric fees, and id_verification_required bool are excluded.
    // The optional on-site fee *_display_text companions ARE translatable (English fallback).
    protected array $translatableFields = ['instructions_sent_when', 'same_day_booking_notice', 'early_entry_penalty', 'late_checkout_penalty', 'minor_policy', 'mixed_gender_policy', 'noise_party_restriction', 'party_policy', 'checkin_instruction_message', 'early_checkin_fee_display_text', 'late_checkout_fee_display_text'];

    protected $table = 'lodging_checkin_policies';

    protected $fillable = [
        'lodging_product_id',
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

    // RelationShip
    public function lodgingProduct(): BelongsTo
    {
        return $this->belongsTo(LodgingProduct::class, 'lodging_product_id', 'id');
    }

    // Casting
    protected $casts = [
        'early_checkin_available' => 'boolean',
        'late_checkout_available' => 'boolean',
        'id_verification_required' => 'boolean',
        'front_desk_available' => 'boolean',
        'self_checkin_available' => 'boolean',
        'contactless_checkin_available' => 'boolean',
        'host_meet_checkin_available' => 'boolean',
    ];
}
