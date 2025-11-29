<?php

namespace App\Jobs;

use App\Models\Batch;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Str;

class StoreBatchInvoicesOnAWS implements ShouldQueue
{
    use Queueable;

    public $tries = 5;

    public $backoff = 30;

    public $timeout = 300;

    public function __construct(
        private array $files,
        private Batch $batch,
        private string $batch_invoices_dir = 'Batch/Invoices'
    ) {
        //
    }

    public function handle(): void
    {
        $invoices = [];
        if (isset($this->files['invoices'])) {

            foreach ($this->files['invoices'] as $invoice) {
                $fullLocalPath = Storage::disk('local')->path($invoice);

                $extension = pathinfo($invoice, PATHINFO_EXTENSION);
                $new_name = time().uniqid().'-'.Str::random(10).'.'.$extension;

                Storage::disk('s3')->put($this->batch_invoices_dir.$new_name, file_get_contents($fullLocalPath), [
                    'CacheControl' => 'public, max-age=31536000',
                    'ContentType' => mime_content_type($fullLocalPath),
                ]);
                Storage::disk('local')->delete($invoice);

                $url = Storage::disk('s3')->url($this->batch_invoices_dir.$new_name);
                $invoices[] = [
                    'name' => $new_name,
                    'url' => $url,
                ];

            }
            $this->batch->update(['invoices' => $invoices]);

        }
    }
}
