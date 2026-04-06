<?php

namespace App\Jobs;

use App\Models\PackageRecording;
use FFMpeg\FFMpeg;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;
use Str;

class CompressPackageRecordingWithFFMPEG implements ShouldQueue
{
    use Queueable;

    public $timeout = 14400;

    public $tries = 1;

    public function __construct(
        private string $tempPath,
        private PackageRecording $pr,
        private string $column_name
    ) {}

    public function handle(): void
    {
        $thumbnailColumn = match ($this->column_name) {
            'screen_recording_video' => 'screen_recording_thumbnail',
            'scene_video' => 'scene_video_thumbnail',
            default => 'screen_recording_thumbnail',
        };

        $path = [];

        $realPath = Storage::disk('local')->path($this->tempPath);

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
        Storage::disk('local')->delete("temp/uploads/$rawThumbnailName");

        $path = [
            'video' => $this->tempPath,
            'thumbnail' => 'temp/uploads/'.$thumbnailName,
        ];

        dispatch(new PackageVideoStoreOnAWS($path, $this->pr, column_name: $this->column_name, thumbnail_column: $thumbnailColumn));
    }
}
