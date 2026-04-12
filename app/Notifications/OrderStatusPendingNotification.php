<?php

namespace App\Notifications;

use App\Helpers\Trans;
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

        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Your Order Has Been Placed Successfully', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
            ->line(Trans::get('We’re pleased to inform you that your order has been placed successfully.', $locale))
            ->line('**'.Trans::get('Order Number', $locale).':** '.$this->order->order_no)
            ->line('**'.Trans::get('Current Status', $locale).':** '.Trans::get('Pending', $locale))
            ->line('**'.Trans::get('Remeaning Amount', $locale).':** '.number_format($this->order->amount, 2).' '.($this->currency->name ?? 'USD'))
            ->line('**'.Trans::get('Full Amount', $locale).':** '.number_format($this->order->full_amount, 2).' '.($this->currency->name ?? 'USD'))
            ->line(Trans::get('To complete your order, please transfer the total amount to the following bank account and upload your payment proof for verification:', $locale))
            ->line('')
            ->line('**'.Trans::get('Bank Name', $locale).':** '.$this->order
                ?->orderItems[0]
                ?->smartphone?->category
                ?->distributor
                ?->bank_name ?? 'N/A'
            )
            ->line('**'.Trans::get('Account Name', $locale).':** '.$this->order
                ?->orderItems[0]
                ?->smartphone->category
                ?->distributor
                ?->bank_account_name ?? 'N/A'
            )
            ->line('**'.Trans::get('Account Number', $locale).':** '.$this->order
                ?->orderItems[0]
                ?->smartphone->category
                ?->distributor
                ?->bank_account_no ?? 'N/A'
            )
            ->line('**'.Trans::get('IBAN', $locale).':** '.$this->order
                ?->orderItems[0]
                ?->smartphone->category
                ?->distributor
                ?->iban ?? 'N/A'
            )
            ->line('**'.Trans::get('SWIFT Code', $locale).':** '.$this->order
                ?->orderItems[0]
                ?->smartphone->category
                ?->distributor
                ?->swift_code ?? 'N/A'
            )
            ->line('')
            ->line(Trans::get('Once the payment is made, please upload your payment proof through your My Orders page so our team can verify it.', $locale))
            ->line(Trans::get('Payment verification usually takes **2 to 3 business days**.', $locale))
            ->action(Trans::get('View Your Order', $locale), route('website.orders.order-view', $this->order->order_no))
            ->line(Trans::get('Thank you for shopping with us! We truly appreciate your trust and look forward to serving you again.', $locale));

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
