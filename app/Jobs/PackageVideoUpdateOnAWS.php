<?php

namespace App\Jobs;

use App\Models\PackageRecording;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Str;

class PackageVideoUpdateOnAWS implements ShouldQueue
{
    use Queueable;

    public $tries = 5;

    public $backoff = 30;

    public $timeout = 300;

    public function __construct(
        private ?string $file,
        private PackageRecording $package_recording,
        private $package_recording_dir = 'PackageRecording/Videos/',
        private $package_recording_thumbnails_dir = 'PackageRecording/Videos/Thumbnail',
    ) {}

    public function handle(): void
    {
        if (blank($this->file)) {
            return;
        }

        $video = $this->file['video'];
        $fullLocalPath = Storage::disk('local')->path($video);
        $extension = pathinfo($video, PATHINFO_EXTENSION);

        $new_name = 'OPV-'.time().uniqid().'-'.Str::random(10).'.'.$extension;
        Storage::disk('s3')->put($this->package_recording_dir.$new_name, file_get_contents($fullLocalPath), [
            'CacheControl' => 'public, max-age=31536000',
            'ContentType' => mime_content_type($fullLocalPath),
        ]);
        Storage::disk('local')->delete($video);

        $url = Storage::disk('s3')->url($this->package_recording_dir.$new_name);

        $thumbnail = $this->file['thumbnail'];

        $fullThumbLocalPath = Storage::disk('local')->path($thumbnail);
        $thumb_ext = pathinfo($thumbnail, PATHINFO_EXTENSION);
        $new_thumb_name = time().uniqid().'-'.Str::random(10).'.'.$thumb_ext;

        Storage::disk('s3')->put($this->package_recording_thumbnails_dir.$new_thumb_name, file_get_contents($fullThumbLocalPath), [
            'CacheControl' => 'public, max-age=31536000',
            'ContentType' => mime_content_type($fullThumbLocalPath),
        ]);
        Storage::disk('local')->delete($thumbnail);

        $thumb_url = Storage::disk('s3')->url($this->package_recording_thumbnails_dir.$new_thumb_name);

        $this->package_recording->update(['package_video' => $url, 'thumbnail_url' => $thumb_url]);

    }
}
