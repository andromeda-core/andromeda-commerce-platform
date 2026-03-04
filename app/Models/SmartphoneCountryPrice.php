<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;

class SmartphoneCountryPrice extends Model
{
    protected $fillable = [
        'smartphone_for_sale_id', 'country_id', 'price',
    ];

    protected $appends = ['added_at'];

    //    RelationShips
    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'country_id', 'id');
    }

    public function selling_info(): BelongsTo
    {
        return $this->belongsTo(SmartphoneForSale::class, 'smartphone_for_sale_id', 'id');
    }

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
