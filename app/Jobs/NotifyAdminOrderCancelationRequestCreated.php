<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\OrderCancelationRequest;
use App\Models\User;
use App\Notifications\OrderCancellationRequestedForAdmin;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class NotifyAdminOrderCancelationRequestCreated implements ShouldQueue
{
    use Queueable;

    public $tries = 5;

    public $backoff = 30;

    public $timeout = 300;

    public function __construct(
        private Order $order,
        private OrderCancelationRequest $cancelationRequest
    ) {}

    public function handle(): void
    {

        $admins = User::whereHas('roles', function ($query) {
            $query->where('name', 'Admin');
        })->get();

        if ($admins->isNotEmpty()) {
            $admins->each(function ($admin) {
                $admin->notify(new OrderCancellationRequestedForAdmin($this->order, $this->cancelationRequest));
            });

        }

    }
}
