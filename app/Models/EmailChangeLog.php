<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailChangeLog extends Model
{
    protected $fillable = [
        'user_id',
        'old_email',
        'new_email',
        'ip_address',
        'user_agent',
        'changed_at',
    ];

    // RelationShips
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
