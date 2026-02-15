<?php

namespace App\Notifications;

use App\Helpers\Trans;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderRefundRequestWithdrawnNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private Order $order
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Refund Request Withdrawn', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
            ->line(Trans::get('Your refund request has been successfully withdrawn.', $locale))
            ->line(Trans::get('No further action will be taken on this refund request.', $locale))
            ->line(Trans::get('Order Number', $locale).': #'.$this->order->order_no)
            ->action(
                Trans::get('View Order Details', $locale),
                route('website.orders.order-view', $this->order->order_no)
            )
            ->line(Trans::get('If you have any questions or need assistance, feel free to contact our support team.', $locale));

    }
}
