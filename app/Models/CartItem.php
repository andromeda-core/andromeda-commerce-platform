<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    protected $fillable = [
        'customer_id',
        'smartphone_id',
        'type',
        'quantity',
        'color_id',
        'unit_price',
        'total_price',
        'capacity',
        'color_name',
    ];

    // Relations
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }

    public function smartphone(): BelongsTo
    {
        return $this->belongsTo(Smartphone::class, 'smartphone_id', 'id');
    }

    public function color(): BelongsTo
    {
        return $this->belongsTo(Color::class, 'color_id', 'id');
    }
}
