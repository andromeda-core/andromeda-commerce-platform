<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Cache;
use Str;

class LodgingProduct extends Model
{
    protected $table = 'lodging_products';

    protected $fillable = [
        'public_id',
        'property_name',
        'property_type',
        'city_region',
        'location_description',
        'latitude',
        'longitude',
        'location_name',
        'floor_id',
        'tag',
        'content',
        'base_checkin_time',
        'base_checkout_time',
        'from_price',
        'is_active',
        'is_reservation_closed',
        'assigned_dashboard_user_id',
        'booking_source',
        'source_of_truth',
        'sync_status',
        'external_provider',
        'external_listing_id',
        'external_api_render_mode',
        'external_api_payload_snapshot',
        'msap_uri',
        'msap_event_ref',
        'element_bundle',
        'msap_ready',
    ];

    // RelationShip
    public function rooms(): HasMany
    {
        return $this->hasMany(LodgingRoom::class, 'lodging_product_id', 'id');
    }

    public function media(): HasMany
    {
        return $this->hasMany(LodgingMedia::class, 'lodging_product_id', 'id')->orderBy('sort_order');
    }

    public function checkinPolicy(): HasOne
    {
        return $this->hasOne(LodgingCheckinPolicy::class, 'lodging_product_id', 'id');
    }

    public function parkingPolicy(): HasOne
    {
        return $this->hasOne(LodgingParkingPolicy::class, 'lodging_product_id', 'id');
    }

    public function cancellationPolicy(): HasOne
    {
        return $this->hasOne(LodgingCancellationPolicy::class, 'lodging_product_id', 'id');
    }

    public function floor(): BelongsTo
    {
        return $this->belongsTo(Floor::class, 'floor_id', 'id');
    }

    public function assignedDashboardUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_dashboard_user_id', 'id');
    }

    // Pivot
    public function amenities(): BelongsToMany
    {
        return $this->belongsToMany(LodgingAmenity::class, 'lodging_product_amenities', 'lodging_product_id', 'lodging_amenity_id');
    }

    // Static Booting
    protected static function booted()
    {
        static::created(function ($product) {
            if (empty($product->public_id)) {
                $product->public_id = 'lod_' . Str::uuid();
                $product->saveQuietly();
            }
        });

        static::saving(function ($product) {
            Cache::tags(['feed'])->flush();
        });

        static::deleted(function ($product) {
            Cache::tags(['feed'])->flush();
        });
    }

    // Casting
    protected $casts = [
        'external_api_payload_snapshot' => 'array',
        'element_bundle' => 'array',
        'is_active' => 'boolean',
        'is_reservation_closed' => 'boolean',
        'msap_ready' => 'boolean',
    ];
}
