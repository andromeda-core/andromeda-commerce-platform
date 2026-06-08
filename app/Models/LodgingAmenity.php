<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class LodgingAmenity extends Model
{
    protected $table = 'lodging_amenities';

    protected $fillable = [
        'name',
        'icon',
        'category',
        'is_active',
    ];

    // Pivot
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(LodgingProduct::class, 'lodging_product_amenities', 'lodging_amenity_id', 'lodging_product_id');
    }

    public function rooms(): BelongsToMany
    {
        return $this->belongsToMany(LodgingRoom::class, 'lodging_room_amenities', 'lodging_amenity_id', 'lodging_room_id');
    }

    // Casting
    protected $casts = [
        'is_active' => 'boolean',
    ];
}
