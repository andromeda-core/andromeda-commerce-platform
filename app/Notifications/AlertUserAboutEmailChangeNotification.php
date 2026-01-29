<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AlertUserAboutEmailChangeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private string $email,
        private string $ip,
        private string $user_agent,
        private string $userName,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Security alert: Your email address was changed')
            ->greeting('Hello '.$this->userName.',')
            ->line('This is a security notification to inform you that the email address associated with your account has been changed.')
            ->line('New email address: '.$this->email)
            ->line('Change details:')
            ->line('IP Address: '.$this->ip)
            ->line('Device: '.$this->user_agent)
            ->line('If you made this change, no further action is required.')
            ->line('If you did NOT authorize this change, please contact our support team immediately so we can help secure your account.')
            ->salutation('Regards,')
            ->salutation(config('app.name').' Security Team');
    }
}
