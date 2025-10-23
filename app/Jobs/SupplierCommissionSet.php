<?php

namespace App\Jobs;

use App\Models\CommissionSetting;
use App\Models\Order;
use App\Models\SupplierCommission;
use App\Models\User;
use App\Notifications\SupplierCommissionNotSetNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SupplierCommissionSet implements ShouldQueue
{
    use Queueable;

    public $tries = 5;

    public $backoff = 30;

    public $timeout = 300;

    public function __construct(
        private Order $order
    ) {}

    public function handle(): void
    {

        $inventory_items = $this->order
            ->orderItems
            ->flatMap(fn ($orderItem) => $orderItem->smartphone->inventory_items)
            ->unique('batch_id')
            ->values();

        $suppliers = $inventory_items
            ->map(fn ($inventory_item) => $inventory_item->batch->supplier)
            ->keyBy('id')
            ->values();

        if ($suppliers->isEmpty()) {
            return;
        }

        $supplier_commision_setting = CommissionSetting::where('type', 'supplier')->first();
        if (empty($supplier_commision_setting)) {
            $admins = User::whereHas('roles', function ($query) {
                $query->where('name', 'Admin');
            })->get();

            if ($admins->isNotEmpty()) {
                foreach ($admins as $admin) {
                    $admin->notify(new SupplierCommissionNotSetNotification);
                }
            }

            return;
        }

        foreach ($suppliers as $supplier) {
            SupplierCommission::create([
                'order_id' => $this->order->id,
                'supplier_id' => $supplier->id,
                'commission_rate' => $supplier_commision_setting->commission_rate,
                'commission_amount' => $this->order->amount * $supplier_commision_setting->commission_rate / 100,
            ]);
        }

    }
}
