<?php

namespace App\Notifications;

use App\Models\Currency;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NotifyCustomerAboutOrderCryptoPaymentReceived extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        private Order $order,
        private Currency $currency,
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
        $orderNo = $this->order->order_no;
        $amount = number_format($this->order->amount, 2);
        $currency = strtoupper($this->currency->name ?? 'USD');
        $orderUrl = route('website.orders.order-view', ['order_no' => $orderNo]);

        return (new MailMessage)
            ->subject("Payment Received — Your Order #{$orderNo} Is Now Confirmed")
            ->greeting("Hi {$notifiable->name},")
            ->line("Good news! We’ve successfully received your Crypto Currency payment for **Order #{$orderNo}**.")
            ->line('Your transaction has been fully confirmed on the blockchain, and your order is now officially confirmed in our system.')
            ->line('**Order Details:**')
            ->line("• Order Number: {$orderNo}")
            ->line("• Amount Paid: {$amount} {$currency}")
            ->line('• Payment Method: Crypto Payment')
            ->line('Our team will now begin preparing your order for dispatch. You can track your order status anytime using the button below.')
            ->action('View Your Order', $orderUrl)
            ->line('If you have any questions or need assistance, feel free to contact our support team.');
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
