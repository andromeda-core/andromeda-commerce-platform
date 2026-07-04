<?php

namespace App\Jobs;

use App\Models\AdBanner;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Str;

class AdBannerImageStoreOnAWS implements ShouldQueue
{
    use Queueable;

    public $tries = 5;

    public $backoff = 30;

    public $timeout = 300;

    public function __construct(
        private ?string $file,
        private AdBanner $ad_banner,
        private string $dir = 'Ad-Banners/images/',
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

        $new_name = time().uniqid().'-'.Str::random(10).'.'.$extension;
        $s3Key = $this->dir.$new_name;

        Storage::disk('s3')->put($s3Key, $fileContents, [
            'CacheControl' => 'public, max-age=31536000',
            'ContentType' => $mimeType,
        ]);

        Storage::disk('local')->delete($this->file);

        $url = Storage::disk('s3')->url($s3Key);

        $this->ad_banner->update([
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
        $this->ad_banner->update(['upload_status' => 'failed']);
    }
}
