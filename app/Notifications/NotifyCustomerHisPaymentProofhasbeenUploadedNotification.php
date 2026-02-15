<?php

namespace App\Notifications;

use App\Helpers\Trans;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NotifyCustomerHisPaymentProofhasbeenUploadedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        private Order $order
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
            ->subject(Trans::get('Payment Proof Received — Order', $locale).' #'.$this->order->order_no)
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
            ->line(Trans::get('We’ve successfully received your payment proof for', $locale).' **Order #'.$this->order->order_no.'**.')
            ->line(Trans::get('Our team will now review and verify your payment. This process usually takes **2 to 3 business days**.', $locale))
            ->line(Trans::get('Once your payment is approved, you’ll receive another email confirming your order status update.', $locale))
            ->line(Trans::get('If you haven’t heard back from us after 3 business days, please don’t hesitate to reach out to our support team for assistance.', $locale))
            ->action(Trans::get('View Your Order', $locale), route('website.orders.order-view', $this->order->order_no))
            ->line(Trans::get('Thank you for your patience and for choosing', $locale).' '.config('app.name'));

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
