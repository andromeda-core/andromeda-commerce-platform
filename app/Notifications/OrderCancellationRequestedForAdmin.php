<?php

namespace App\Notifications;

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
        return (new MailMessage)
            ->subject('Order Cancellation Request Received')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('A customer has requested to cancel an order.')
            ->line('Order Number: #'.$this->order->order_no)
            ->line('Customer Name: '.optional($this->order->customer?->user)->name)
            ->line('Please review the cancellation request and take the necessary action.')
            ->action(
                'Review Cancellation Request',
                route('dashboard.order-cancelation-requests.edit', $this->cancelationRequest->id)
            )
            ->line('Thank you.');
    }
}
