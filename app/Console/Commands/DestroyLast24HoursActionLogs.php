<?php

namespace App\Console\Commands;

use App\Models\ActionLog;
use Illuminate\Console\Command;

class DestroyLast24HoursActionLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:destroy-last24-hours-action-logs';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'This Command Will Destroy Last 24 Hours Action Logs';

    public function handle()
    {
        ActionLog::where('created_at', '<=', now()->subDays(1))->delete();
    }
}
