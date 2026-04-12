<?php

namespace App\Notifications;

use App\Helpers\Trans;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DistributorCommissionNotSetNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct() {}

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
            ->subject(Trans::get('Distributor Commission Not Configured', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
            ->line(Trans::get('An order has been placed, but the commission rate for the Distributor has not been configured.', $locale))
            ->line(Trans::get('Please review the settings and configure the commission rate to ensure proper calculation for future orders.', $locale))
            ->line(Trans::get('Thank you.', $locale));
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
