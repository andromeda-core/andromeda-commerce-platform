<?php

namespace App\Notifications;

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
        return (new MailMessage)
            ->subject('New Payment Proof Uploaded — Order #'.$this->order->order_no)
            ->greeting('Hello '.$notifiable->name.',')
            ->line('A customer has just uploaded a payment proof for **Order #'.$this->order->order_no.'**.')
            ->line('Please review and verify the submitted proof to confirm the payment status.')
            ->line('Once verified, you can update the order status to “Approved” or take the necessary action from the admin dashboard.')
            ->action('Review Order Payment Proof', route('dashboard.orders.show', $this->order->id))
            ->line('This notification was sent automatically by '.config('app.name').'.');
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
