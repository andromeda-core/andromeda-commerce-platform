<?php

namespace App\Notifications;

use App\Helpers\Trans;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmailChangeConfirmationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private string $token,
        private string $ip,
        private string $user_agent,
        private Carbon $expires_at,
        private string $userName
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $verificationUrl = route('website.profile.email-change.verify', ['token' => $this->token]);

        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Confirm your email address change', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$this->userName.',')
            ->line(Trans::get('We received a request to change the email address associated with your account.', $locale))
            ->line(Trans::get('For security reasons, this change must be confirmed before it can be completed.', $locale))
            ->action(Trans::get('Confirm Email Change', $locale), $verificationUrl)
            ->line(Trans::get('This confirmation link will expire on', $locale).' '.$this->expires_at->toDayDateTimeString().'.')
            ->line(Trans::get('Request details:', $locale))
            ->line(Trans::get('IP Address:', $locale).' '.$this->ip)
            ->line(Trans::get('Device:', $locale).' '.$this->user_agent)
            ->line(Trans::get('If you did not request this change, please ignore this email. Your email address will not be updated.', $locale))
            ->line(Trans::get('If you believe your account may be compromised, please contact our support team immediately.', $locale))
            ->salutation('Regards,')
            ->salutation(config('app.name').' '.'Security Team');

    }
}
