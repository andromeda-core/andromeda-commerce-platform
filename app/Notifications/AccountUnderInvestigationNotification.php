<?php

namespace App\Notifications;

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
        return (new MailMessage)
            ->subject('Your account is currently under investigation')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('We are writing to inform you that your account is currently under investigation.')
            ->line('This review is part of our standard procedures and does not imply any final decision at this stage.')
            ->line('While the investigation is ongoing, certain account actions may be temporarily restricted.')
            ->line('Your account has not been suspended or deleted, and your data remains secure.')
            ->line('If we require additional information from you, our team will reach out directly.');
    }
}
