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
        private ?string $barcode_photo,
        private ?string $screen_recording_video,
        private ?string $screen_recording_thumbnail,
        private ?string $scene_video,
        private ?string $scene_video_thumbnail,
    ) {}

    public function handle(): void
    {
        $files = [
            $this->barcode_photo,
            $this->screen_recording_video,
            $this->screen_recording_thumbnail,
            $this->scene_video,
            $this->scene_video_thumbnail,
        ];

        foreach ($files as $file) {
            if (empty($file)) {
                continue;
            }

            $relative_path = Str::replaceFirst(
                config('filesystems.disks.s3.url').'/',
                '',
                $file
            );

            if (Storage::disk('s3')->exists($relative_path)) {
                Storage::disk('s3')->delete($relative_path);
            }
        }
    }
}
