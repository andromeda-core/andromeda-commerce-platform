<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LodgingCancellationPolicy extends Model
{
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
        'child_fee',
        'pet_fee',
        'extension_fee',
        'security_deposit',
        'onsite_payment_amount',
        'damage_fee',
        'minibar_incidental_fee',
        'onsite_tax',
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
