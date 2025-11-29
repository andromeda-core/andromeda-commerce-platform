<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Str;

class AppDarkLogoDestroyOnAWS implements ShouldQueue
{
    use Queueable;

    public $tries = 5;

    public $backoff = 30;

    public $timeout = 300;

    public function __construct(
        private ?string $file
    ) {}

    public function handle(): void
    {
        if (empty($this->file)) {
            return;
        }

        $relative_path = Str::replaceFirst(config('filesystems.disks.s3.url').'/', '', $this->file);

        if (Storage::disk('s3')->exists($relative_path)) {
            Storage::disk('s3')->delete($relative_path);
        }
    }
}
