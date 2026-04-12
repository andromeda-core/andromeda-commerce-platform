<?php

namespace App\Jobs;

use App\Models\CommissionSetting;
use App\Models\DistributorCommission;
use App\Models\Order;
use App\Models\User;
use App\Notifications\DistributorCommissionNotSetNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class DistributorCommissionSet implements ShouldQueue
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

        $distributor = $this->order->orderItems->first()->smartphone->category->distributor;
        if (empty($distributor)) {
            return;
        }

        $distributor_commission_rate = 0;
        if (! empty($distributor->commission_rate)) {
            $distributor_commission_rate = $distributor->commission_rate;
        } else {
            $distributor_commision_setting = CommissionSetting::where('type', 'distributor')->first();
            if (empty($distributor_commision_setting) && $distributor_commission_rate == 0) {
                $admins = User::whereHas('roles', function ($query) {
                    $query->where('name', 'Admin');
                })->get();

                if ($admins->isNotEmpty()) {
                    foreach ($admins as $admin) {
                        $admin->notify(new DistributorCommissionNotSetNotification);
                    }
                }

                return;
            }

            $distributor_commission_rate = $distributor_commision_setting->commission_rate;
        }

        DistributorCommission::create([
            'order_id' => $this->order->id,
            'distributor_id' => $distributor->id,
            'commission_rate' => $distributor_commission_rate,
            'commission_amount' => $this->order->amount * $distributor_commission_rate / 100,
        ]);

    }
}
