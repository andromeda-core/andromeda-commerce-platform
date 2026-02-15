<?php

namespace App\Notifications;

use App\Helpers\Trans;
use App\Models\Currency;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NotifyCustomerAboutAwaitingPaymentOrderFromCrypto extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        private Order $order,
        private Currency $currency,
    ) {
        //
    }

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
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Your Order', $locale)." #{$orderNo} ".Trans::get('Has Been Placed — Awaiting Blockchain Confirmation', $locale))
            ->greeting(Trans::get('Hi', $locale)." {$notifiable->name},")
            ->line(Trans::get('Thank you for placing your order with us! Your order', $locale)." **#{$orderNo}** ".Trans::get('has been successfully created and is currently awaiting confirmation on the blockchain.', $locale))
            ->line(Trans::get('Once the payment is verified by the network, your order will be automatically confirmed and processed for dispatch. No further action is required from your side at this time.', $locale))
            ->line('**📦 '.Trans::get('Order Details', $locale).':**')
            ->line('• '.Trans::get('Order Number', $locale).": {$orderNo}")
            ->line('• '.Trans::get('Remaining Amount', $locale).": {$amount} {$currency}")
            ->line('• '.Trans::get('Payment Method', $locale).': '.Trans::get('Crypto Payment', $locale))
            ->line(Trans::get('We’ll notify you again as soon as your payment is confirmed and your order moves to the next stage.', $locale))
            ->action(Trans::get('View Your Order', $locale), $orderUrl)
            ->line(Trans::get('If you have any questions, feel free to contact our support team — we’re happy to help.', $locale));
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
