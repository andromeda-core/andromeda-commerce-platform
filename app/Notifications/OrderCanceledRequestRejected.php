<?php

namespace App\Notifications;

use App\Helpers\Trans;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderCanceledRequestRejected extends Notification implements ShouldQueue
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
            ->subject(Trans::get('Order Cancellation Request Update', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
            ->line(Trans::get('We have reviewed your order cancellation request.', $locale))
            ->line(Trans::get('Unfortunately, your request has been rejected at this time.', $locale))
            ->line(Trans::get('Order Number', $locale).': #'.$this->order->order_no)
            ->line(Trans::get('If you need more information or have any concerns, please feel free to contact our support team.', $locale))
            ->action(Trans::get('View Order Details', $locale), route('website.orders.order-view', $this->order->order_no))
            ->line(Trans::get('Thank you for your understanding.', $locale));

    }
}
