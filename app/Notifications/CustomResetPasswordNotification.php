<?php

namespace App\Notifications;

use App\Helpers\Trans;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class CustomResetPasswordNotification extends ResetPassword implements ShouldQueue
{
    use Queueable;

    public function toMail($notifiable): MailMessage
    {
        $locale = $notifiable->language_locale ?? 'en';

        $resetUrl = url(route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->email,
        ], false));

        return (new MailMessage)
            ->subject(Trans::get('Reset your password', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
            ->line(Trans::get('You are receiving this email because we received a password reset request for your account.', $locale))
            ->action(Trans::get('Reset Password', $locale), $resetUrl)
            ->line(Trans::get('This password reset link will expire in 60 minutes.', $locale))
            ->line(Trans::get('If you did not request a password reset, no further action is required.', $locale));
    }
}
