<?php

namespace App\Models;

use App\Notifications\OrderRefundNotification;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class OrderRefund extends Model
{
    protected $fillable = [
        'order_id',
        'customer_id',
        'refund_status',
        'refund_method',
        'refund_reason',
        'refund_reference',
        'note',
        'refund_amount',
        'requested_at',
        'approved_at',
        'rejected_at',
        'completed_at',
    ];

    // Attributes
    protected $appends = ['added_at'];

    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d H:i:s') : null;
    }

    // RelationShips
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
        static::updated(function (OrderRefund $refund) {

            if (! $refund->wasChanged('refund_status')) {
                return;
            }

            $refund->load(['order', 'customer.user', 'customer.user.reward_points']);

            $order = $refund->order;

            if (! $order) {
                return;
            }

            $orderStatus = match ($refund->refund_status) {
                'requested' => 'refund_requested',
                'approved' => 'refund_approved',
                'rejected' => 'paid',
                'completed' => 'refund_completed',
            };

            $order->updateQuietly([
                'status' => $orderStatus,
            ]);

            if (
                $refund->refund_status === 'completed' &&
                $refund->refund_method === 'points'
            ) {
                $expiry = now()->addYears(5);
                $refund->customer?->user?->reward_points()->create(
                    [
                        'points' => $refund->refund_amount,
                        'expires_at' => $expiry,

                    ]
                );

            }

            if ($refund->refund_status === 'approved') {
                $refund->customer->user->notify(new OrderRefundNotification($refund, 'approved'));
            }

            if ($refund->refund_status === 'rejected') {
                $refund->customer->user->notify(new OrderRefundNotification($refund, 'rejected'));
            }

            if ($refund->refund_status === 'completed') {

                DB::transaction(function () use ($order) {

                    foreach ($order->orderItems as $item) {

                        $inventoryItem = $item->inventoryItem;

                        if (
                            $inventoryItem &&
                           $inventoryItem->status === 'sold'
                        ) {
                            $inventoryItem->update([
                                'status' => 'in_stock',
                            ]);
                        }
                    }
                });

                $refund->customer->user->notify(new OrderRefundNotification($refund, 'completed'));
            }
        });
    }
}
