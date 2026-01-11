<?php

namespace App\Notifications;

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
        return (new MailMessage)
            ->subject('Welcome to '.config('app.name'))
            ->greeting('Welcome, '.$notifiable->name.' 👋')
            ->line('We are excited to have you on board. Your account has been successfully set up and you are now logged in.')
            ->line('You can start exploring the platform, manage your profile, and access all available features right away.')
            ->action('Visit Site', route('home'))
            ->line('If you need any help or have questions, our support team is always here to assist you.');
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
