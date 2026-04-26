<?php

namespace App\Notifications;

use App\Helpers\Trans;
use App\Models\OrderRefund;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RefundAutoRejectedNoTrackingNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private OrderRefund $refund) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Refund Request Rejected: Tracking Slip Not Uploaded', $locale))
            ->greeting(Trans::get('Hello', $locale) . ' ' . $this->refund->customer->user->name . ',')
            ->line(Trans::get('Unfortunately, your refund request has been automatically rejected.', $locale))
            ->line(Trans::get('Order Number', $locale) . ': ' . $this->refund->order->order_no)
            ->line(Trans::get('The 48-hour deadline to upload your return shipping tracking slip has passed without a submission.', $locale))
            ->line(Trans::get('If you believe this is an error, please contact our support team.', $locale));
    }
}
