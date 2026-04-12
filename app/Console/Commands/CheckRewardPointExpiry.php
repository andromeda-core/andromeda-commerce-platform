<?php

namespace App\Console\Commands;

use App\Models\RewardPoint;
use Illuminate\Console\Command;

class CheckRewardPointExpiry extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-reward-point-expiry';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reward Points Expiry Checker';

    public function handle()
    {
        RewardPoint::whereDate('expires_at', '<=', now())->delete();

    }
}
