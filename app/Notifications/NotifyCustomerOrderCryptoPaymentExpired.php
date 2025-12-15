<?php

namespace App\Notifications;

use App\Models\Currency;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NotifyCustomerOrderCryptoPaymentExpired extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private Order $order,
        private Currency $currency,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $orderNo = $this->order->order_no;
        $amount = number_format($this->order->amount, 2);
        $currency = strtoupper($this->currency->name ?? 'USD');
        $home = route('home');

        return (new MailMessage)
            ->subject("Order #{$orderNo} Expired — Payment Not Received in Time")
            ->greeting("Hi {$notifiable->name},")
            ->line("Your order **#{$orderNo}** was created but we didn’t receive the Crypto Currency payment within the allowed time window.")
            ->line('As a result, the order has now expired automatically. No funds have been deducted from your wallet.')
            ->line('**Order Details:**')
            ->line("• Order Number: {$orderNo}")
            ->line("• Amount: {$amount} {$currency}")
            ->line('• Payment Method: Crypto Currency')
            ->line('If you still wish to complete your purchase, you can simply place the order again or choose another payment method below.')
            ->action('Place a New Order', $home)
            ->line('We’ve released the reserved items back into stock so they remain available for purchase.')
            ->line('Thank you for your understanding, we’re here if you have any questions or need assistance.');
    }
}
