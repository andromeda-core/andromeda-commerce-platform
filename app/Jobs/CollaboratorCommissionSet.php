<?php

namespace App\Jobs;

use App\Models\CollaboratorCommission;
use App\Models\CommissionSetting;
use App\Models\Order;
use App\Models\User;
use App\Notifications\CollaboratorCommissionNotSetNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class CollaboratorCommissionSet implements ShouldQueue
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

        $collaborator_commission_rate = 0;
        if (! empty($this->order->collaborator->commission_rate)) {
            $collaborator_commission_rate = $this->order->collaborator->commission_rate;
        } else {

            $collaborator_commision_setting = CommissionSetting::where('type', 'collaborator')->first();
            if (empty($collaborator_commision_setting) && $collaborator_commission_rate == 0) {
                $admins = User::whereHas('roles', function ($query) {
                    $query->where('name', 'Admin');
                })->get();

                if ($admins->isNotEmpty()) {
                    foreach ($admins as $admin) {
                        $admin->notify(new CollaboratorCommissionNotSetNotification);
                    }
                }

                return;
            }

            $collaborator_commission_rate = $collaborator_commision_setting->commission_rate;
        }

        CollaboratorCommission::create([
            'order_id' => $this->order->id,
            'collaborator_id' => $this->order->collaborator_id,
            'commission_rate' => $collaborator_commission_rate,
            'commission_amount' => $this->order->amount * $collaborator_commission_rate / 100,
        ]);

    }
}
