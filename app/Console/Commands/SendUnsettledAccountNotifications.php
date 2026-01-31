<?php

namespace App\Console\Commands;

use App\Helpers\UnsettledAccountMessageBuilder;
use App\Models\UnsettledAccount;
use App\Models\UnsettledAccountNotificationLog;
use App\Models\UnsettledAccountNotificationSetting;
use App\Notifications\SendUnsettledAccountNotification;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendUnsettledAccountNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-unsettled-account-notifications';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'This Command Sends Notification To User About Unsettled Account';

    public function handle()
    {
        UnsettledAccount::where('status', 'open')
            ->with(['user', 'order'])
            ->chunkById(
                100,
                function ($issues) {
                    foreach ($issues as $issue) {
                        $setting = UnsettledAccountNotificationSetting::where('reason', $issue->reason)
                            ->where('is_active', true)
                            ->first();
                        if (empty($setting)) {
                            continue;
                        }

                        $baseTime = $issue->detected_at;

                        $lastLog = UnsettledAccountNotificationLog::where('unsettled_account_id', $issue->id)
                            ->where('channel', $setting->channel)
                            ->latest('sent_at')
                            ->first();

                        $baseTime = ! empty($lastLog) ? $lastLog->sent_at : $issue->detected_at;
                        $carbonFormatedBaseTime = Carbon::parse($baseTime);
                        $nextSendTime = $carbonFormatedBaseTime->copy()->addHours($setting->delay);
                        if ($nextSendTime->isPast()) {

                            $message = UnsettledAccountMessageBuilder::build($issue);
                            $user = $issue->user;

                            $user->notify(
                                new SendUnsettledAccountNotification(
                                    message: $message,
                                    channel: $setting->channel,
                                    actionUrl: ! empty($issue->order_id) ? route('website.orders.order-view', $issue->order->order_no) : route('website.orders.index')
                                )
                            );

                            UnsettledAccountNotificationLog::create([
                                'user_id' => $issue->user_id,
                                'unsettled_account_id' => $issue->id,
                                'channel' => $setting->channel,
                                'message' => $message,
                                'sent_by' => null,
                                'is_system_sent' => true,
                                'sent_at' => now(),
                            ]);
                        }

                    }
                }
            );
    }
}
