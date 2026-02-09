<?php

namespace App\Notifications;

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
        return (new MailMessage)
            ->subject('Order Cancellation Request Update')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('We have reviewed your order cancellation request.')
            ->line('Unfortunately, your request has been rejected at this time.')
            ->line('Order Number: #'.$this->order->order_no)
            ->line('If you need more information or have any concerns, please feel free to contact our support team.')
            ->action('View Order Details', route('website.orders.order-view', $this->order->order_no))
            ->line('Thank you for your understanding.');
    }
}
