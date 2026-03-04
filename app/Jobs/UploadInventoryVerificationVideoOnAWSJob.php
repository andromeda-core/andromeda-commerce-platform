<?php

namespace App\Jobs;

use App\Models\InventoryVerification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Str;

class UploadInventoryVerificationVideoOnAWSJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private InventoryVerification $verification,
        private string $tempPath,
        private string $dir = 'InventoryVerification/Videos/',
    ) {}

    public function handle(): void
    {
        if (empty($this->tempPath)) {
            return;
        }
        $fullLocalPath = Storage::disk('local')->path($this->tempPath);
        $extension = pathinfo($this->tempPath, PATHINFO_EXTENSION);
        $new_name = time().uniqid().'-'.Str::random(10).'.'.$extension;
        Storage::disk('s3')->put($this->dir.$new_name, file_get_contents($fullLocalPath));
        Storage::disk('local')->delete($this->tempPath);

        $url = Storage::disk('s3')->url($this->dir.$new_name);

        $this->verification->update(['video' => $url]);
    }
}
