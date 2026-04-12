<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    protected $fillable = ['company_name', 'user_id'];

    protected $appends = ['added_at'];

    // Relation Ships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class, 'supplier_id', 'id');
    }

    public function assignedOrders(): HasMany
    {
        return $this->hasMany(SupplierAssignedOrder::class, 'supplier_id', 'id');
    }

    // Attributes
    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }
}
