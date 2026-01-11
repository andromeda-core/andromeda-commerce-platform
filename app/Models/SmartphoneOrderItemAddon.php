<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SmartphoneOrderItemAddon extends Model
{
    protected $fillable = [
        'smartphone_id',
        'addon_id',
        'order_item_id',
        'customer_id',
        'name',
        'quantity',
        'unit_price',
        'total_price',
    ];

    //    RelationShips
    public function smartphone(): BelongsTo
    {
        return $this->belongsTo(Smartphone::class, 'smartphone_id', 'id');
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class, 'order_item_id', 'id');
    }

    public function addon(): BelongsTo
    {
        return $this->belongsTo(Addon::class, 'addon_id', 'id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }
}
