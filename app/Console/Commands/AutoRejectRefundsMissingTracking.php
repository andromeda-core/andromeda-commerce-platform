<?php

namespace App\Console\Commands;

use App\Models\OrderRefund;
use Illuminate\Console\Command;

class AutoRejectRefundsMissingTracking extends Command
{
    protected $signature = 'app:auto-reject-refunds-missing-tracking';

    protected $description = 'Auto-reject refunds where customer did not upload return tracking slip within 48 hours';

    public function handle()
    {
        OrderRefund::where('refund_status', 'awaiting_return_tracking')
            ->whereNotNull('return_tracking_deadline_at')
            ->where('return_tracking_deadline_at', '<', now())
            ->whereNull('return_tracking_image')
            ->chunk(100, function ($refunds) {

                foreach ($refunds as $refund) {

                    $refund->update([
                        'refund_status'  => 'rejected',
                        'rejected_at'    => now(),
                        'is_auto_rejected' => true,
                    ]);
                }
            });
    }
}
