<?php

namespace App\Notifications;

use App\Helpers\Trans;
use App\Models\Currency;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Str;

class NotifyAdminAboutOrderPlacedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private Order $order,
        private Currency $currency
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
        $currency = strtoupper($this->currency->name ?? 'USD');
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject('📦 '.Trans::get('New Order Placed - Order', $locale).' #'.$this->order->order_no)
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
            ->line(Trans::get('A new order has just been placed in the system.', $locale))
            ->line(Trans::get('Here are the order details:', $locale))
            ->line('• '.Trans::get('Order No', $locale).': #'.$this->order->order_no)
            ->line('• '.Trans::get('Customer', $locale).': '.$this->order->customer->user->name)
            ->line('• '.Trans::get('Remaning Amount', $locale).': '.number_format($this->order->amount, 2).' '.$currency)
            ->line('• '.Trans::get('Paid By Points Amount', $locale).': '.number_format($this->order->points_used, 2).' '.$currency)
            ->line('• '.Trans::get('Total Amount', $locale).': '.number_format($this->order->full_amount, 2).' '.$currency)
            ->line('• '.Trans::get('Status', $locale).': '.Trans::get(Str::of($this->order->status)->replace('_', ' ')->upper(), $locale))
            ->action(Trans::get('View Order', $locale), route('dashboard.orders.show', $this->order->id))
            ->line(Trans::get('Please review and process this order at your earliest convenience.', $locale));
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
