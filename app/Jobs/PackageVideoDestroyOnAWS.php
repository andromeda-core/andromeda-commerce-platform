<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Str;

class PackageVideoDestroyOnAWS implements ShouldQueue
{
    use Queueable;

    public $tries = 5;

    public $backoff = 30;

    public $timeout = 300;

    public function __construct(
        private ?string $video_url,
        private ?string $thumbnail_url
    ) {}

    public function handle(): void
    {
        if (! empty($this->video_url)) {
            $relative_path = Str::replaceFirst(config('filesystems.disks.s3.url').'/', '', $this->video_url);
            if (Storage::disk('s3')->exists($relative_path)) {
                Storage::disk('s3')->delete($relative_path);
            }

        }

        if (! empty($this->thumbnail_url)) {
            $relative_path = Str::replaceFirst(config('filesystems.disks.s3.url').'/', '', $this->thumbnail_url);
            if (Storage::disk('s3')->exists($relative_path)) {
                Storage::disk('s3')->delete($relative_path);
            }

        }
    }
}
