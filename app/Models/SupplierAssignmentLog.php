<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupplierAssignmentLog extends Model
{
    protected $fillable = [
        'supplier_assigned_order_id',
        'created_by',
        'memo',
        'file_path',
        'file_name',
        'file_type',
    ];

    // No update, no delete - append only
    public static function boot()
    {
        parent::boot();

        static::updating(fn () => throw new \Exception('Logs cannot be modified.'));
        static::deleting(fn () => throw new \Exception('Logs cannot be deleted.'));
    }

    public function assignment()
    {
        return $this->belongsTo(SupplierAssignedOrder::class, 'supplier_assigned_order_id');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
