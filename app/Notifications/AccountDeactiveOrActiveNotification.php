<?php

namespace App\Notifications;

use App\Helpers\Trans;
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
        $locale = $notifiable->language_locale ?? 'en';

        if ($this->type === 'deactivated') {
            return (new MailMessage)
                ->subject(Trans::get('Your account has been deactivated', $locale))
                ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
                ->line(Trans::get('Your account has been successfully deactivated as per your request.', $locale))
                ->line(Trans::get('This does not affect your data or account security. All information associated with your account remains safe.', $locale))
                ->line(Trans::get('If you wish to continue using our services in the future, you may reactivate your account within 30 days of deactivation at any time.', $locale))
                ->line(Trans::get('If you did not request this change or believe this was done in error, please contact our support team.', $locale));
        }

        return (new MailMessage)
            ->subject(Trans::get('Your account has been activated', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
            ->line(Trans::get('Your account has been successfully activated and is now fully accessible.', $locale))
            ->line(Trans::get('You can continue using all features and services without any restrictions.', $locale))
            ->line(Trans::get('If you did not request this change or notice anything unusual, please contact our support team immediately.', $locale));
    }
}
