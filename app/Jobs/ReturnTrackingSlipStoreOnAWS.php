<?php

namespace App\Jobs;

use App\Models\OrderRefund;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Str;

class ReturnTrackingSlipStoreOnAWS implements ShouldQueue
{
    use Queueable;

    public $tries = 5;
    public $backoff = 30;
    public $timeout = 300;

    public function __construct(
        private ?string $image,
        private OrderRefund $refund,
        private string $tracking_slip_dir = 'Orders/ReturnTrackingSlips/',
    ) {}

    public function handle(): void
    {
        if (empty($this->image)) {
            return;
        }

        $fullLocalPath = Storage::disk('local')->path($this->image);
        $extension     = pathinfo($this->image, PATHINFO_EXTENSION);
        $new_name      = time() . uniqid() . '-' . Str::random(10) . '.' . $extension;

        Storage::disk('s3')->put(
            $this->tracking_slip_dir . $new_name,
            file_get_contents($fullLocalPath)
        );

        Storage::disk('local')->delete($this->image);

        $url = Storage::disk('s3')->url($this->tracking_slip_dir . $new_name);

        $this->refund->update(['return_tracking_image' => $url]);
    }
}
