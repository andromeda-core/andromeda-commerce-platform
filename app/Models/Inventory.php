<?php

namespace App\Models;

use App\Notifications\NotifyDistributorAboutStockAdd;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;

class Inventory extends Model
{
    protected $fillable = [
        'smartphone_id',
        'batch_id',
        'storage_location_id',
        'imei1',
        'imei2',
        'eid',
        'serial_no',
        'returned_date',
        'status',
    ];

    protected $appends = ['added_at'];

    // Attributes
    public function getAddedAtAttribute()
    {
        return ! empty($this->created_at) ? $this->created_at->format('Y-m-d') : null;
    }

    // RelationShips
    public function smartphone(): BelongsTo
    {
        return $this->belongsTo(Smartphone::class, 'smartphone_id', 'id');
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class, 'batch_id', 'id');

    }

    public function storage_location(): BelongsTo
    {
        return $this->belongsTo(StorageLocation::class, 'storage_location_id', 'id');
    }

    // Static Booting
    protected static function booted()
    {
        static::saving(function () {
            Cache::tags(['feed'])->flush();
        });

        static::created(function ($item) {
            $item->load(['smartphone.category.distributor.user','smartphone.model_name','batch']);
            $item->smartphone->category?->distributor->user?->notify(new NotifyDistributorAboutStockAdd($item));

        });

        static::deleted(function ($item) {
            OrderItem::whereNotNull('inventory_item_ids')
                ->whereJsonContains('inventory_item_ids', $item->id)
                ->each(function ($orderItem) use ($item) {
                    $existing = $orderItem->inventory_item_ids ?? [];

                    if (is_string($existing)) {
                        $existing = json_decode($existing, true) ?: [];
                    }

                    $cleaned = array_values(array_diff($existing, [$item->id]));
                    $orderItem->inventory_item_ids = $cleaned;
                    $orderItem->saveQuietly();
                });
        });
    }

    // Casting
    protected $casts = [
        'returned_date' => 'date:Y-m-d',
    ];
}
