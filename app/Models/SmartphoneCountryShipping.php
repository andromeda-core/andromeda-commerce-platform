<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;

class SmartphoneCountryShipping extends Model
{
    protected $fillable = [
        'smartphone_for_sale_id', 'country_id', 'shipping_fee_id', 'import_tax_id', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    //    RelationShips
    public function smartphoneForSale(): BelongsTo
    {
        return $this->belongsTo(SmartphoneForSale::class, 'smartphone_for_sale_id', 'id');
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'country_id', 'id');
    }

    public function shippingFee(): BelongsTo
    {
        return $this->belongsTo(AdditionalFeeList::class, 'shipping_fee_id', 'id');
    }

    public function importTax(): BelongsTo
    {
        return $this->belongsTo(AdditionalFeeList::class, 'import_tax_id', 'id');
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
