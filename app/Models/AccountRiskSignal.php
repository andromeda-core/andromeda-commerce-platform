<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccountRiskSignal extends Model
{
    protected $fillable = [
        'user_id',
        'signal_type',
        'context',
        'meta',
        'status',
        'resolved_by',
        'resolved_at',
        'expires_at',
        'expired_at',
    ];

    // Attributes
    protected $appends = ['detected_at'];

    public function getDetectedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d H:i:s') : null;
    }

    // RelationShips
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by', 'id');
    }

    protected $casts = [
        'meta' => 'array',
    ];
}
