<?php

namespace App\Console\Commands;

use App\Models\EmailChangeRequest;
use Illuminate\Console\Command;

class ExpireOldEmailChangeRequests extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:expire-old-email-change-requests';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'This Command Expires Old Email Change Requests';

    public function handle()
    {
        EmailChangeRequest::where('status', 'pending')
            ->where('expires_at', '<=', now())
            ->chunk(100, function ($emailChangeRequests) {
                foreach ($emailChangeRequests as $emailChangeRequest) {
                    $emailChangeRequest->update([
                        'status' => 'expired',
                        'token' => null,
                    ]);
                }
            });
    }
}
