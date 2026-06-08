<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;

class LodgingRatePlan extends Model
{
    protected $table = 'lodging_rate_plans';

    protected $fillable = [
        'lodging_room_id',
        'name',
        'original_price',
        'sale_price',
        'discount_rate',
        'member_price',
        'crypto_supported',
        'payment_methods',
        'is_cancellable',
        'is_non_refundable',
        'breakfast_included',
        'free_parking_included',
        'early_checkin_included',
        'late_checkout_included',
        'consecutive_nights_allowed',
        'remaining_room_count',
        'is_bookable',
        'is_active',
        'external_rate_plan_id',
    ];

    // RelationShip
    public function lodgingRoom(): BelongsTo
    {
        return $this->belongsTo(LodgingRoom::class, 'lodging_room_id', 'id');
    }

    // Static Booting
    protected static function booted()
    {
        static::saving(function ($ratePlan) {
            Cache::tags(['feed'])->flush();
        });

        static::deleted(function ($ratePlan) {
            Cache::tags(['feed'])->flush();
        });
    }

    // Casting
    protected $casts = [
        'payment_methods' => 'array',
        'crypto_supported' => 'boolean',
        'is_cancellable' => 'boolean',
        'is_non_refundable' => 'boolean',
        'breakfast_included' => 'boolean',
        'free_parking_included' => 'boolean',
        'early_checkin_included' => 'boolean',
        'late_checkout_included' => 'boolean',
        'consecutive_nights_allowed' => 'boolean',
        'is_bookable' => 'boolean',
        'is_active' => 'boolean',
    ];
}
