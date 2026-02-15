<?php

namespace App\Notifications;

use App\Helpers\Trans;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ShippingAddressChangeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private string $type,
        private string $ip,
        private string $userAgent
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return match ($this->type) {
            'created' => $this->addressCreatedMail($notifiable),
            'updated' => $this->addressUpdatedMail($notifiable),
            'deleted' => $this->addressDeletedMail($notifiable),
            'activated' => $this->addressActivatedMail($notifiable),
            default => $this->defaultMail($notifiable),
        };
    }

    /* =========================
        MAIL TEMPLATES
       ========================= */

    private function addressCreatedMail(object $notifiable): MailMessage
    {
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Security alert: New shipping address added', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
            ->line(Trans::get('A new shipping address has been added to your account.', $locale))
            ->line(Trans::get('If you added this address, no further action is required.', $locale))
            ->line(Trans::get('Security details:', $locale))
            ->line(Trans::get('IP Address:', $locale).' '.$this->ip)
            ->line(Trans::get('Device:', $locale).' '.$this->userAgent)
            ->line(Trans::get('If you did not perform this action, please contact our support team immediately.', $locale))
            ->salutation(config('app.name').' '.'Security Team');
    }

    private function addressUpdatedMail(object $notifiable): MailMessage
    {
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Security alert: Shipping address updated', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
            ->line(Trans::get('One of your shipping addresses has been updated.', $locale))
            ->line(Trans::get('If you made this change, no further action is required.', $locale))
            ->line(Trans::get('Security details:', $locale))
            ->line(Trans::get('IP Address:', $locale).' '.$this->ip)
            ->line(Trans::get('Device:', $locale).' '.$this->userAgent)
            ->line(Trans::get('If this update was not authorized by you, please contact our support team immediately.', $locale))
            ->salutation(config('app.name').' '.'Security Team');
    }

    private function addressDeletedMail(object $notifiable): MailMessage
    {
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Security alert: Shipping address removed', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
            ->line(Trans::get('A shipping address has been removed from your account.', $locale))
            ->line(Trans::get('If you removed this address, no action is required.', $locale))
            ->line(Trans::get('Security details:', $locale))
            ->line(Trans::get('IP Address:', $locale).' '.$this->ip)
            ->line(Trans::get('Device:', $locale).' '.$this->userAgent)
            ->line(Trans::get('If you did not request this change, please contact our support team immediately.', $locale))
            ->salutation(config('app.name').' '.'Security Team');
    }

    private function addressActivatedMail(object $notifiable): MailMessage
    {
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Security alert: Active shipping address changed', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
            ->line(Trans::get('Your active shipping address has been changed.', $locale))
            ->line(Trans::get('Future orders will use this address by default.', $locale))
            ->line(Trans::get('Security details:', $locale))
            ->line(Trans::get('IP Address:', $locale).' '.$this->ip)
            ->line(Trans::get('Device:', $locale).' '.$this->userAgent)
            ->line(Trans::get('If you did not make this change, please contact our support team immediately.', $locale))
            ->salutation(config('app.name').' '.'Security Team');
    }

    private function defaultMail(object $notifiable): MailMessage
    {
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Security alert: Shipping address activity detected', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name.',')
            ->line(Trans::get('A change related to your shipping address was detected.', $locale))
            ->line(Trans::get('If this was not you, please contact support immediately.', $locale))
            ->salutation(config('app.name').' '.'Security Team');
    }
}
