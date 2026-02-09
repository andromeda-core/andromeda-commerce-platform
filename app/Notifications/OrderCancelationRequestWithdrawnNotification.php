<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderCancelationRequestWithdrawnNotification extends Notification implements ShouldQueue
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
            ->subject('Order Cancellation Request Withdrawn')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('Your order cancellation request has been successfully withdrawn.')
            ->line('Your order will continue to be processed as usual.')
            ->line('Order Number: #'.$this->order->order_no)
            ->action(
                'View Order Details',
                route('website.orders.order-view', $this->order->order_no)
            )
            ->line('If you have any questions, our support team is always here to help.');
    }
}
