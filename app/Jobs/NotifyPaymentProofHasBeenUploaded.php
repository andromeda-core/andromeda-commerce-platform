<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\User;
use App\Notifications\NotifyAdminPaymentProofHasBeenUploadedNotification;
use App\Notifications\NotifyCustomerHisPaymentProofhasbeenUploadedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class NotifyPaymentProofHasBeenUploaded implements ShouldQueue
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
        $user = $this->order->customer->user;
        if (! empty($user)) {
            $user->notify(new NotifyCustomerHisPaymentProofhasbeenUploadedNotification($this->order));
        }

        $admins = User::whereHas('roles', function ($query) {
            $query->where('name', 'Admin');
        })->get();

        if ($admins->isNotEmpty()) {
            $admins->each(function ($admin) {
                $admin->notify(new NotifyAdminPaymentProofHasBeenUploadedNotification($this->order));
            });

        }
    }
}
