<?php

namespace App\Notifications;

use App\Helpers\Trans;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class CustomVerifyEmailNotification extends VerifyEmail implements ShouldQueue
{
    use Queueable;

    public function toMail($notifiable): MailMessage
    {
        $locale = $notifiable->language_locale ?? 'en';
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject(Trans::get('Verify your email address', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
            ->line(Trans::get('Please click the button below to verify your email address.', $locale))
            ->action(Trans::get('Verify Email Address', $locale), $verificationUrl)
            ->line(Trans::get('If you did not create an account, no further action is required.', $locale));
    }
}
