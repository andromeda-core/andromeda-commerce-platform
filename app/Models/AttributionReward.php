<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AttributionReward extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_link_id',
        'rewarded_to_user_id',
        'smartphone_id',
        'calculation_type',
        'calculation_value',
        'order_amount',
        'reward_amount',
        'status',
        'released_at',
        'reversed_at',
    ];

    protected $casts = [
        'calculation_value' => 'decimal:2',
        'order_amount'      => 'decimal:2',
        'reward_amount'     => 'decimal:2',
        'released_at'       => 'datetime:Y-m-d H:i:s',
        'reversed_at'       => 'datetime:Y-m-d H:i:s',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id', 'id');
    }

    public function productLink()
    {
        return $this->belongsTo(ProductLink::class, 'product_link_id', 'id');
    }

    public function rewardedTo()
    {
        return $this->belongsTo(User::class, 'rewarded_to_user_id', 'id');
    }

    public function smartphone()
    {
        return $this->belongsTo(Smartphone::class, 'smartphone_id', 'id');
    }
}
