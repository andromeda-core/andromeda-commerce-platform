<?php

namespace App\Console\Commands;

use App\Jobs\PackageVideoDestroyOnAWS;
use App\Models\PackageRecording;
use Illuminate\Console\Command;

class ClearPreviousOrderPackageRecordings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:clear-previous-order-package-recordings';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'This command will clear less than 30 days order package recordings';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        PackageRecording::whereDate('created_at', '<', now()->subDays(30))->chunk(100, function ($recordings) {
            foreach ($recordings as $recording) {

                if (! empty($recording->package_video)) {
                    dispatch(new PackageVideoDestroyOnAWS($recording->package_video, $recording->thumbnail_url));
                }

                $recording->delete();
            }
        });
    }
}
