<?php

namespace App\Models;

use App\Jobs\CollaboratorCommissionSet;
use App\Jobs\Meta\OrderStatusArrivedLocallyNotificationJob;
use App\Jobs\Meta\OrderStatusDeliveredNotificationJob;
use App\Jobs\Meta\OrderStatusPaidNotificationJob;
use App\Jobs\Meta\OrderStatusPendingNotificationJob;
use App\Jobs\Meta\OrderStatusShippedNotificationJob;
use App\Jobs\NotifyAdminAboutOrderPlaced;
use App\Notifications\OrderStatusArrivedLocallyNotification;
use App\Notifications\OrderStatusDeliveredNotification;
use App\Notifications\OrderStatusPaidNotification;
use App\Notifications\OrderStatusPendingNotification;
use App\Notifications\OrderStatusShippedNotification;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Cache;

class Order extends Model
{
    protected $fillable = [
        'order_no',
        'customer_id',
        'shipping_address_id',
        'amount',
        'points_used',
        'full_amount',
        'sub_total',
        'import_tax',
        'shipping_fee',
        'addons_sub_total',
        'status',
        'is_delivery_confirmed',
        'is_purchase_confirmed',
        'delivered_at',
        'delivery_confirmed_at',
        'purchase_confirmed_at',
        'previous_status',
        'collaborator_id',
        'courier_company',
        'courier_company_address',
        'courier_company_postal_code',
        'courier_company_phone',
        'shipping_date',
        'tracking_no',
        'courier_invoice',
        'payment_proof',
        'is_cash_collected',
        'final_attachments',
        'payment_method',
        'secondary_payment_method',
        'np_id',
        'shipping_name',
        'shipping_phone',
        'shipping_address_line1',
        'shipping_address_line2',
        'shipping_city',
        'shipping_state',
        'shipping_postal_code',
        'shipping_country',
        'expires_at',
        'expired_at',
    ];

