<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActionLog extends Model
{
    protected $fillable = [
        'user_id',
        'route',
        'path',
        'ip_address',
        'user_agent',
        'device_fingerprint',
    ];

    // RelationShips
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
