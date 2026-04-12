<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Str;

class SmartphoneDestroyOnAWS implements ShouldQueue
{
    use Queueable;

    public $tries = 5;

    public $backoff = 30;

    public $timeout = 300;

    /**
     * Create a new job instance.
     */
    public function __construct(
        private array $files,
    ) {}

    public function handle(): void
    {

        if (isset($this->files['images'])) {
            foreach ($this->files['images'] as $image) {

                $relative_path = Str::replaceFirst(config('filesystems.disks.s3.url').'/', '', $image);

                if (Storage::disk('s3')->exists($relative_path)) {
                    Storage::disk('s3')->delete($relative_path);
                }
            }
        }

        if (isset($this->files['videos'])) {
            foreach ($this->files['videos'] as $result) {
                $video = $result['url'];
                $relative_path = Str::replaceFirst(config('filesystems.disks.s3.url').'/', '', $video);

                if (Storage::disk('s3')->exists($relative_path)) {
                    Storage::disk('s3')->delete($relative_path);
                }

                // Isset Logic is Because This is new logic so It wont fail when Old Smartphone Deletes
                if (isset($result['thumbnail_url'])) {
                    $thumbnail = $result['thumbnail_url'];
                    $relative_thumb_path = Str::replaceFirst(config('filesystems.disks.s3.url').'/', '', $thumbnail);
                    if (Storage::disk('s3')->exists($relative_thumb_path)) {
                        Storage::disk('s3')->delete($relative_thumb_path);
                    }
                }
            }
        }
    }
}
