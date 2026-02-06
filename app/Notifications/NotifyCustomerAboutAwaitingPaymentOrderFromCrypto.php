<?php

namespace App\Notifications;

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

        return (new MailMessage)
            ->subject("Your Order #{$orderNo} Has Been Placed — Awaiting Blockchain Confirmation")
            ->greeting("Hi {$notifiable->name},")
            ->line("Thank you for placing your order with us! Your order **#{$orderNo}** has been successfully created and is currently awaiting confirmation on the blockchain.")
            ->line('Once the payment is verified by the network, your order will be automatically confirmed and processed for dispatch. No further action is required from your side at this time.')
            ->line('**📦 Order Details:**')
            ->line("• Order Number: {$orderNo}")
            ->line("• Remeaning Amount: {$amount} {$currency}")
            ->line('• Payment Method: Crypto Payment')
            ->line('We’ll notify you again as soon as your payment is confirmed and your order moves to the next stage.')
            ->action('View Your Order', $orderUrl)
            ->line('If you have any questions, feel free to contact our support team — we’re happy to help.');
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
