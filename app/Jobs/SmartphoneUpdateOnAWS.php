<?php

namespace App\Jobs;

use App\Models\Smartphone;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Str;

class SmartphoneUpdateOnAWS implements ShouldQueue
{
    use Queueable;

    public $tries = 5;

    public $backoff = 30;

    public $timeout = 300;

    public function __construct(
        private array $files,
        private Smartphone $smartphone,
        private string $smartphone_images_dir = 'Smartphones/Images'
    ) {}

    public function handle(): void
    {
        $this->smartphone->refresh();

        $images = [];

        if (isset($this->files['images'])) {

            foreach ($this->files['images'] as $image) {
                $fullLocalPath = Storage::disk('local')->path($image);

                $extension = pathinfo($image, PATHINFO_EXTENSION);
                $new_name = time().uniqid().'-'.Str::random(10).'.'.$extension;

                Storage::disk('s3')->put($this->smartphone_images_dir.$new_name, file_get_contents($fullLocalPath));
                Storage::disk('local')->delete($image);

                $url = Storage::disk('s3')->url($this->smartphone_images_dir.$new_name);

                if (! blank($this->smartphone?->images)) {
                    $images = $this->smartphone?->images;
                }

                $images[] = [
                    'name' => $new_name,
                    'url' => $url,
                ];

                $this->smartphone->update(['images' => $images]);
                $this->smartphone->refresh();
            }

        }
    }
}
