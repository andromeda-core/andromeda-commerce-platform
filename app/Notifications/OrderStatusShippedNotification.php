<?php

namespace App\Notifications;

use App\Helpers\Trans;
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

        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Your Order Has Been Shipped', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
            ->line(Trans::get('Good news! Your order has been shipped and is now on its way to you.', $locale))
            ->line('**'.Trans::get('Order Number', $locale).':** '.$this->order->order_no)
            ->line('**'.Trans::get('Current Status', $locale).':** '.Trans::get('Shipped', $locale))
            ->line('**'.Trans::get('Courier Company', $locale).':** '.$this->order->courier_company)
            ->line('**'.Trans::get('Tracking Number', $locale).':** '.$this->order->tracking_no)
            ->line('**'.Trans::get('Shipping Date', $locale).':** '.$this->order->shipping_date->format('M d, Y'))
            ->line(Trans::get('You can track your shipment directly on', $locale).' **'.$this->order->courier_company.'** '.Trans::get('website using your tracking number', $locale).': **'.$this->order->tracking_no.'**.')
            ->line(Trans::get('For complete details and the latest status of your order, please visit the My Orders Page in your account.', $locale))
            ->action(Trans::get('View Your Order', $locale), route('website.orders.order-view', $this->order->order_no))
            ->line(Trans::get('Thank you for shopping with us! We look forward to delivering your order soon.', $locale));

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
