<?php

namespace App\Notifications;

use App\Helpers\Trans;
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
        $amount = number_format($this->order->full_amount, 2);
        $currency = strtoupper($this->currency->name ?? 'USD');
        $orderUrl = route('website.orders.order-view', ['order_no' => $orderNo]);

        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Payment Received — Your Order', $locale)." #{$orderNo} ".Trans::get('Is Now Confirmed', $locale))
            ->greeting(Trans::get('Hi', $locale)." {$notifiable->name},")
            ->line(Trans::get('Good news! We’ve successfully received your Crypto Currency payment for', $locale)." **Order #{$orderNo}**.")
            ->line(Trans::get('Your transaction has been fully confirmed on the blockchain, and your order is now officially confirmed in our system.', $locale))
            ->line('**'.Trans::get('Order Details', $locale).':**')
            ->line('• '.Trans::get('Order Number', $locale).": {$orderNo}")
            ->line('• '.Trans::get('Amount Paid', $locale).": {$amount} {$currency}")
            ->line('• '.Trans::get('Payment Method', $locale).': '.Trans::get('Crypto Payment', $locale))
            ->line(Trans::get('Our team will now begin preparing your order for dispatch. You can track your order status anytime using the button below.', $locale))
            ->action(Trans::get('View Your Order', $locale), $orderUrl)
            ->line(Trans::get('If you have any questions or need assistance, feel free to contact our support team.', $locale));
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
