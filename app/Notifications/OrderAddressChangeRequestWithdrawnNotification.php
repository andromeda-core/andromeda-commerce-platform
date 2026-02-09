<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderAddressChangeRequestWithdrawnNotification extends Notification implements ShouldQueue
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
            ->subject('Address Change Request Withdrawn')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('Your address change request has been successfully withdrawn.')
            ->line('The order will continue with the original shipping address.')
            ->line('Order Number: #'.$this->order->order_no)
            ->action(
                'View Order Details',
                route('website.orders.order-view', $this->order->order_no)
            )
            ->line('If you need to make any changes later, please contact our support team.');
    }
}
