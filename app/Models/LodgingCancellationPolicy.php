<?php

namespace App\Models;

use App\Traits\HasContentTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LodgingCancellationPolicy extends Model
{
    use HasContentTranslations;

    // System 1 free-text only. policy_name is a preset enum (System 2). refund_schedule is a json
    // array of {label, refund_percent} and is a TRANSLATABLE ARRAY FIELD (Stage 3.4.6): the trait
    // json-decodes it on read, the service json-encodes the per-language override on write (same
    // mechanism as smartphone product_details). Only each row's label is translated; the customer
    // read path always takes refund_percent (and row order/count) from the English base row.
    // The 9 ON-SITE fee *_display_text companions are ALSO translatable free text (English fallback).
    // service_fee / cleaning_fee / tax_amount stay strictly numeric (online-payable) — no text column.
    protected array $translatableFields = ['no_show_policy', 'rejection_refund_policy', 'non_refundable_reasons', 'damage_policy', 'free_cancellation_deadline', 'refund_schedule', 'extra_guest_fee_display_text', 'child_fee_display_text', 'pet_fee_display_text', 'extension_fee_display_text', 'security_deposit_display_text', 'onsite_payment_amount_display_text', 'damage_fee_display_text', 'minibar_incidental_fee_display_text', 'onsite_tax_display_text'];

    protected $table = 'lodging_cancellation_policies';

    protected $fillable = [
        'lodging_product_id',
        'policy_name',
        'free_cancellation_deadline',
        'refund_schedule',
        'no_show_policy',
        'rejection_refund_policy',
        'non_refundable_reasons',
        'requires_admin_confirmation',
        'service_fee',
        'service_fee_online',
        'cleaning_fee',
        'cleaning_fee_online',
        'tax_amount',
        'tax_online',
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

    // RelationShip
    public function lodgingProduct(): BelongsTo
    {
        return $this->belongsTo(LodgingProduct::class, 'lodging_product_id', 'id');
    }

    // Casting
    protected $casts = [
        'refund_schedule' => 'array',
        'requires_admin_confirmation' => 'boolean',
        'service_fee_online' => 'boolean',
        'cleaning_fee_online' => 'boolean',
        'tax_online' => 'boolean',
    ];
}
