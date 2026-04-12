<?php

namespace App\Notifications;

use App\Helpers\Trans;
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
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Your Order Has Arrived in Your City', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
            ->line(Trans::get('We’re excited to let you know that your order has arrived in your city and will be delivered to you very soon.', $locale))
            ->line('**'.Trans::get('Order Number', $locale).':** '.$this->order->order_no)
            ->line('**'.Trans::get('Current Status', $locale).':** '.Trans::get('ARRIVED LOCALLY', $locale))
            ->line(Trans::get('Our delivery partner will be reaching out to you shortly to complete the final step of your delivery.', $locale))
            ->line(Trans::get('You can always check the latest status of your order in the My Orders section of your account.', $locale))
            ->action(Trans::get('View Your Order', $locale), route('website.orders.order-view', $this->order->order_no))
            ->line(Trans::get('Thank you for your patience and for choosing us! We look forward to delivering your package soon!', $locale));

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
