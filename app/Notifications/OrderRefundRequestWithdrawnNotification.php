<?php

namespace App\Notifications;

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
        return (new MailMessage)
            ->subject('Refund Request Withdrawn')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('Your refund request has been successfully withdrawn.')
            ->line('No further action will be taken on this refund request.')
            ->line('Order Number: #'.$this->order->order_no)
            ->action(
                'View Order Details',
                route('website.orders.order-view', $this->order->order_no)
            )
            ->line('If you have any questions or need assistance, feel free to contact our support team.');
    }
}