    //    Attributes
    protected $appends = [
        'added_at',
        'is_refund_requested',
        'refund_request_status',
        'is_address_change_requested',
        'address_change_request_status',
        'is_cancelation_requested',
        'cancelation_request_status',
    ];

    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }

    public function getIsRefundRequestedAttribute()
    {
        if (! isset($this->id)) {
            return false;
        }

        return $this->refund()->exists();
    }

    public function getRefundRequestStatusAttribute()
    {
        if (! isset($this->id)) {
            return false;
        }

        return $this->refund()?->exists() ? $this->refund()->first()?->refund_status : null;
    }

    public function getIsAddressChangeRequestedAttribute()
    {
        if (! isset($this->id)) {
            return false;
        }

        return $this->addressChangeRequest()->exists();
    }

    public function getAddressChangeRequestStatusAttribute()
    {
        if (! isset($this->id)) {
            return false;
        }

        return $this->addressChangeRequest()?->exists() ? $this->addressChangeRequest()->first()?->status : null;
    }

    public function getIsCancelationRequestedAttribute()
    {
        if (! isset($this->id)) {
            return false;
        }

        return $this->cancelationRequest()->exists();
    }

    public function getCancelationRequestStatusAttribute()
    {
        if (! isset($this->id)) {
            return false;
        }

        return $this->cancelationRequest()?->exists() ? $this->cancelationRequest()->first()?->status : null;
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

    public function refund(): HasOne
    {
        return $this->hasOne(OrderRefund::class, 'order_id', 'id');
    }

    public function addressChangeRequest(): HasOne
    {
        return $this->hasOne(OrderAddressChangeRequest::class, 'order_id', 'id');
    }

    public function cancelationRequest(): HasOne
    {
        return $this->hasOne(OrderCancelationRequest::class, 'order_id', 'id');
    }

    public function assignedSupplier(): HasOne
    {
        return $this->hasOne(SupplierAssignedOrder::class, 'order_id', 'id');
    }


    public function payment()
    {
        return $this->hasOne(Payment::class);
    }



    // Static Booting
    public static function booted()
    {
        static::created(function ($order) {
            $order->order_no = 'ORD-' . str_pad($order->id, 5, '0', STR_PAD_LEFT);
            $currency = Cache::get('currency');
            $user = $order->customer->user;
            $is_eligible = SpecialCountry::where('country_id', $order->customer->country_id)->exists();
            $user_meta_contacts = $order->customer->user->metaContacts;
            $meta_setting = Cache::get('meta_setting');

            $reward_rate = null;
            $total_points = null;

            if (! empty($order->collaborator_id) && $order->status === 'paid') {
                if (empty($order->collaborator->point_accumulation_rate)) {
                    $reward_rate = RewardSetting::first()->reward_rate;
                    $total_points = $order->full_amount * $reward_rate / 100;
                } else {
                    $reward_rate = $order->collaborator->point_accumulation_rate;
                    $total_points = $order->full_amount * $reward_rate / 100;
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
            }

            if (Cache::has('smtp_config')) {
                if ($order->status === 'pending') {
                    $user->notify(new OrderStatusPendingNotification($order, $currency));
                }

                if ($order->status === 'paid' && empty($order->np_id)) {
                    $order->load([
                        'customer.user',
                        'orderItems' => function ($q) {
                            $q->with([
                                'inventoryItem' => function ($q) {
                                    $q->with([
                                        'smartphone' => function ($q) {
                                            $q->with([
                                                'selling_info.shipping_fee',
                                                'selling_info.import_tax',
                                                'model_name',
                                                'capacity',
                                            ]);
                                        },
                                    ]);
                                },
                                'smartphoneAddons',
                            ]);
                        },
                    ]);

                    $user->notify(new OrderStatusPaidNotification($order, $currency));
                }
            }

            if (Cache::has('meta_setting')) {

                if ($order->status === 'pending' && $is_eligible && $user_meta_contacts->isNotEmpty()) {
                    dispatch(new OrderStatusPendingNotificationJob($user_meta_contacts, $order, $currency, $meta_setting, $user))->onQueue('meta');
                }

                if ($order->status === 'paid' && $is_eligible && $user_meta_contacts->isNotEmpty() && ! empty($meta_setting)) {
                    dispatch(new OrderStatusPaidNotificationJob($user_meta_contacts, $order, $currency, $meta_setting, $user))->onQueue('meta');
                }
            }

            $order->updateQuietly(['expires_at' => now()->addDays(1)]);

            // Notify Admin About Order
            dispatch(new NotifyAdminAboutOrderPlaced($order, $currency))->afterCommit();
        });

        static::updated(function ($order) {

            if (! Cache::has('smtp_config')) {
                return;
            }

            if (! $order->wasChanged('status')) {
                return;
            }

            $currency = Cache::get('currency');

            $meta_setting = Cache::get('meta_setting');
            $user_meta_contacts = $order->customer->user->metaContacts;
            $user = $order->customer->user;
            $is_eligible = SpecialCountry::where('country_id', $order->customer->country_id)->exists();

            if ($order->status === 'paid' && empty($order->np_id)) {
                $order->load([
                    'customer.user',
                    'orderItems' => function ($q) {
                        $q->with([
                            'smartphone' => function ($q) {
                                $q->with([
                                    'selling_info.shipping_fee',
                                    'selling_info.import_tax',
                                    'model_name',
                                    'capacity',
                                ]);
                            },
                            'smartphoneAddons',
                        ]);
                    },
                ]);

                $user->notify(new OrderStatusPaidNotification($order, $currency));

                if ($is_eligible && $user_meta_contacts->isNotEmpty() && ! empty($meta_setting)) {
                    dispatch(new OrderStatusPaidNotificationJob($user_meta_contacts, $order, $currency, $meta_setting, $user))->onQueue('meta');
                }
            } elseif ($order->status === 'shipped') {

                $user->notify(new OrderStatusShippedNotification($order));

                if ($is_eligible && $user_meta_contacts->isNotEmpty() && ! empty($meta_setting)) {
                    dispatch(new OrderStatusShippedNotificationJob($user_meta_contacts, $order, $meta_setting, $user))->onQueue('meta');
                }
            } elseif ($order->status === 'arrived_locally') {
                $user->notify(new OrderStatusArrivedLocallyNotification($order));

                if ($is_eligible && $user_meta_contacts->isNotEmpty() && ! empty($meta_setting)) {
                    dispatch(new OrderStatusArrivedLocallyNotificationJob($user_meta_contacts, $order, $meta_setting, $user))->onQueue('meta');
                }
            } elseif ($order->status === 'delivered') {
                $user->notify(new OrderStatusDeliveredNotification($order));

                if ($is_eligible && $user_meta_contacts->isNotEmpty() && ! empty($meta_setting)) {
                    dispatch(new OrderStatusDeliveredNotificationJob($user_meta_contacts, $order, $meta_setting, $user))->onQueue('meta');
                }

                // Assigning Commission To Platform after order delivered
                $exists_platform_commission = PlatformCommission::where('order_id', $order->id)->exists();
                if (! $exists_platform_commission) {
                    $orderTotal = (float) ($order->full_amount ?? 0);

                    $rate = CommissionSetting::where('type', 'platform')->value('commission_rate');
                    $rate = (float) ($rate ?? 0);

                    $method = (string) $order->payment_method;

                    // safeguard
                    if ($orderTotal <= 0 || $rate <= 0) {
                        return;
                    }

                    $commissionAmount = round(($orderTotal * $rate) / 100, 2);

                    PlatformCommission::firstOrCreate(
                        ['order_id' => $order->id],
                        [
                            'commission_rate' => $rate,
                            'commission_amount' => $commissionAmount,
                            'payout_method' => $method,
                        ]
                    );
                }
            }

            $reward_rate = null;
            $total_points = null;

            if (
                $order->status === 'paid'
                && $order->wasChanged('status')
                && ! empty($order->collaborator_id)
            ) {
                if (empty($order->collaborator->point_accumulation_rate)) {
                    $reward_rate = RewardSetting::first()->reward_rate;
                    $total_points = $order->full_amount * $reward_rate / 100;
                } else {
                    $reward_rate = $order->collaborator->point_accumulation_rate;
                    $total_points = $order->full_amount * $reward_rate / 100;
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
                dispatch(new CollaboratorCommissionSet($order));
            }
        });
    }

    // Casting
    protected $casts = [
        'shipping_date' => 'date:Y-m-d',
        'is_delivery_confirmed' => 'boolean',
        'is_purchase_confirmed' => 'boolean',
        'delivery_confirmed_at' => 'datetime',
        'final_attachments' => 'array',
    ];

    // Attributes
    protected $attributes = [
        'status' => 'pending',
    ];
}
