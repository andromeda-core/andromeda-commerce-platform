<?php

namespace App\Jobs;

use App\Models\Post;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Str;

class PostUpdateOnAWSjob implements ShouldQueue
{
    use Queueable;

    public $tries = 5;

    public $backoff = 30;

    public $timeout = 300;

    public function __construct(
        private array $files,
        private Post $post,
        private $post_images_dir = 'Posts/Images/',
        private $post_videos_dir = 'Posts/Videos/',
        private $post_videos_thumbnails_dir = 'Posts/Videos/Thumbnails/',

    ) {}

    public function handle(): void
    {

        $this->post->refresh();

        $images = [];
        $videos = [];

        if (isset($this->files['images'])) {

            foreach ($this->files['images'] as $image) {
                $fullLocalPath = Storage::disk('local')->path($image);

                $extension = pathinfo($image, PATHINFO_EXTENSION);
                $new_name = time().uniqid().'-'.Str::random(10).'.'.$extension;

                Storage::disk('s3')->put($this->post_images_dir.$new_name, file_get_contents($fullLocalPath), [
                    'CacheControl' => 'public, max-age=31536000',
                    'ContentType' => mime_content_type($fullLocalPath),
                ]);
                Storage::disk('local')->delete($image);

                $url = Storage::disk('s3')->url($this->post_images_dir.$new_name);

                if (! blank($this->post?->images)) {
                    $images = $this->post?->images;
                }

                $images[] = [
                    'name' => $new_name,
                    'url' => $url,
                ];

                $this->post->update(['images' => $images]);
                $this->post->refresh();
            }

        }

        if (isset($this->files['videos'])) {
            foreach ($this->files['videos'] as $result) {

                // VIDEO
                $video = $result['video'];
                $fullLocalPath = Storage::disk('local')->path($video);

                $extension = pathinfo($video, PATHINFO_EXTENSION);
                $new_name = time().uniqid().'-'.Str::random(10).'.'.$extension;

                Storage::disk('s3')->put($this->post_videos_dir.$new_name, file_get_contents($fullLocalPath), [
                    'CacheControl' => 'public, max-age=31536000',
                    'ContentType' => mime_content_type($fullLocalPath),
                ]);
                Storage::disk('local')->delete($video);

                $url = Storage::disk('s3')->url($this->post_videos_dir.$new_name);

                // Thumbnmail
                $thumbnail = $result['thumbnail'];
                $fullThumbLocalPath = Storage::disk('local')->path($thumbnail);
                $thumb_ext = pathinfo($thumbnail, PATHINFO_EXTENSION);
                $new_thumb_name = time().uniqid().'-'.Str::random(10).'.'.$thumb_ext;

                Storage::disk('s3')->put($this->post_videos_thumbnails_dir.$new_thumb_name, file_get_contents($fullThumbLocalPath), [
                    'CacheControl' => 'public, max-age=31536000',
                    'ContentType' => mime_content_type($fullThumbLocalPath),
                ]);
                Storage::disk('local')->delete($thumbnail);

                $thumb_url = Storage::disk('s3')->url($this->post_videos_thumbnails_dir.$new_thumb_name);

                if (! blank($this->post->videos)) {
                    $videos = $this->post?->videos;
                }

                $videos[] = [
                    'name' => $new_name,
                    'url' => $url,
                    'thumbnail_url' => $thumb_url,

                ];

            }

            $this->post->update(['videos' => $videos]);
            $this->post->refresh();
        }

    }
}
