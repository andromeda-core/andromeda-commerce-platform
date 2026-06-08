<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Str;

class LodgingMediaDestroyOnAWS implements ShouldQueue
{
    use Queueable;

    public $tries = 5;

    public $backoff = 30;

    public $timeout = 300;

    public function __construct(
        private ?string $file_path,
        private ?string $thumbnail_url = null,
    ) {}

    public function handle(): void
    {
        // Accepts either an S3 key (file_path) or a full S3 URL (thumbnail_url);
        // replaceFirst normalizes a URL to its key and leaves a bare key untouched.
        foreach ([$this->file_path, $this->thumbnail_url] as $path) {
            if (empty($path)) {
                continue;
            }

            $relative_path = Str::replaceFirst(config('filesystems.disks.s3.url') . '/', '', $path);

            if (Storage::disk('s3')->exists($relative_path)) {
                Storage::disk('s3')->delete($relative_path);
            }
        }
    }
}
