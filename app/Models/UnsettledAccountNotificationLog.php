<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UnsettledAccountNotificationLog extends Model
{
    protected $fillable = [
        'user_id',
        'unsettled_account_id',
        'channel',
        'message',
        'is_system_sent',
        'sent_by',
        'sent_at',
    ];

    // RelationShips
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function unsettledAccount(): BelongsTo
    {
        return $this->belongsTo(UnsettledAccount::class, 'unsettled_account_id', 'id');
    }

    public function sent_by(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_by', 'id');
    }
}
