<?php

namespace App\Console\Commands;

use App\Services\MetaService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class MetaPageTokenRefresh extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:meta-page-token-refresh';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Refreshes Meta Long Lived Tokens';

    /**
     * Execute the console command.
     */
    public function handle()
    {

        $meta_setting = Cache::get('meta_setting');
        if (empty($meta_setting)) {
            return false;
        }

        $meta_service = new MetaService($meta_setting);

        $meta_fb_refreshed = $meta_service->refreshFacebookPageToken();
        $meta_ig_refreshed = $meta_service->refreshInstagramUserToken();

        // if ($meta_fb_refreshed) {
        //     info('Meta FB Page Token Refreshed');
        // } else {
        //     info('Meta FB Page Token is Still Valid');
        // }

        // if ($meta_ig_refreshed) {
        //     info('Meta IG User Token Refreshed');
        // } else {
        //     info('Meta IG User Token is Still Valid');
        // }
    }
}
