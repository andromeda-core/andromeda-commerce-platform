<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierAssignedOrder extends Model
{
    protected $fillable = [
        'supplier_id', 'order_id', 'assigned_by', 'assigned_at', 'status', 'note', 'draft_data', 'batch_id',
    ];

    protected $appends = ['added_at'];

    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }

    // RelationShips
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id', 'id');

    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class, 'batch_id', 'id');

    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by', 'id');
    }

    public function logs()
    {
        return $this->hasMany(SupplierAssignmentLog::class, 'supplier_assigned_order_id')
            ->with('author')
            ->orderBy('created_at', 'asc');
    }

    protected $casts = [
        'draft_data' => 'array',
    ];
}
