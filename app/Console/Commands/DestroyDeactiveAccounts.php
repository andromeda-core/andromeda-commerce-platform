<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Notifications\PermanentlyDestroyDeactivatedAccount;
use Illuminate\Console\Command;

class DestroyDeactiveAccounts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:destroy-deactive-accounts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'This Command Destroys All Deactiveated Accounts After 30 Days of Deactivation';

    public function handle()
    {
        User::where('is_deactivated', true)->where('deactivated_at', '<=', now()->subDays(30))->chunk(100, function ($users) {
            foreach ($users as $user) {

                $user->notify(new PermanentlyDestroyDeactivatedAccount);
                $user->delete();
            }

        });

        return Command::SUCCESS;
    }
}
