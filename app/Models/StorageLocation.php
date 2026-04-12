<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StorageLocation extends Model
{
    protected $fillable = [
        'name',
        'address',
        'is_active',
    ];

    protected $appends = ['added_at'];

    // RelationShips
    public function inventory_items(): HasMany
    {
        return $this->hasMany(Inventory::class, 'storage_location_id', 'id');
    }

    // Attributes
    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }
}
