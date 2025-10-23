<?php

namespace App\Jobs;

use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Str;

class PayemntProofStoreOnAWS implements ShouldQueue
{
    use Queueable;

    public $tries = 5;

    public $backoff = 30;

    public $timeout = 300;

    public function __construct(
        private string $image,
        private Order $order,
        private $payment_proof_dir = 'Orders/PaymentProofs/',
    ) {}

    public function handle(): void
    {
        if (empty($this->image)) {
            return;
        }
        $fullLocalPath = Storage::disk('local')->path($this->image);
        $extension = pathinfo($this->image, PATHINFO_EXTENSION);
        $new_name = time().uniqid().'-'.Str::random(10).'.'.$extension;
        Storage::disk('s3')->put($this->payment_proof_dir.$new_name, file_get_contents($fullLocalPath));
        Storage::disk('local')->delete($this->image);

        $url = Storage::disk('s3')->url($this->payment_proof_dir.$new_name);

        $this->order->update(['payment_proof' => $url]);
    }
}
