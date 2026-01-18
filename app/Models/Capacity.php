<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

class Capacity extends Model
{
    protected $fillable = ['name', 'is_active'];

    protected $appends = ['added_at'];

    // Attributes
    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }

    // RelationShips
    public function smartphone(): HasMany
    {
        return $this->hasMany(Smartphone::class, 'capacity_id', 'id');
    }

    // Static Booting
    protected static function booted()
    {
        static::saving(function () {
            Cache::tags(['feed'])->flush();
            Cache::forget('capacities');
        });

        static::deleted(function () {
            Cache::tags(['feed'])->flush();
            Cache::forget('capacities');
        });
    }
}
