<?php

namespace App\Console\Commands;

use App\Models\AccountRiskSignal;
use Illuminate\Console\Command;

class MarkExpireOldAccountRiskSignal extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:mark-expire-old-account-risk-signal';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'THis Command Marks Expire Old Account Risk Signal';

    public function handle()
    {
        AccountRiskSignal::where('status', 'open')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->chunkById(100, function ($signals) {
                foreach ($signals as $signal) {
                    $signal->update([
                        'status' => 'expired',
                        'expired_at' => now(),
                    ]);
                }
            });
    }
}
