<?php

namespace App\Notifications;

use App\Helpers\Trans;
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
        $fullAmount = number_format($this->order->full_amount, 2);
        $amount = number_format($this->order->amount, 2);
        $currency = strtoupper($this->currency->name ?? 'USD');
        $home = route('home');
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Payment Failed — Order', $locale)." #{$orderNo} ".Trans::get('Could Not Be Processed', $locale))
            ->greeting(Trans::get('Hi', $locale)." {$notifiable->name},")
            ->line(Trans::get('We wanted to let you know that your Crypto Currency payment for', $locale)." **Order #{$orderNo}** ".Trans::get('was not completed.', $locale))
            ->line(Trans::get('The transaction either failed or expired before the blockchain confirmation was received. No funds have been deducted from your account.', $locale))
            ->line('**'.Trans::get('Order Details', $locale).':**')
            ->line('• '.Trans::get('Order Number', $locale).": {$orderNo}")
            ->line('• '.Trans::get('Remaining Amount', $locale).": {$amount} {$currency}")
            ->line('• '.Trans::get('Full Amount', $locale).": {$fullAmount} {$currency}")
            ->line('• '.Trans::get('Payment Method', $locale).': '.Trans::get('Crypto Currency', $locale))
            ->line(Trans::get('If you’d like to try again, you can easily complete your payment or choose a different method below.', $locale))
            ->line(Trans::get('Your order has been  marked as *Failed*, but you can re-order anytime using the same items', $locale))
            ->action(Trans::get('Place a New Order', $locale), $home)
            ->line(Trans::get('If you believe the payment went through or have any questions, please contact our support team with your transaction details.', $locale));

    }
}
