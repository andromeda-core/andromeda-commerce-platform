<?php

namespace App\Notifications;

use App\Helpers\Trans;
use App\Models\Currency;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Cache;

class OrderStatusPaidNotification extends Notification implements ShouldQueue
{
    use Queueable;

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

        $pdf = \PDF::loadView('invoices.order_customer_invoice', [
            'order' => $this->order,
            'currency' => Cache::get('currency'),
            'generalSetting' => Cache::get('general_config'),
        ]);

        $locale = $notifiable->language_locale ?? 'en';

        $mail = (new MailMessage)
            ->subject(Trans::get('Payment Received – Thank You for Your Order', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
            ->line(Trans::get('Thank you for your payment! We’ve successfully received your payment for your order.', $locale))
            ->line('**'.Trans::get('Order Number', $locale).':** '.$this->order->order_no)
            ->line('**'.Trans::get('Remaining Amount', $locale).':** '.number_format($this->order->amount, 2).' '.($this->currency->name ?? 'USD'))
            ->line('**'.Trans::get('Full Amount', $locale).':** '.number_format($this->order->full_amount, 2).' '.($this->currency->name ?? 'USD'));

        $mail->line('**'.Trans::get('Current Status', $locale).':** '.Trans::get('PAID', $locale))
            ->line('**'.Trans::get('Payment Method', $locale).':** '.(
                $this->order->payment_method === 'bank_transfer'
                    ? Trans::get('Bank Transfer', $locale)
                    : Trans::get('Points', $locale)
            ))
            ->line(Trans::get('Your order is now being processed and will be prepared for shipment shortly.', $locale))
            ->line(Trans::get('You can track the progress of your order anytime from your account’s My Orders page.', $locale))
            ->action(Trans::get('View Your Order', $locale), route('website.orders.order-view', $this->order->order_no))
            ->line(Trans::get('We truly appreciate your trust in us and look forward to delivering your order soon.', $locale))
            ->attachData($pdf->output(), "invoice-{$this->order->order_no}.pdf", [
                'mime' => 'application/pdf',
            ]);

        return $mail;
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
