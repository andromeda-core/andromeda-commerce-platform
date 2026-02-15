<?php

namespace App\Notifications;

use App\Helpers\Trans;
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
        $locale = $notifiable->language_locale ?? 'en';
        if ($this->type === 'dormant') {
            return (new MailMessage)
                ->subject(Trans::get('Your account has been marked as dormant', $locale))
                ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
                ->line(Trans::get('We noticed that your account has not had any activity for a long period of time.', $locale))
                ->line(Trans::get('As a result, your account has been marked as dormant.', $locale))
                ->line(Trans::get('A dormant account means it is temporarily inactive due to inactivity. Your account has not been deleted or suspended, and all of your data remains safe.', $locale))
                ->line(Trans::get('To restore your account, simply visit our website and follow the steps to deactivate dormancy.', $locale))
                ->line(Trans::get('If you believe this was done in error or need assistance, please contact our support team.', $locale));
        }

        return (new MailMessage)
            ->subject(Trans::get('Your account dormancy has been removed', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
            ->line(Trans::get('Your account has been successfully restored and is no longer marked as dormant.', $locale))
            ->line(Trans::get('You can now continue using all features and services without any restrictions.', $locale))
            ->line(Trans::get('If you did not request this change or notice anything unusual, please contact our support team immediately.', $locale));
    }
}
