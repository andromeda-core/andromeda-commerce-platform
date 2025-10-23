<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Str;

class PaymentProofDestroyOnAWS implements ShouldQueue
{
    use Queueable;

    public $tries = 5;

    public $backoff = 30;

    public $timeout = 300;

    public function __construct(
        private string $image
    ) {}

    public function handle(): void
    {
        if (empty($this->image)) {
            return;
        }

        $relative_path = Str::after($this->image, '.com/');

        if (Storage::disk('s3')->exists($relative_path)) {
            Storage::disk('s3')->delete($relative_path);
        }
    }
}
