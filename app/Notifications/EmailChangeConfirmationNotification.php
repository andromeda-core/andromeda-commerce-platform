<?php

namespace App\Notifications;

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

        return (new MailMessage)
            ->subject('Confirm your email address change')
            ->greeting('Hello '.$this->userName.',')
            ->line('We received a request to change the email address associated with your account.')
            ->line('For security reasons, this change must be confirmed before it can be completed.')
            ->action('Confirm Email Change', $verificationUrl)
            ->line('This confirmation link will expire on '.$this->expires_at->toDayDateTimeString().'.')
            ->line('Request details:')
            ->line('IP Address: '.$this->ip)
            ->line('Device: '.$this->user_agent)
            ->line('If you did not request this change, please ignore this email. Your email address will not be updated.')
            ->line('If you believe your account may be compromised, please contact our support team immediately.')
            ->salutation('Regards,')
            ->salutation(config('app.name').' Security Team');
    }
}
