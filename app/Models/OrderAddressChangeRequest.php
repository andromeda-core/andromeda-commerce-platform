<?php

namespace App\Models;

use App\Notifications\OrderAddressChangeNotification;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderAddressChangeRequest extends Model
{
    protected $fillable = [
        'order_id',
        'customer_id',
        'shipping_name',
        'shipping_address_line1',
        'shipping_address_line2',
        'shipping_phone',
        'shipping_state',
        'shipping_city',
        'shipping_country',
        'shipping_postal_code',
        'reason',
        'note',
        'status',
        'requested_at',
        'approved_at',
        'rejected_at',
    ];

    //    Attributes
    protected $appends = ['added_at'];

    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d H:i:s') : null;
    }

    // RelationsShips
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }

    // Static Booting
    public static function booted()
    {
        static::updated(function (OrderAddressChangeRequest $request) {

            if (! $request->wasChanged('status')) {
                return;
            }

            $request->load(['customer.user', 'order']);

            if ($request->status === 'approved') {
                $request->customer->user->notify(new OrderAddressChangeNotification($request, 'approved'));
            }

            if ($request->status === 'rejected') {
                $request->customer->user->notify(new OrderAddressChangeNotification($request, 'rejected'));
            }

        });
    }
}
