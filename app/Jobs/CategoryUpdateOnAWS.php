<?php

namespace App\Jobs;

use App\Models\Category;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Str;

class CategoryUpdateOnAWS implements ShouldQueue
{
    use Queueable;

    public $tries = 5;

    public $backoff = 30;

    public $timeout = 300;

    public function __construct(
        private string $file,
        private Category $category,
        private $categories_dir = 'Categories/Thumbnails/',
    ) {}

    public function handle(): void
    {
        if (! empty($this->file)) {

            $fullLocalPath = Storage::disk('local')->path($this->file);

            $extension = pathinfo($this->file, PATHINFO_EXTENSION);
            $new_name = time().uniqid().'-'.Str::random(10).'.'.$extension;

            Storage::disk('s3')->put($this->categories_dir.$new_name, file_get_contents($fullLocalPath));
            Storage::disk('local')->delete($this->file);

            $url = Storage::disk('s3')->url($this->categories_dir.$new_name);

            $thumbnail = [
                'name' => $new_name,
                'url' => $url,
            ];

            $this->category->update(['thumbnail' => $thumbnail]);

        }

    }
}
