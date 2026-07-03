<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccommodationOperator extends Model
{
    protected $fillable = [
        'user_id',
        'company_name',
        'address',
        'postal_code',
        'bank_name',
        'bank_account_name',
        'iban',
        'swift_code',
        'bank_account_no',
    ];

    protected $appends = ['added_at'];

    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }

    // RelationShips
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
