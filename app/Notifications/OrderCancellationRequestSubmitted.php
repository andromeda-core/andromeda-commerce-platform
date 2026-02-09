<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderCancellationRequestSubmitted extends Notification implements ShouldQueue
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
            ->subject('Order Cancellation Request Submitted')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('Your order cancellation request has been successfully submitted.')
            ->line('Order Number: #'.$this->order->order_no)
            ->line('Our team will review your request shortly.')
            ->line('Please wait for confirmation from our side.')
            ->action('View Order Details', route('website.orders.order-view', $this->order->id))
            ->line('Thank you for your patience.');
    }
}
