<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;

class InternalProductVideoDestroyOnAWS implements ShouldQueue
{
    use Queueable;

    public $tries = 5;

    public $backoff = 30;

    public $timeout = 300;

    public function __construct(
        private ?string $file_path,
    ) {}

    public function handle(): void
    {
        if (! empty($this->file_path)) {
            if (Storage::disk('s3')->exists($this->file_path)) {
                Storage::disk('s3')->delete($this->file_path);
            }
        }
    }
}
