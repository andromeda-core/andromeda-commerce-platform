<?php

namespace App\Notifications;

use App\Models\Currency;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

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

        return (new MailMessage)
            ->subject('📦 New Order Placed - Order #'.$this->order->order_no)
            ->greeting("Hello {$notifiable->name},")
            ->line('A new order has just been placed in the system.')
            ->line('Here are the order details:')
            ->line('• Order No: #'.$this->order->order_no)
            ->line('• Customer: '.$this->order->customer->user->name)
            ->line('• Remeaning Amount: '.number_format($this->order->amount, 2).' '.$currency)
            ->line('• Paid By Points Amount: '.number_format($this->order->points_used, 2).' '.$currency)
            ->line('• Total Amount: '.number_format($this->order->full_amount, 2).' '.$currency)
            ->line('• Status: '.ucfirst($this->order->status))
            ->action('View Order', route('dashboard.orders.show', $this->order->id))
            ->line('Please review and process this order at your earliest convenience.');
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
