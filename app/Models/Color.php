<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Color extends Model
{
    protected $fillable = [
        'name',
        'code',
        'is_active',
    ];

    protected $appends = ['added_at'];

    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }

    // Static Booting
    protected static function booted()
    {
        static::saving(function () {
            Cache::tags(['feed'])->flush();
            Cache::forget('colors');
        });

        static::deleted(function () {
            Cache::tags(['feed'])->flush();
            Cache::forget('colors');
        });
    }
}
