<?php

namespace App\Console\Commands;

use App\Models\MetaContact;
use App\Services\MetaService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class TestingMetaMessaging extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'send:message';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {

        $user = MetaContact::find(2);
        // info($user);

        $meta_setting = Cache::get('meta_setting');

        $meta_service = new MetaService($meta_setting);

        $token = $user->platform === 'facebook' ? $meta_setting->meta_fb_page_access_token : $meta_setting->meta_ig_access_token;
        $internal_id = $user->platform === 'facebook' ? $meta_setting->meta_fb_page_id : $meta_setting->meta_ig_account_id;
        $res = $meta_service->sendMessageViaMeta($user->platform, $token, $internal_id, $user->platform_user_id, 'Hello World!');
        info($res);
        // info($meta_setting);

        // info('SENDING');
    }
}
