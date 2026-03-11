<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryVerification extends Model
{
    protected $fillable = [
        'verified_by_id',
        'inventory_id',
        'scanned_code',
        'video',
        'verified_at',
    ];

    // RelationShips
    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by_id', 'id');
    }

    public function inventory(): BelongsTo
    {
        return $this->belongsTo(Inventory::class, 'inventory_id', 'id');
    }
}
