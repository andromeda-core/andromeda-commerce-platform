<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

class Batch extends Model
{
    protected $fillable = [
        'batch_name',
        'total_quantity',
        'base_purchase_unit_price',
        'supplier_id',
        'extra_costs',
        'vat',
        'total_batch_cost',
        'final_unit_price',
        'invoices',
    ];

    protected $appends = ['added_at', 'invoice_urls'];

    // RelationShips
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id', 'id');
    }

    public function inventory_items(): HasMany
    {
        return $this->hasMany(Inventory::class, 'batch_id', 'id');
    }

    // Attributes
    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }

    public function getInvoiceUrlsAttribute()
    {
        return array_map(function ($invoices) {
            return $invoices['url'];
        }, $this->invoices ?? []);
    }

    // Static Booting
    protected static function booted()
    {
        static::saving(function () {
            Cache::tags(['feed'])->flush();
        });
    }

    // Casting
    protected $casts = [
        'extra_costs' => 'array',
        'invoices' => 'array',
    ];
}
