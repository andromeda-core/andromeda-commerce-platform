<?php

namespace App\Jobs\Meta;

use App\Models\MetaSetting;
use App\Services\MetaService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ExchangeTokenJob implements ShouldQueue
{
    use Queueable;

    public $tries = 5;

    public $backoff = 30;

    public $timeout = 300;

    public function __construct(private MetaSetting $meta_setting) {}

    public function handle(): void
    {
        $meta_service = new MetaService($this->meta_setting);
        $meta_service->getFacebookLongLivedToken();
        $meta_service->getInstagramAccountAndMarkAsTokenTypeLongLived();
    }
}
