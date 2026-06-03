<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;

class Currency extends Model
{
    protected $fillable = [
        'name',
        'symbol',
        'is_active',
        // Display-only local currency conversion columns (do NOT use in pricing/orders)
        'country_id',
        'exchange_rate',
        'rate_source',
        'rate_updated_at',
    ];

    protected $appends = ['added_at', 'formatted_exchange_rate_updated_at'];

    /**
     * The attributes that should be cast.
     *
     * is_active    — boolean
     * exchange_rate — decimal with 10 decimal places (display only, USD base)
     * rate_updated_at — datetime
     */
    protected $casts = [
        'is_active'       => 'boolean',
        'exchange_rate'   => 'decimal:10',
        'rate_updated_at' => 'datetime',
    ];

    // -------------------------------------------------------------------------
    // Accessors
    // -------------------------------------------------------------------------

    public function getAddedAtAttribute(): ?string
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }
    public function getFormattedExchangeRateUpdatedAtAttribute(): ?string
    {
        return ! empty($this->rate_updated_at) ? $this->rate_updated_at->format('Y-m-d H:i:s') : null;
    }
    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    /**
     * The country this currency is associated with for display conversion.
     * Nullable — a currency may not be tied to a specific country.
     */
    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    // -------------------------------------------------------------------------
    // Model events
    // -------------------------------------------------------------------------

    // Static booted
    public static function booted(): void
    {
        static::created(function () {
            Cache::forget('currency');
            Cache::forget('available_currencies');
        });

        static::updated(function () {
            Cache::forget('currency');
            Cache::forget('available_currencies');
        });

        static::deleted(function () {
            Cache::forget('currency');
            Cache::forget('available_currencies');
        });
    }
}
