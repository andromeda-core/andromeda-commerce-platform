<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Notifications\DormantAccountNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class MarkUserAsDormant extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:mark-user-as-dormant-command';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'This Command Runs And Checks For Users Who Spans On Dormant ThresHold And Marks Them As Dormant';

    public function handle()
    {
        $dormancy_setting = Cache::get('dormancy_setting');
        if (empty($dormancy_setting)) {
            return Command::SUCCESS;
        }

        $thresHoldInMinutes = 0;

        switch ($dormancy_setting->dormancy_threshold_type) {
            case 'minutes':
                $thresHoldInMinutes = $dormancy_setting->dormancy_threshold_value;
                break;
            case 'hours':
                $thresHoldInMinutes = $dormancy_setting->dormancy_threshold_value * 60;
                break;
            case 'days':
                $thresHoldInMinutes = $dormancy_setting->dormancy_threshold_value * 1440;
                break;
            case 'years':
                $thresHoldInMinutes = $dormancy_setting->dormancy_threshold_value * 525600;
                break;
            default:
                0;
                break;
        }

        if ($thresHoldInMinutes <= 0) {
            return Command::SUCCESS;
        }

        // Logic to mark users as dormant based on $dormancy_setting

        User::where('is_dormant', false)
            ->whereNotNull('last_activity_at')
            ->whereHas('roles', function ($query) {
                $query->where('name', 'Customer');
            })
            ->where('last_activity_at', '<=', now()->subMinutes($thresHoldInMinutes))
            ->chunk(100, function ($users) {
                foreach ($users as $user) {
                    $user->is_dormant = true;
                    $user->dormant_at = now();
                    $user->save();

                    $user->notify(new DormantAccountNotification('dormant'));
                }
            });

        return Command::SUCCESS;

    }
}
