<?php

namespace App\Jobs;

use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Str;

class CourierInvoiceStoreOnAWS implements ShouldQueue
{
    use Queueable;

    public $tries = 5;

    public $backoff = 30;

    public $timeout = 300;

    public function __construct(
        private string $file,
        private Order $order,
        private $courier_invoice_dir = 'Orders/CourierInvoices/',
    ) {}

    public function handle(): void
    {
        if (empty($this->file)) {
            return;
        }
        $fullLocalPath = Storage::disk('local')->path($this->file);
        $extension = pathinfo($this->file, PATHINFO_EXTENSION);
        $new_name = time().uniqid().'-'.Str::random(10).'.'.$extension;
        Storage::disk('s3')->put($this->courier_invoice_dir.$new_name, file_get_contents($fullLocalPath));
        Storage::disk('local')->delete($this->file);

        $url = Storage::disk('s3')->url($this->courier_invoice_dir.$new_name);
        $this->order->update(['courier_invoice' => $url]);
    }
}
