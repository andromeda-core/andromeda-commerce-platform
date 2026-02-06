<?php

namespace App\Notifications;

use App\Models\Currency;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusPendingNotification extends Notification implements ShouldQueue
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

        return (new MailMessage)
            ->subject('Your Order Has Been Placed Successfully')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('We’re pleased to inform you that your order has been placed successfully.')
            ->line('**Order Number:** '.$this->order->order_no)
            ->line('**Current Status:** Pending')
            ->line('**Remeaning Amount:** '.number_format($this->order->amount, 2).' '.($this->currency->name ?? 'USD'))
            ->line('**Full Amount:** '.number_format($this->order->full_amount, 2).' '.($this->currency->name ?? 'USD'))
            ->line('To complete your order, please transfer the total amount to the following bank account and upload your payment proof for verification:')
            ->line('')
            ->line(
                '**Bank Name:** '.$this->order
                    ?->orderItems[0]
                    ?->smartphone?->category
                    ?->distributor
                    ?->bank_name ?? 'N/A'
            )
            ->line(
                '**Account Name:** '.$this->order
                    ?->orderItems[0]
                    ?->smartphone->category
                    ?->distributor
                    ?->bank_account_name ?? 'N/A'
            )
            ->line(
                '**Account Number:** '.$this->order
                    ?->orderItems[0]
                    ?->smartphone->category
                    ?->distributor
                    ?->bank_account_no ?? 'N/A'
            )
            ->line(
                '**IBAN:** '.$this->order
                    ?->orderItems[0]
                    ?->smartphone->category
                    ?->distributor
                    ?->iban ?? 'N/A'
            )
            ->line('**SWIFT Code:** '.$this->order
                ?->orderItems[0]
                ?->smartphone->category
                ?->distributor
                ?->swift_code ?? 'N/A'
            )
            ->line('')
            ->line('Once the payment is made, please upload your payment proof through your *My Orders* page so our team can verify it.')
            ->line('Payment verification usually takes **2 to 3 business days**.')
            ->action('View Your Order', route('website.orders.order-view', $this->order->order_no))
            ->line('Thank you for shopping with us! We truly appreciate your trust and look forward to serving you again.');
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
