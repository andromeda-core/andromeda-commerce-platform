<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SearchHistory extends Model
{
    protected $fillable = [
        'user_id',
        'query',
        'filters',
        'filter_summary',
        'filters_hash',
        'results_count',
        'results',
    ];

    // Attributes
    protected $appends = ['added_at'];

    public function getAddedAtAttribute()
    {
        return $this->created_at->format('Y-m-d');
    }

    // RelationShips

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
