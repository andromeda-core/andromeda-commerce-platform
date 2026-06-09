<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LodgingParkingPolicy extends Model
{
    protected $table = 'lodging_parking_policies';

    protected $fillable = [
        'lodging_product_id',
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
    ];

    // RelationShip
    public function lodgingProduct(): BelongsTo
    {
        return $this->belongsTo(LodgingProduct::class, 'lodging_product_id', 'id');
    }

    // Casting
    protected $casts = [
        'parking_available' => 'boolean',
        'parking_free' => 'boolean',
        'pre_registration_required' => 'boolean',
        'nearby_parking_available' => 'boolean',
        'fee_paid_by_guest' => 'boolean',
        'ev_charging_available' => 'boolean',
        'refund_if_no_parking' => 'boolean',
    ];
}
