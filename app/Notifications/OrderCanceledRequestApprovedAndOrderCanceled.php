<?php

namespace App\Notifications;

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
        return (new MailMessage)
            ->subject('Your Order Has Been Canceled')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('Your order cancellation request has been approved.')
            ->line('We would like to inform you that your order has been successfully canceled.')
            ->line('Order Number: #'.$this->order->order_no)
            ->action('View Order Details', route('website.orders.order-view', $this->order->order_no))
            ->line('If you have any questions, feel free to contact our support team.')
            ->line('Thank you for your understanding.');
    }
}
