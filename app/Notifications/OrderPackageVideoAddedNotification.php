<?php

namespace App\Notifications;

use App\Models\PackageRecording;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderPackageVideoAddedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private PackageRecording $package_recording
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

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Order Packaging Video is Ready')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('We’ve uploaded the packaging video for your recent order. You can now view how your package was prepared before it was shipped.')
            ->action('View Packaging Video', url(route('website.orders.order-view', $this->package_recording->order->order_no)))
            ->line('Thank you for choosing us! We appreciate your trust and look forward to serving you again.');
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
