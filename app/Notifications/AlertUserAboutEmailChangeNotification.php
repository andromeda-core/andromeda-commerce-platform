<?php

namespace App\Notifications;

use App\Helpers\Trans;
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
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Security alert: Your email address was changed', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$this->userName.',')
            ->line(Trans::get('This is a security notification to inform you that the email address associated with your account has been changed.', $locale))
            ->line(Trans::get('New email address:', $locale).' '.$this->email)
            ->line(Trans::get('Change details:', $locale))
            ->line(Trans::get('IP Address:', $locale).' '.$this->ip)
            ->line(Trans::get('Device:', $locale).' '.$this->user_agent)
            ->line(Trans::get('If you made this change, no further action is required.', $locale))
            ->line(Trans::get('If you did NOT authorize this change, please contact our support team immediately so we can help secure your account.', $locale))
            ->salutation('Regards,')
            ->salutation(config('app.name').' '.'Security Team');
    }
}
