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

    public function __construct(
        private array $files
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
    }
}
