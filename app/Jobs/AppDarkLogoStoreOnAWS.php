<?php

namespace App\Jobs;

use App\Models\GeneralSetting;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Str;

class AppDarkLogoStoreOnAWS implements ShouldQueue
{
    use Queueable;

    public $tries = 5;

    public $backoff = 30;

    public $timeout = 300;

    public function __construct(
        private ?string $file,
        private GeneralSetting $general_setting,
        private $general_setting_dir = 'GeneralSetting/Logos/',
    ) {}

    public function handle(): void
    {
        if (empty($this->file)) {
            return;
        }

        $fullLocalPath = Storage::disk('local')->path($this->file);
        $extension = pathinfo($this->file, PATHINFO_EXTENSION);
        $new_name = time().uniqid().'-'.Str::random(10).'.'.$extension;

        $mime_type = mime_content_type($fullLocalPath);

        Storage::disk('s3')
            ->put($this->general_setting_dir.$new_name, file_get_contents($fullLocalPath), [
                'CacheControl' => 'public, max-age=31536000',
                'ContentType' => mime_content_type($fullLocalPath),
            ]);

        //  Storage::disk('s3')
        //     ->put($this->general_setting_dir.$new_name, file_get_contents($fullLocalPath), [
        //         'ContentType' => $mime_type,
        //         'ACL' => 'public-read',
        //     ]);

        Storage::disk('local')->delete($this->file);

        $url = Storage::disk('s3')->url($this->general_setting_dir.$new_name);
        $this->general_setting->update(['app_main_logo_dark' => $url]);
    }
}
