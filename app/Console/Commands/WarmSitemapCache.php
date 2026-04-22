<?php

namespace App\Console\Commands;

use App\Http\Controllers\SitemapController;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class WarmSitemapCache extends Command
{
    protected $signature = 'sitemap:warm';
    protected $description = 'Warm sitemap cache';

    public function handle(): void
    {
        Cache::forget('sitemap');
        app(SitemapController::class)();
        $this->info('✓ Sitemap cache warmed.');
    }
}
