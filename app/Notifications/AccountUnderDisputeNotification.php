<?php

namespace App\Notifications;

use App\Helpers\Trans;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountUnderDisputeNotification extends Notification implements ShouldQueue
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
            ->subject(Trans::get('Your account is currently under dispute', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
            ->line(Trans::get('We would like to inform you that your account is currently under dispute.', $locale))
            ->line(Trans::get('This means there is an ongoing issue related to one or more activities associated with your account.', $locale))
            ->line(Trans::get('During this time, certain actions may be temporarily restricted until the dispute is resolved.', $locale))
            ->line(Trans::get('Your account has not been suspended or deleted, and your data remains secure.', $locale))
            ->line(Trans::get('If you have any information that may help resolve this matter or need further clarification, please contact our support team.', $locale));
    }
}
