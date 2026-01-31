<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UnsettledAccount extends Model
{
    protected $fillable = [
        'user_id',
        'order_id',
        'reason',
        'meta',
        'status',
        'detected_at',
        'resolved_at',
        'resolved_by',
        'is_system_resolved',
        'note',
    ];

    // RelationShips
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'id');
    }

    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by', 'id');
    }

    public function unsettledNotificationLogs(): HasMany
    {
        return $this->hasMany(UnsettledAccountNotificationLog::class, 'unsettled_account_id', 'id');
    }

    protected $casts = [
        'meta' => 'array',
    ];
}
