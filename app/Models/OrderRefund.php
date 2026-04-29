<?php

namespace App\Models;

use App\Notifications\OrderRefundNotification;
use App\Notifications\RefundAutoRejectedNoTrackingNotification;
use App\Notifications\RefundAwaitingTrackingNotification;
use App\Services\AttributionRewardService;
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
        'defect_evidence_video',
        'return_packaging_video',
        'scanned_code',
        'note',
        'refund_amount',
        'requested_at',
        'approved_at',
        'rejected_at',
        'completed_at',
        'withdrawn_at',
        'return_tracking_image',
        'return_tracking_uploaded_at',
        'return_tracking_deadline_at',
        'is_auto_rejected',
    ];

    // Attributes
    protected $appends = ['added_at', 'return_tracking_image_url', 'hours_remaining'];

    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d H:i:s') : null;
    }

    // Accessor for S3 image URL
    public function getReturnTrackingImageUrlAttribute(): ?string
    {
        return $this->return_tracking_image ?? null;
    }

    // Accessor for hours remaining on deadline
    public function getHoursRemainingAttribute(): ?int
    {
        if (! $this->return_tracking_deadline_at) return null;

        $diffInMinutes = now()->diffInMinutes($this->return_tracking_deadline_at, false);

        if ($diffInMinutes <= 0) return 0;

        return (int) ceil($diffInMinutes / 60);
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

            $refund->load(['order.orderItems', 'customer.user', 'customer.user.reward_points']);

            $order = $refund->order;

            if (! $order) {
                return;
            }

            // $orderStatus = match ($refund->refund_status) {
            //     'requested' => 'refund_requested',
            //     'approved' => 'refund_approved',
            //     'rejected' => $order->previous_status,
            //     'completed' => 'refund_completed',
            // };

            $orderStatus = match ($refund->refund_status) {
                'requested'                  => 'refund_requested',
                'approved' => 'refund_approved',
                'awaiting_return_tracking'   => 'refund_approved',
                'awaiting_returned_item'     => 'refund_approved',
                'rejected'                   => $order->previous_status ?? $order->status,
                'completed'                  => 'refund_completed',
                'withdrawn'                  => $order->previous_status ?? $order->status,
                default                      => $order->status,
            };

            $order->updateQuietly([
                'status' => $orderStatus,
            ]);





            if ($refund->refund_status === 'approved') {

                $refund->updateQuietly([
                    'refund_status'               => 'awaiting_return_tracking',
                    'approved_at'                 => now(),
                    'return_tracking_deadline_at' => now()->addHours(48),
                ]);

                $refund->customer->user->notify(new OrderRefundNotification($refund, 'approved'));


                $refund->customer->user->notify(
                    new RefundAwaitingTrackingNotification($refund)
                );
            }
            if (
                $refund->wasChanged('refund_status')
                && $refund->refund_status === 'rejected'
                && $refund->is_auto_rejected
            ) {
                $refund->order->customer->user->notify(
                    new RefundAutoRejectedNoTrackingNotification($refund)
                );
            }

            if ($refund->refund_status === 'rejected' && !$refund->is_auto_rejected) {
                $refund->customer->user->notify(new OrderRefundNotification($refund, 'rejected'));
            }

            if ($refund->refund_status === 'completed') {

                DB::transaction(function () use ($order, $refund) {

                    $order->payment()->update([
                        'status' => 'reversed',
                        'reversed_at' => now(),
                    ]);

                    app(AttributionRewardService::class)->reverseReward($order);

                    if (
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

                    foreach ($order->orderItems as $item) {

                        $inventoryItemsIds = $item->inventory_item_ids;
                        if (empty($inventoryItemsIds)) {
                            continue;
                        }

                        foreach ($inventoryItemsIds as $inventoryItemId) {
                            $inventoryItem = Inventory::find($inventoryItemId);
                            if (! empty($inventoryItem) && $inventoryItem->status === 'sold') {
                                $inventoryItem->update([
                                    'status' => 'in_stock',
                                ]);
                            }
                        }
                    }
                });

                $refund->customer->user->notify(new OrderRefundNotification($refund, 'completed'));
            }
        });
    }


    protected $casts = [
        'is_auto_rejected'             => 'boolean',
    ];
}
