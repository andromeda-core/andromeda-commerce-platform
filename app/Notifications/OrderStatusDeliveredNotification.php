<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusDeliveredNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private Order $order
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Order Has Been Delivered')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('We’re happy to inform you that your order has been delivered successfully.')
            ->line('**Order Number:** '.$this->order->order_no)
            ->line('**Current Status:** Delivered')
            ->line('We hope you’re satisfied with your purchase and enjoy using your new product(s).')
            ->line('You can view your order details anytime in the *My Orders* section of your account.')
            ->action('View Your Order', route('website.orders.order-view', $this->order->order_no))
            ->line('Thank you for choosing us! We look forward to serving you again soon.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
