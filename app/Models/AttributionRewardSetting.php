<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttributionRewardSetting extends Model
{
    protected $fillable = [
        'calculation_type',
        'value',
    ];

    protected $casts = [
        'value' => 'decimal:2',
    ];

    public static function getSetting(): self
    {
        return static::firstOrCreate(
            ['id' => 1],
            ['calculation_type' => 'percentage', 'value' => 0]
        );
    }
}
