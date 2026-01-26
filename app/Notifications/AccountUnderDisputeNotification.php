<?php

namespace App\Notifications;

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
        return (new MailMessage)
            ->subject('Your account is currently under dispute')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('We would like to inform you that your account is currently under dispute.')
            ->line('This means there is an ongoing issue related to one or more activities associated with your account.')
            ->line('During this time, certain actions may be temporarily restricted until the dispute is resolved.')
            ->line('Your account has not been suspended or deleted, and your data remains secure.')
            ->line('If you have any information that may help resolve this matter or need further clarification, please contact our support team.');
    }
}
