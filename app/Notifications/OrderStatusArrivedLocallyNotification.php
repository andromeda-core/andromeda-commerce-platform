<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusArrivedLocallyNotification extends Notification implements ShouldQueue
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
            ->subject('Your Order Has Arrived in Your City')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('We’re excited to let you know that your order has arrived in your city and will be delivered to you very soon.')
            ->line('**Order Number:** '.$this->order->order_no)
            ->line('**Current Status:**  Arrived Locally')
            ->line('Our delivery partner will be reaching out to you shortly to complete the final step of your delivery.')
            ->line('You can always check the latest status of your order in the *My Orders* section of your account.')
            ->action('View Your Order', route('website.orders.order-view', $this->order->order_no))
            ->line('Thank you for your patience and for choosing us! We look forward to delivering your package soon!');
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
