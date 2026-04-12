<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CollaboratorCommission extends Model
{
    protected $fillable = [

        'order_id',
        'collaborator_id',
        'commission_rate',
        'commission_amount',
        'status',
        'paid_at',

    ];

    // Attributes
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

    public function collaborator(): BelongsTo
    {
        return $this->belongsTo(Collaborator::class, 'collaborator_id', 'id');
    }

    protected $casts = [
        'paid_at' => 'date:Y-m-d',
    ];
}
