<?php

namespace App\Notifications;

use App\Helpers\Trans;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PermanentlyDestroyDeactivatedAccount extends Notification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {

        $locale = $notifiable->language_locale ?? 'en';

        // Permanent Deletion
        return (new MailMessage)
            ->subject(Trans::get('Your account has been permanently deleted', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
            ->line(Trans::get('This email confirms that your account has been permanently deleted.', $locale))
            ->line(Trans::get('You previously requested account deletion, and the 30-day grace period has now ended.', $locale))
            ->line(Trans::get('As a result, your account and associated data have been removed from our system in accordance with our data retention policy.', $locale))
            ->line(Trans::get('If this action was not initiated by you or you believe this was done in error, please contact our support team immediately.', $locale));

    }
}
