<?php

namespace App\Notifications;

use App\Helpers\Trans;
use App\Models\Order;
use App\Models\OrderCancelationRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderCancellationRequestedForAdmin extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private Order $order,
        private OrderCancelationRequest $cancelationRequest
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Order Cancellation Request Received', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
            ->line(Trans::get('A customer has requested to cancel an order.', $locale))
            ->line(Trans::get('Order Number', $locale).': #'.$this->order->order_no)
            ->line(Trans::get('Customer Name', $locale).': '.optional($this->order->customer?->user)->name)
            ->line(Trans::get('Please review the cancellation request and take the necessary action.', $locale))
            ->action(
                Trans::get('Review Cancellation Request', $locale),
                route('dashboard.order-cancelation-requests.edit', $this->cancelationRequest->id)
            )
            ->line(Trans::get('Thank you.', $locale));

    }
}
