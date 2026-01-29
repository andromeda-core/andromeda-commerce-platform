<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id', 'smartphone_id', 'product_id', 'quantity', 'unit_price', 'sub_total', 'color_id', 'shipping_cost', 'inventory_item_id', 'import_cost',
    ];

    //   Attributes
    protected $appends = ['added_at'];

    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }

    // RelationShips
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'id');
    }

    public function smartphone(): BelongsTo
    {
        return $this->belongsTo(Smartphone::class, 'smartphone_id', 'id');
    }

    public function color(): BelongsTo
    {
        return $this->belongsTo(Color::class, 'color_id', 'id');
    }

    public function smartphoneAddons(): HasMany
    {
        return $this->hasMany(SmartphoneOrderItemAddon::class, 'order_item_id', 'id');
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(Inventory::class, 'inventory_item_id', 'id');
    }
}
