<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

class SmartphoneForSale extends Model
{
    protected $fillable = ['smartphone_id', 'selling_price', 'shipping_fee_id', 'import_tax_id', 'total_price'];

    protected $appends = ['added_at', 'total_price', 'total_price_with_tax'];

    // RelationShips
    public function smartphone(): BelongsTo
    {
        return $this->belongsTo(Smartphone::class, 'smartphone_id', 'id');
    }

    public function shipping_fee(): BelongsTo
    {
        return $this->belongsTo(AdditionalFeeList::class, 'shipping_fee_id', 'id');
    }

    public function import_tax(): BelongsTo
    {
        return $this->belongsTo(AdditionalFeeList::class, 'import_tax_id', 'id');
    }

    public function territory_prices(): HasMany
    {
        return $this->hasMany(SmartphoneCountryPrice::class, 'smartphone_for_sale_id', 'id');
    }

    // Attributes
    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }

    public function getTotalPriceWithTaxAttribute(): string
    {
        $basePrice = $this->selling_price ?? 0;

        $user = auth()->user();
        $countryId = $user?->customer?->country_id;

        if ($countryId) {
            if ($this->relationLoaded('territory_prices')) {
                $override = $this->territory_prices->firstWhere('country_id', $countryId);
                if ($override) {
                    $basePrice = $override->price;
                }
            } else {
                $overridePrice = $this->territory_prices()
                    ->where('country_id', $countryId)
                    ->value('price');

                if ($overridePrice !== null) {
                    $basePrice = $overridePrice;
                }
            }
        }

        $total = $basePrice;

        if ($this->relationLoaded('shipping_fee') && $this->shipping_fee) {
            $total += $this->calculateFee($this->shipping_fee, $basePrice);
        }

        if ($this->relationLoaded('import_tax') && $this->import_tax) {
            $total += $this->calculateFee($this->import_tax, $basePrice);
        }

        return number_format($total, 2, '.', '');

    }

    public function getTotalPriceAttribute(): string
    {
        $basePrice = $this->selling_price ?? 0;

        $user = auth()->user();
        $countryId = $user?->customer?->country_id;

        if ($countryId) {
            if ($this->relationLoaded('territory_prices')) {
                $override = $this->territory_prices->firstWhere('country_id', $countryId);
                if ($override) {
                    $basePrice = $override->price;
                }
            } else {
                $overridePrice = $this->territory_prices()
                    ->where('country_id', $countryId)
                    ->value('price');

                if ($overridePrice !== null) {
                    $basePrice = $overridePrice;
                }
            }
        }

        $total = $basePrice;

        return number_format($total, 2, '.', '');

    }

    protected function calculateFee(?AdditionalFeeList $fee, float $basePrice): float
    {
        if (! $fee || ! $fee->is_active) {
            return 0;
        }

        if ($fee->value_type === 'percentage') {
            return ($basePrice * $fee->default_value) / 100;
        }

        return $fee->default_value;
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
