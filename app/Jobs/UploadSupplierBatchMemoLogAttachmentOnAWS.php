<?php

namespace App\Jobs;

use App\Models\SupplierAssignmentLog;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Str;

class UploadSupplierBatchMemoLogAttachmentOnAWS implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private SupplierAssignmentLog $log,
        private string $path,
        private string $batch_invoices_logs_dir = 'Batch/Invoices/Logs/'
    ) {}

    public function handle(): void
    {
        if (! Storage::disk('local')->exists($this->path)) {
            throw new \Exception("File not found on local disk: {$this->path}");
        }

        $fullLocalPath = Storage::disk('local')->path($this->path);

        $extension = pathinfo($this->path, PATHINFO_EXTENSION);
        $new_name = time().uniqid().'-'.Str::random(10).'.'.$extension;

        Storage::disk('s3')->put($this->batch_invoices_logs_dir.$new_name, file_get_contents($fullLocalPath), [
            'CacheControl' => 'public, max-age=31536000',
            'ContentType' => mime_content_type($fullLocalPath),
        ]);
        Storage::disk('local')->delete($this->path);

        $url = Storage::disk('s3')->url($this->batch_invoices_logs_dir.$new_name);

        $this->log->updateQuietly([
            'file_path' => $url,
            'file_name' => $new_name,
            'file_type' => $extension,
        ]);
    }
}
