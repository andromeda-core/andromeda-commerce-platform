<?php

namespace App\Notifications;

use App\Helpers\Trans;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountSuspendNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Your account has been suspended', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
            ->line(Trans::get('We are writing to inform you that your account has been suspended.', $locale))
            ->line(Trans::get('This action was taken due to a review of your account activity and is intended to protect the integrity of our platform.', $locale))
            ->line(Trans::get('During this period, access to certain features of your account may be restricted.', $locale))
            ->line(Trans::get('If you believe this action was taken in error or would like further clarification, please contact our support team.', $locale))
            ->line(Trans::get('We appreciate your understanding and cooperation while this matter is reviewed.', $locale));
    }
}
