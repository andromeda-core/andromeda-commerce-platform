<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Str;

class DestroyUserProfileOnAWS implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private ?string $file
    ) {}

    public function handle(): void
    {
        if (! empty($this->file)) {
            $relative_path = Str::replaceFirst(config('filesystems.disks.s3.url').'/', '', $this->file);
            if (Storage::disk('s3')->exists($relative_path)) {
                Storage::disk('s3')->delete($relative_path);

            }

        }
    }
}
