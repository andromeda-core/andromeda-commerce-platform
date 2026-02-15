<?php

namespace App\Notifications;

use App\Helpers\Trans;
use App\Models\Currency;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NotifyCustomerOrderExpired extends Notification implements ShouldQueue
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
        $paymentMethod = $this->order->payment_method;
        $currency = strtoupper($this->currency->name ?? 'USD');
        $home = route('home');
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Order', $locale)." #{$orderNo} ".Trans::get('Expired — Payment Not Received in Time', $locale))
            ->greeting(Trans::get('Hi', $locale)." {$notifiable->name},")
            ->line(Trans::get('Your order', $locale)." **#{$orderNo}** ".Trans::get('was created but we didn’t receive the payment within the allowed time window.', $locale))
            ->line(Trans::get('As a result, the order has now expired automatically. No funds have been deducted from your wallet.', $locale))
            ->line('**'.Trans::get('Order Details', $locale).':**')
            ->line('• '.Trans::get('Order Number', $locale).": {$orderNo}")
            ->line('• '.Trans::get('Remaining Amount', $locale).": {$amount} {$currency}")
            ->line('• '.Trans::get('Full Amount', $locale).": {$fullAmount} {$currency}")
            ->line('• '.Trans::get('Payment Method', $locale).': '.$paymentMethod)
            ->line(Trans::get('If you still wish to complete your purchase, you can simply place the order again or choose another payment method below.', $locale))
            ->action(Trans::get('Place a New Order', $locale), $home)
            ->line(Trans::get('We’ve released the reserved items back into stock so they remain available for purchase.', $locale))
            ->line(Trans::get('Thank you for your understanding, we’re here if you have any questions or need assistance.', $locale));

    }
}
