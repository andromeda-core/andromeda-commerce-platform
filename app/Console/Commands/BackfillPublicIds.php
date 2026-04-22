<?php

namespace App\Console\Commands;

use App\Models\Post;
use App\Models\Smartphone;
use Illuminate\Console\Command;
use Str;

class BackfillPublicIds extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:backfill-public-ids';

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
        Smartphone::whereNull('public_id')->each(function ($smartphone) {
            $smartphone->update(['public_id' => 'prd_' . Str::uuid()]);
        });

        Post::whereNull('public_id')->each(function ($post) {
            $post->update(['public_id' => 'pst_' . Str::uuid()]);
        });

        $this->info('Done!');
    }
}
