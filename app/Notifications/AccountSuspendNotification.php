<?php

namespace App\Notifications;

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
        return (new MailMessage)
            ->subject('Your account has been suspended')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('We are writing to inform you that your account has been suspended.')
            ->line('This action was taken due to a review of your account activity and is intended to protect the integrity of our platform.')
            ->line('During this period, access to certain features of your account may be restricted.')
            ->line('If you believe this action was taken in error or would like further clarification, please contact our support team.')
            ->line('We appreciate your understanding and cooperation while this matter is reviewed.');
    }
}
