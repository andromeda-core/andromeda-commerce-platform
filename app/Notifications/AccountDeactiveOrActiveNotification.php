<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountDeactiveOrActiveNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected string $type;

    public function __construct(string $type)
    {
        $this->type = $type;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        if ($this->type === 'deactivated') {
            return (new MailMessage)
                ->subject('Your account has been deactivated')
                ->greeting('Hello '.$notifiable->name.',')
                ->line('Your account has been successfully deactivated as per your request.')
                ->line('This does not affect your data or account security. All information associated with your account remains safe.')
                ->line('If you wish to continue using our services in the future, you may reactivate your account  Within 30 Days of deactivation at any time.')
                ->line('If you did not request this change or believe this was done in error, please contact our support team.');
        }

        return (new MailMessage)
            ->subject('Your account has been activated')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('Your account has been successfully activated and is now fully accessible.')
            ->line('You can continue using all features and services without any restrictions.')
            ->line('If you did not request this change or notice anything unusual, please contact our support team immediately.');

    }
}
