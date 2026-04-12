<?php

namespace App\Jobs;

use App\Models\Smartphone;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Str;

class SmartphoneStoreOnAWS implements ShouldQueue
{
    use Queueable;

    public $tries = 5;

    public $backoff = 30;

    public $timeout = 300;

    public function __construct(
        private array $files,
        private Smartphone $smartphone,
        private string $smartphone_images_dir = 'Smartphones/Images/',
        private string $smartphone_videos_dir = 'Smartphones/Videos/',
        private string $smartphone_videos_thumbnails_dir = 'Smartphones/Videos/Thumbnails/'
    ) {}

    public function handle(): void
    {

        $videos = [];
        $images = [];

        if (isset($this->files['images'])) {

            foreach ($this->files['images'] as $image) {
                $fullLocalPath = Storage::disk('local')->path($image);

                $extension = pathinfo($image, PATHINFO_EXTENSION);
                $new_name = time().uniqid().'-'.Str::random(10).'.'.$extension;

                Storage::disk('s3')->put($this->smartphone_images_dir.$new_name, file_get_contents($fullLocalPath), [
                    'CacheControl' => 'public, max-age=31536000',
                    'ContentType' => mime_content_type($fullLocalPath),
                ]);
                Storage::disk('local')->delete($image);

                $url = Storage::disk('s3')->url($this->smartphone_images_dir.$new_name);
                $images[] = [
                    'name' => $new_name,
                    'url' => $url,
                ];

            }
            $this->smartphone->update(['images' => $images]);

        }

        if (isset($this->files['videos'])) {
            foreach ($this->files['videos'] as $result) {

                // VIDEO
                $video = $result['video'];
                $fullLocalPath = Storage::disk('local')->path($video);

                $extension = pathinfo($video, PATHINFO_EXTENSION);
                $new_name = time().uniqid().'-'.Str::random(10).'.'.$extension;

                Storage::disk('s3')->put($this->smartphone_videos_dir.$new_name, file_get_contents($fullLocalPath), [
                    'CacheControl' => 'public, max-age=31536000',
                    'ContentType' => mime_content_type($fullLocalPath),
                ]);
                Storage::disk('local')->delete($video);

                $url = Storage::disk('s3')->url($this->smartphone_videos_dir.$new_name);

                // Thumbnmail
                $thumbnail = $result['thumbnail'];
                $fullThumbLocalPath = Storage::disk('local')->path($thumbnail);
                $thumb_ext = pathinfo($thumbnail, PATHINFO_EXTENSION);
                $new_thumb_name = time().uniqid().'-'.Str::random(10).'.'.$thumb_ext;

                Storage::disk('s3')->put($this->smartphone_videos_thumbnails_dir.$new_thumb_name, file_get_contents($fullThumbLocalPath), [
                    'CacheControl' => 'public, max-age=31536000',
                    'ContentType' => mime_content_type($fullThumbLocalPath),
                ]);
                Storage::disk('local')->delete($thumbnail);

                $thumb_url = Storage::disk('s3')->url($this->smartphone_videos_thumbnails_dir.$new_thumb_name);

                if (! blank($this->smartphone->videos)) {
                    $videos = $this->smartphone?->videos;
                }

                $videos[] = [
                    'name' => $new_name,
                    'url' => $url,
                    'thumbnail_url' => $thumb_url,

                ];

            }

            $this->smartphone->update(['videos' => $videos]);
            $this->smartphone->refresh();
        }

    }
}
