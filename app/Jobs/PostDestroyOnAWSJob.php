<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Str;

class PostDestroyOnAWSJob implements ShouldQueue
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

                $relative_path = Str::after($image, '.com/');

                if (Storage::disk('s3')->exists($relative_path)) {
                    Storage::disk('s3')->delete($relative_path);
                }
            }
        }

        if (isset($this->files['videos'])) {
            foreach ($this->files['videos'] as $video) {

                $relative_path = Str::after($video, '.com/');

                if (Storage::disk('s3')->exists($relative_path)) {
                    Storage::disk('s3')->delete($relative_path);
                }
            }
        }
    }
}
