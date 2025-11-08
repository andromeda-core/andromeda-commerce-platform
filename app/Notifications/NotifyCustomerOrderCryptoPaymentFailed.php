<?php

namespace App\Notifications;

use App\Models\Currency;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NotifyCustomerOrderCryptoPaymentFailed extends Notification implements ShouldQueue
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
            ->subject("Payment Failed — Order #{$orderNo} Could Not Be Processed")
            ->greeting("Hi {$notifiable->name},")
            ->line("We wanted to let you know that your Crypto Currency payment for **Order #{$orderNo}** was not completed.")
            ->line('The transaction either failed or expired before the blockchain confirmation was received. No funds have been deducted from your account.')
            ->line('**Order Details:**')
            ->line("• Order Number: {$orderNo}")
            ->line("• Amount: {$amount} {$currency}")
            ->line('• Payment Method: Crypto Currency')
            ->line('If you’d like to try again, you can easily complete your payment or choose a different method below.')
            ->line('Your order has been  marked as *Failed*, but you can re-order anytime using the same items')
            ->action('Place a New Order', $home)
            ->line('If you believe the payment went through or have any questions, please contact our support team with your transaction details.');
    }
}
