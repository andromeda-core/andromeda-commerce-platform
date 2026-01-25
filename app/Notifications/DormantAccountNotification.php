<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DormantAccountNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected string $type;

    public function __construct(string $type)
    {
        $this->type = $type;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        if ($this->type === 'dormant') {
            return (new MailMessage)
                ->subject('Your account has been marked as dormant')
                ->greeting('Hello '.$notifiable->name.',')
                ->line('We noticed that your account has not had any activity for a long period of time.')
                ->line('As a result, your account has been marked as dormant.')
                ->line('A dormant account means it is temporarily inactive due to inactivity. Your account has not been deleted or suspended, and all of your data remains safe.')
                ->line('To restore your account, simply visit our website and follow the steps to deactivate dormancy.')
                ->line('If you believe this was done in error or need assistance, please contact our support team.');
        }

        return (new MailMessage)
            ->subject('Your account dormancy has been removed')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('Your account has been successfully restored and is no longer marked as dormant.')
            ->line('You can now continue using all features and services without any restrictions.')
            ->line('If you did not request this change or notice anything unusual, please contact our support team immediately.');
    }
}
