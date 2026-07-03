<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Collaborator extends Model
{
    protected $fillable = [
        'type',
        'referral_code',
        'user_id',
        'address',
        'bank_name',
        'bank_account_name',
        'iban',
        'swift_code',
        'bank_account_no',
        'point_accumulation_rate',
        'commission_rate',
        // Phase 3 (Accommodation Commissions) — separate rate for lodging reservation commissions;
        // 'commission_rate' above stays the phone-order rate, unchanged.
        'accommodation_commission_rate',
    ];

    protected $appends = ['added_at'];

    // Attributes
    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }

    // RelationShips
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'collaborator_id', 'id');
    }
}
