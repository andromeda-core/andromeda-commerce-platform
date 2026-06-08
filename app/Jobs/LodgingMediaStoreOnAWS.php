<?php

namespace App\Jobs;

use App\Models\LodgingMedia;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Str;

class LodgingMediaStoreOnAWS implements ShouldQueue
{
    use Queueable;

    public $tries = 5;

    public $backoff = 30;

    public $timeout = 300;

    public function __construct(
        private ?string $file,
        private LodgingMedia $lodging_media,
        private string $dir,
        private ?string $thumbnail = null,
        private string $thumbnail_dir = 'Lodging/Videos/Thumbnails/',
    ) {}

    public function handle(): void
    {
        if (empty($this->file)) {
            return;
        }

        $fullLocalPath = Storage::disk('local')->path($this->file);
        $extension = pathinfo($this->file, PATHINFO_EXTENSION);
        $mimeType = mime_content_type($fullLocalPath);
        $fileSize = filesize($fullLocalPath);

        $new_name = time() . uniqid() . '-' . Str::random(10) . '.' . $extension;
        $s3Key = $this->dir . $new_name;

        Storage::disk('s3')->put($s3Key, file_get_contents($fullLocalPath), [
            'CacheControl' => 'public, max-age=31536000',
            'ContentType' => $mimeType,
        ]);

        $url = Storage::disk('s3')->url($s3Key);

        $data = [
            'file_name' => $new_name,
            'file_path' => $s3Key,
            'file_url' => $url,
            'mime_type' => $mimeType,
            'size' => $fileSize,
            'upload_status' => 'completed',
        ];

        // Thumbnail (videos only).
        if (! empty($this->thumbnail)) {
            $fullThumbLocalPath = Storage::disk('local')->path($this->thumbnail);
            $thumb_ext = pathinfo($this->thumbnail, PATHINFO_EXTENSION);
            $new_thumb_name = time() . uniqid() . '-' . Str::random(10) . '.' . $thumb_ext;
            $thumbKey = $this->thumbnail_dir . $new_thumb_name;

            Storage::disk('s3')->put($thumbKey, file_get_contents($fullThumbLocalPath), [
                'CacheControl' => 'public, max-age=31536000',
                'ContentType' => mime_content_type($fullThumbLocalPath),
            ]);

            $data['thumbnail_url'] = Storage::disk('s3')->url($thumbKey);
        }

        $this->lodging_media->update($data);

        // Delete local temp only AFTER the row is finalized, so a failure before this point
        // leaves the source in place and the retry can re-run cleanly (no orphaned S3 object).
        Storage::disk('local')->delete($this->file);
        if (! empty($this->thumbnail)) {
            Storage::disk('local')->delete($this->thumbnail);
        }
    }

    public function failed(\Throwable $exception): void
    {
        $this->lodging_media->update(['upload_status' => 'failed']);
    }
}
