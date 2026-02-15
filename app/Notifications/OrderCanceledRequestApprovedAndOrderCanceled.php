<?php

namespace App\Notifications;

use App\Helpers\Trans;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderCanceledRequestApprovedAndOrderCanceled extends Notification implements ShouldQueue
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
            ->subject(Trans::get('Your Order Has Been Canceled', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
            ->line(Trans::get('Your order cancellation request has been approved.', $locale))
            ->line(Trans::get('We would like to inform you that your order has been successfully canceled.', $locale))
            ->line(Trans::get('Order Number', $locale).': #'.$this->order->order_no)
            ->action(Trans::get('View Order Details', $locale), route('website.orders.order-view', $this->order->order_no))
            ->line(Trans::get('If you have any questions, feel free to contact our support team.', $locale))
            ->line(Trans::get('Thank you for your understanding.', $locale));

    }
}
