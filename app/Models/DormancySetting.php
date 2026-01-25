<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class DormancySetting extends Model
{
    protected $fillable = [
        'dormancy_threshold_type',
        'dormancy_threshold_value',
    ];

    protected static function booted()
    {
        static::saved(function ($dormancySetting) {
            Cache::forget('dormancy_setting');
        });
    }
}
