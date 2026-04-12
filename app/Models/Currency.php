<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Currency extends Model
{
    protected $fillable = [
        'name',
        'symbol',
        'is_active',
    ];

    protected $appends = ['added_at'];

    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }

    // Static booted
    public static function booted()
    {
        static::created(function () {
            Cache::forget('currency');
        });

        static::updated(function () {
            Cache::forget('currency');
        });
    }
}
