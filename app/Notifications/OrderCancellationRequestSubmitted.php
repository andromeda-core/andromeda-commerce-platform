<?php

namespace App\Notifications;

use App\Helpers\Trans;
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
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Order Cancellation Request Submitted', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
            ->line(Trans::get('Your order cancellation request has been successfully submitted.', $locale))
            ->line(Trans::get('Order Number', $locale).': #'.$this->order->order_no)
            ->line(Trans::get('Our team will review your request shortly.', $locale))
            ->line(Trans::get('Please wait for confirmation from our side.', $locale))
            ->action(Trans::get('View Order Details', $locale), route('website.orders.order-view', $this->order->id))
            ->line(Trans::get('Thank you for your patience.', $locale));

    }
}
