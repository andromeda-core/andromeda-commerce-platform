<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    protected $fillable = [
        'user_id',
        'country_id',
        'state',
        'city',
        'postal_code',
        'address_line1',
        'address_line2',
        'note',
    ];

    // Attributes

    protected $appends = ['added_at', 'active_shipping_address'];

    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }

    public function getActiveShippingAddressAttribute()
    {
        return $this->shippingAddresses()->where('is_active', 1)->first();
    }

    // RelationShips
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'customer_id', 'id');
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'country_id', 'id');
    }

    public function cart_items(): HasMany
    {
        return $this->hasMany(CartItem::class, 'customer_id', 'id');
    }

    public function shippingAddresses(): HasMany
    {
        return $this->hasMany(ShippingAddress::class, 'customer_id', 'id');
    }

    public function orderCancelationRequests(): HasMany
    {
        return $this->hasMany(OrderCancelationRequest::class, 'customer_id', 'id');
    }
}
