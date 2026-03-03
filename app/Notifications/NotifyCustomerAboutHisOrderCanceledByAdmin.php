<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NotifyCustomerAboutHisOrderCanceledByAdmin extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private Order $order, private string $reason) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $orderNumber = $this->order->order_no;
        $orderUrl = route('website.orders.order-view', ['order_no' => $orderNumber]);

        return (new MailMessage)
            ->subject("Your order #{$orderNumber} has been canceled")
            ->greeting('Hello '.($notifiable->name ?? ''))
            ->line("We’re writing to let you know that your order **#{$orderNumber}** has been canceled by our team.")
            ->line('**Reason:** '.$this->reason)
            ->line('If you believe this was a mistake or you need assistance, reply to this email or contact our support.')
            ->action('View Order Details', $orderUrl);
    }
}
