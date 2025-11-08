<?php

namespace App\Models;

use App\Jobs\CollaboratorCommissionSet;
use App\Jobs\DistributorCommissionSet;
use App\Jobs\NotifyAdminAboutOrderPlaced;
use App\Jobs\SupplierCommissionSet;
use App\Notifications\OrderStatusArrivedLocallyNotification;
use App\Notifications\OrderStatusDeliveredNotification;
use App\Notifications\OrderStatusPaidNotification;
use App\Notifications\OrderStatusPendingNotification;
use App\Notifications\OrderStatusShippedNotification;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

class Order extends Model
{
    protected $fillable = [
        'order_no',
        'customer_id',
        'amount',
        'status',
        'collaborator_id',
        'courier_company',
        'shipping_date',
        'tracking_no',
        'courier_invoice',
        'payment_proof',
        'is_cash_collected',
        'payment_method',
        'np_id',
    ];

    //    Attributes
    protected $appends = ['added_at'];

    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }

    // RelationShips
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }

    public function collaborator(): BelongsTo
    {
        return $this->belongsTo(Collaborator::class, 'collaborator_id', 'id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id', 'id');
    }

    public function orderPackageRecordings(): HasMany
    {
        return $this->hasMany(PackageRecording::class, 'order_id', 'id');
    }

    public function supplierCommissions(): HasMany
    {
        return $this->hasMany(SupplierCommission::class, 'order_id', 'id');
    }

    public function collaboratorCommissions(): HasMany
    {
        return $this->hasMany(CollaboratorCommission::class, 'order_id', 'id');
    }

    // Static Booting
    public static function booted()
    {
        static::created(function ($order) {
            $order->order_no = 'ORD-'.str_pad($order->id, 5, '0', STR_PAD_LEFT);
            $currency = Cache::get('currency');

            $reward_rate = null;
            $total_points = null;

            if (! empty($order->collaborator_id) && $order->status === 'paid') {
                if (empty($order->collaborator->point_accumulation_rate)) {
                    $reward_rate = RewardSetting::first()->reward_rate;
                    $total_points = $order->amount * $reward_rate / 100;
                } else {
                    $reward_rate = $order->collaborator->point_accumulation_rate;
                    $total_points = $order->amount * $reward_rate / 100;
                }

                $user_id = $order->customer->user_id;

                $reward_point = RewardPoint::where('user_id', $user_id)->first();

                if (empty($reward_point)) {
                    RewardPoint::create([
                        'user_id' => $user_id,
                        'points' => $total_points,
                        'expires_at' => now()->addYears(5),
                    ]);
                } else {
                    $reward_point->points += round($total_points);
                    $reward_point->save();
                }
                // Collaborator Commission Set Event
                dispatch(new CollaboratorCommissionSet($order));
            }

            if (Cache::has('smtp_config')) {
                if ($order->status === 'pending') {
                    $order->customer->user->notify(new OrderStatusPendingNotification($order, $currency));
                }
            }

            // Distributor Commission Set Event
            dispatch(new DistributorCommissionSet($order));

            // Supplier Commission Set Event
            dispatch(new SupplierCommissionSet($order));

            $order->save();

            // Notify Admin About Order
            dispatch(new NotifyAdminAboutOrderPlaced($order));
        });

        static::updated(function ($order) {

            if (! Cache::has('smtp_config')) {
                return;
            }

            if (! $order->wasChanged('status')) {
                return;
            }

            $currency = Cache::get('currency');

            if ($order->status === 'paid' && empty($order->np_id)) {
                $order->customer->user->notify(new OrderStatusPaidNotification($order, $currency));

                $reward_rate = null;
                $total_points = null;

                if (! empty($order->collaborator_id) && $order->status === 'paid') {
                    if (empty($order->collaborator->point_accumulation_rate)) {
                        $reward_rate = RewardSetting::first()->reward_rate;
                        $total_points = $order->amount * $reward_rate / 100;
                    } else {
                        $reward_rate = $order->collaborator->point_accumulation_rate;
                        $total_points = $order->amount * $reward_rate / 100;
                    }

                    $user_id = $order->customer->user_id;

                    $reward_point = RewardPoint::where('user_id', $user_id)->first();

                    if (empty($reward_point)) {
                        RewardPoint::create([
                            'user_id' => $user_id,
                            'points' => $total_points,
                            'expires_at' => now()->addYears(5),
                        ]);
                    } else {
                        $reward_point->points += round($total_points);
                        $reward_point->save();
                    }
                    // Collaborator Commission Set Event
                    dispatch(new CollaboratorCommissionSet($order));
                }

            } elseif ($order->status === 'shipped') {
                $order->customer->user->notify(new OrderStatusShippedNotification($order));
            } elseif ($order->status === 'arrived_locally') {
                $order->customer->user->notify(new OrderStatusArrivedLocallyNotification($order));
            } elseif ($order->status === 'delivered') {
                $order->customer->user->notify(new OrderStatusDeliveredNotification($order));
            }

        });
    }

    // Casting
    protected $casts = [
        'shipping_date' => 'date:Y-m-d',
    ];

    // Attributes
    protected $attributes = [
        'status' => 'pending',
    ];
}
