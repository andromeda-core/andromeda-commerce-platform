<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderCurrencySnapshot extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'base_currency',
        'base_amount',
        'display_currency',
        'display_amount',
        'exchange_rate',
        'rate_source',
        'rate_timestamp',
        'selected_pay_currency',
    ];

    protected $casts = [
        'base_amount'    => 'decimal:2',
        'display_amount' => 'decimal:2',
        'exchange_rate'  => 'decimal:10',
        'rate_timestamp' => 'datetime',
    ];

    protected $appends = [
        'rate_timestamp_display',
        'selected_pay_currency_display',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'id');
    }

    public function getRateTimestampDisplayAttribute(): string
    {
        $ts = $this->rate_timestamp;

        if (empty($ts)) {
            return 'N/A';
        }

        try {
            return $ts->format('M j, Y, g:i A');
        } catch (\Throwable $e) {
            return 'N/A';
        }
    }

    public function getSelectedPayCurrencyDisplayAttribute(): string
    {
        $value = $this->selected_pay_currency;

        if (empty($value)) {
            return 'Pending';
        }

        $lower = strtolower((string) $value);

        $labels = [
            'bank_transfer' => 'Bank Transfer',
            'points'        => 'Points',
        ];

        if (array_key_exists($lower, $labels)) {
            return $labels[$lower];
        }

        return strtoupper((string) $value);
    }
}
