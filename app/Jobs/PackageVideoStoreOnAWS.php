<?php

namespace App\Jobs;

use App\Models\PackageRecording;
use App\Notifications\OrderPackageVideoAddedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Str;

class PackageVideoStoreOnAWS implements ShouldQueue
{
    use Queueable;

    public $tries = 5;

    public $backoff = 30;

    public $timeout = 300;

    public function __construct(
        private string $file,
        private PackageRecording $package_recording,
        private $package_recording_dir = 'PackageRecording/Videos/',
    ) {}

    public function handle(): void
    {
        if (empty($this->file)) {
            return;
        }

        $fullLocalPath = Storage::disk('local')->path($this->file);

        $extension = pathinfo($this->file, PATHINFO_EXTENSION);

        $new_name = 'OPV-'.time().uniqid().'-'.Str::random(10).'.'.$extension;
        Storage::disk('s3')->put($this->package_recording_dir.$new_name, file_get_contents($fullLocalPath));
        Storage::disk('local')->delete($this->file);

        $url = Storage::disk('s3')->url($this->package_recording_dir.$new_name);
        $updated = $this->package_recording->update(['package_video' => $url]);

        if (! $updated) {
            return;
        }

        if (
            ! empty(Cache::get('smtp_config')) &&
            $this->package_recording->order &&
            $this->package_recording->order->customer->user &&
            $this->package_recording->order->customer->user->email
        ) {
            $this->package_recording->order->customer->user->notify(new OrderPackageVideoAddedNotification($this->package_recording));
        }

    }
}
