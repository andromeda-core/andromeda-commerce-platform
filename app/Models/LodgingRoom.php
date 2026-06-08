<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

class LodgingRoom extends Model
{
    protected $table = 'lodging_rooms';

    protected $fillable = [
        'lodging_product_id',
        'room_name',
        'room_type',
        'standard_guests',
        'max_guests',
        'bedrooms_count',
        'beds_count',
        'bed_types',
        'bed_size',
        'bathrooms_count',
        'toilets_count',
        'is_bathroom_private',
        'has_jacuzzi',
        'has_bathtub',
        'has_shower_booth',
        'view_type',
        'room_size',
        'room_floor_label',
        'is_smoking_allowed',
        'children_allowed',
        'pets_allowed',
        'is_random_assignment',
        'remaining_room_count',
        'is_available',
        'external_room_id',
    ];

    // RelationShip
    public function lodgingProduct(): BelongsTo
    {
        return $this->belongsTo(LodgingProduct::class, 'lodging_product_id', 'id');
    }

    public function ratePlans(): HasMany
    {
        return $this->hasMany(LodgingRatePlan::class, 'lodging_room_id', 'id');
    }

    // Pivot
    public function amenities(): BelongsToMany
    {
        return $this->belongsToMany(LodgingAmenity::class, 'lodging_room_amenities', 'lodging_room_id', 'lodging_amenity_id');
    }

    // Static Booting
    protected static function booted()
    {
        static::saving(function ($room) {
            Cache::tags(['feed'])->flush();
        });

        static::deleted(function ($room) {
            Cache::tags(['feed'])->flush();
        });
    }

    // Casting
    protected $casts = [
        'bed_types' => 'array',
        'is_bathroom_private' => 'boolean',
        'has_jacuzzi' => 'boolean',
        'has_bathtub' => 'boolean',
        'has_shower_booth' => 'boolean',
        'is_smoking_allowed' => 'boolean',
        'children_allowed' => 'boolean',
        'pets_allowed' => 'boolean',
        'is_random_assignment' => 'boolean',
        'is_available' => 'boolean',
    ];
}
