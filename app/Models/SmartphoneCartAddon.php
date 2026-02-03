<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SmartphoneCartAddon extends Model
{
    protected $fillable = [
        'name',
        'quantity',
        'total_price',
        'unit_price',
        'smartphone_id',
        'cart_item_id',
        'customer_id',
        'addon_id',
    ];

    // RelationShips
    public function addon(): BelongsTo
    {
        return $this->belongsTo(Addon::class, 'addon_id', 'id');
    }

    public function smartphone(): BelongsTo
    {
        return $this->belongsTo(Smartphone::class, 'smartphone_id', 'id');
    }

    public function cartItem(): BelongsTo
    {
        return $this->belongsTo(CartItem::class, 'cart_item_id', 'id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }
}
