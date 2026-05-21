<?php

namespace App\Jobs;

use App\Models\InternalProductImage;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Str;

class InternalProductImageStoreOnAWS implements ShouldQueue
{
    use Queueable;

    public $tries = 5;

    public $backoff = 30;

    public $timeout = 300;

    public function __construct(
        private ?string $file,
        private InternalProductImage $internal_product_image,
        private string $dir,
    ) {}

    public function handle(): void
    {
        if (empty($this->file)) {
            return;
        }

        $fullLocalPath = Storage::disk('local')->path($this->file);
        $extension = pathinfo($this->file, PATHINFO_EXTENSION);
        $mimeType = mime_content_type($fullLocalPath);
        $fileSize = filesize($fullLocalPath);
        $fileContents = file_get_contents($fullLocalPath);

        $new_name = time() . uniqid() . '-' . Str::random(10) . '.' . $extension;
        $s3Key = $this->dir . $new_name;

        Storage::disk('s3')->put($s3Key, $fileContents, [
            'CacheControl' => 'public, max-age=31536000',
            'ContentType' => $mimeType,
        ]);

        Storage::disk('local')->delete($this->file);

        $url = Storage::disk('s3')->url($s3Key);

        $this->internal_product_image->update([
            'file_name' => $new_name,
            'file_path' => $s3Key,
            'file_url' => $url,
            'extension' => $extension,
            'mime_type' => $mimeType,
            'size' => $fileSize,
            'upload_status' => 'completed',
        ]);
    }

    public function failed(\Throwable $exception): void
    {
        $this->internal_product_image->update(['upload_status' => 'failed']);
    }
}
