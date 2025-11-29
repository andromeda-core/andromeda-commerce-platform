<?php

namespace App\Jobs;

use App\Models\Post;
use FFMpeg\FFMpeg;
use FFMpeg\Format\Video\X264;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;
use Str;

class CompressPostVideoWithFFMPEG implements ShouldQueue
{
    use Queueable;

    public $timeout = 14400;

    public $tries = 1;

    public function __construct(private array $videoPaths, private Post $post, private string $type) {}

    public function handle(): void
    {
        $paths = [];

        foreach ($this->videoPaths as $tempPath) {

            $realPath = Storage::disk('local')->path($tempPath);

            $compressedName = time().uniqid().'-'.Str::random(8).'.mp4';
            $compressedPath = Storage::disk('local')->path('temp/uploads/'.$compressedName);

            $ffmpeg = FFMpeg::create([
                'ffmpeg.binaries' => '/usr/bin/ffmpeg',
                'ffprobe.binaries' => '/usr/bin/ffprobe',
                'timeout' => 14400,
                'ffmpeg.threads' => 4,
                'ffmpeg.verbosity' => 'quiet',
            ]);

            $ffprobe = \FFMpeg\FFProbe::create([
                'ffmpeg.binaries' => '/usr/bin/ffmpeg',
                'ffprobe.binaries' => '/usr/bin/ffprobe',
            ]);

            $videoStreams = $ffprobe->streams($realPath)->videos();

            $videoFile = $ffmpeg->open($realPath);

            $rawThumbnailName = time().uniqid().'-'.Str::random(8).'.jpg';
            $rawThumbnailRelative = "temp/uploads/$rawThumbnailName";
            $rawThumbnailPath = Storage::disk('local')->path('temp/uploads/'.$rawThumbnailName);

            if ($videoStreams->count() === 0) {
                Storage::disk('local')->put(
                    $rawThumbnailRelative,
                    file_get_contents(public_path('assets/images/product/placeholder.jpg'))
                );
            } else {
                $videoFile->frame(\FFMpeg\Coordinate\TimeCode::fromSeconds(1))
                    ->save($rawThumbnailPath);
            }

            $thumbnailName = time().uniqid().'-'.Str::random(10).'.webp';

            $compressedThumb = ImageManager::imagick()
                ->read($rawThumbnailPath)
                ->scaleDown(800)
                ->encode(new WebpEncoder(quality: 70));

            Storage::disk('local')->put('temp/uploads/'.$thumbnailName, (string) $compressedThumb);

            $format = new X264('aac', 'libx264');

            $format->setAdditionalParameters([
                '-crf', '28',
                '-preset', 'medium',
                '-movflags', '+faststart',
                '-pix_fmt', 'yuv420p',
                '-f', 'mp4',
            ]);
            $videoFile->save($format, $compressedPath);

            Storage::disk('local')->delete("temp/uploads/$rawThumbnailName");
            Storage::disk('local')->delete($tempPath);

            $paths[] = [
                'video' => 'temp/uploads/'.$compressedName,
                'thumbnail' => 'temp/uploads/'.$thumbnailName,
            ];
        }

        if ($this->type === 'store') {
            dispatch(new PostStoreOnAWSJob(['videos' => $paths], $this->post));
        } elseif ($this->type === 'update') {
            dispatch(new PostUpdateOnAWSjob(['videos' => $paths], $this->post));
        }

    }
}
