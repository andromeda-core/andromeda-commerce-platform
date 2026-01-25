<?php

namespace App\Notifications;

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
        // Permanent Deletion
        return (new MailMessage)
            ->subject('Your account has been permanently deleted')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('This email confirms that your account has been permanently deleted.')
            ->line('You previously requested account deletion, and the 30-day grace period has now ended.')
            ->line('As a result, your account and associated data have been removed from our system in accordance with our data retention policy.')
            ->line('If this action was not initiated by you or you believe this was done in error, please contact our support team immediately.');

    }
}
