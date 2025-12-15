<?php

namespace App\Notifications;

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
        return (new MailMessage)
            ->subject('Payment Proof Received — Order #'.$this->order->order_no)
            ->greeting('Hello '.$notifiable->name.',')
            ->line('We’ve successfully received your payment proof for **Order #'.$this->order->order_no.'**.')
            ->line('Our team will now review and verify your payment. This process usually takes **2 to 3 business days**.')
            ->line('Once your payment is approved, you’ll receive another email confirming your order status update.')
            ->line('If you haven’t heard back from us after 3 business days, please don’t hesitate to reach out to our support team for assistance.')
            ->action('View Your Order', route('website.orders.order-view', $this->order->order_no))
            ->line('Thank you for your patience and for choosing ');
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
