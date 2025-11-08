<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusShippedNotification extends Notification implements ShouldQueue
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
            ->subject('Your Order Has Been Shipped')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('Good news! Your order has been shipped and is now on its way to you.')
            ->line('**Order Number:** '.$this->order->order_no)
            ->line('**Current Status:**  Shipped')
            ->line('**Courier Company:** '.$this->order->courier_company)
            ->line('**Tracking Number:** '.$this->order->tracking_no)
            ->line('**Shipping Date:** '.$this->order->shipping_date->format('M d, Y'))
            ->line('You can track your shipment directly on **'.$this->order->courier_company.'**’s website using your tracking number: **'.$this->order->tracking_no.'**.')
            ->line('For complete details and the latest status of your order, please visit the *My Orders* Page in your account.')
            ->action('View Your Order', route('website.orders.order-view', $this->order->order_no))
            ->line('Thank you for shopping with us! We look forward to delivering your order soon.');
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
