<?php

namespace App\Notifications;

use App\Helpers\Trans;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SendEmailToUserAfterRegistration extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct() {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Welcome to', $locale).' '.config('app.name'))
            ->greeting(Trans::get('Welcome,', $locale).' '.$notifiable->name.' 👋')
            ->line(Trans::get('We are excited to have you on board. Your account has been successfully set up and you are now logged in.', $locale))
            ->line(Trans::get('You can start exploring the platform, manage your profile, and access all available features right away.', $locale))
            ->action(Trans::get('Visit Site', $locale), route('home'))
            ->line(Trans::get('If you need any help or have questions, our support team is always here to assist you.', $locale));

    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
