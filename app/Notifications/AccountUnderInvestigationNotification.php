<?php

namespace App\Notifications;

use App\Helpers\Trans;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountUnderInvestigationNotification extends Notification implements ShouldQueue
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
            ->subject(Trans::get('Your account is currently under investigation', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
            ->line(Trans::get('We are writing to inform you that your account is currently under investigation.', $locale))
            ->line(Trans::get('This review is part of our standard procedures and does not imply any final decision at this stage.', $locale))
            ->line(Trans::get('While the investigation is ongoing, certain account actions may be temporarily restricted.', $locale))
            ->line(Trans::get('Your account has not been suspended or deleted, and your data remains secure.', $locale))
            ->line(Trans::get('If we require additional information from you, our team will reach out directly.', $locale));
    }
}
