<?php

namespace App\Notifications;

use App\Helpers\Trans;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NotifyAdminPaymentProofHasBeenUploadedNotification extends Notification implements ShouldQueue
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
            ->subject(Trans::get('New Payment Proof Uploaded — Order', $locale).' #'.$this->order->order_no)
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
            ->line(Trans::get('A customer has just uploaded a payment proof for', $locale).' **Order #'.$this->order->order_no.'**.')
            ->line(Trans::get('Please review and verify the submitted proof to confirm the payment status.', $locale))
            ->line(Trans::get('Once verified, you can update the order status to “Approved” or take the necessary action from the admin dashboard.', $locale))
            ->action(Trans::get('Review Order Payment Proof', $locale), route('dashboard.orders.show', $this->order->id))
            ->line(Trans::get('This notification was sent automatically by', $locale).' '.config('app.name').'.');
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
