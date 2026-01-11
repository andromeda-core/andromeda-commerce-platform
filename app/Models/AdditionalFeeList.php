<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class AdditionalFeeList extends Model
{
    protected $fillable = [
        'name',
        'category',
        'value_type',
        'default_value',
        'is_active',
    ];

    protected $appends = ['added_at'];

    // Attributes
    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }

    // Static Booting
    protected static function booted()
    {
        static::saving(function () {
            Cache::tags(['feed'])->flush();
        });

        static::deleted(function () {
            Cache::tags(['feed'])->flush();
        });
    }
}
