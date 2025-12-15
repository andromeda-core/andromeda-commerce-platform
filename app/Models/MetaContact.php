<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MetaContact extends Model
{
    protected $fillable = [
        'platform_user_id',
        'user_id',
        'platform',
        'raw_summary',
    ];

    // RelationShips
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    // Casting
    protected $casts = [
        'raw_summary' => 'array',
    ];
}
