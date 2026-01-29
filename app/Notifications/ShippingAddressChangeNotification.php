<?php

namespace App\Notifications;

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
        return (new MailMessage)
            ->subject('Security alert: New shipping address added')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('A new shipping address has been added to your account.')
            ->line('If you added this address, no further action is required.')
            ->line('Security details:')
            ->line('IP Address: '.$this->ip)
            ->line('Device: '.$this->userAgent)
            ->line('If you did not perform this action, please contact our support team immediately.')
            ->salutation(config('app.name').' Security Team');
    }

    private function addressUpdatedMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Security alert: Shipping address updated')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('One of your shipping addresses has been updated.')
            ->line('If you made this change, no further action is required.')
            ->line('Security details:')
            ->line('IP Address: '.$this->ip)
            ->line('Device: '.$this->userAgent)
            ->line('If this update was not authorized by you, please contact our support team immediately.')
            ->salutation(config('app.name').' Security Team');
    }

    private function addressDeletedMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Security alert: Shipping address removed')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('A shipping address has been removed from your account.')
            ->line('If you removed this address, no action is required.')
            ->line('Security details:')
            ->line('IP Address: '.$this->ip)
            ->line('Device: '.$this->userAgent)
            ->line('If you did not request this change, please contact our support team immediately.')
            ->salutation(config('app.name').' Security Team');
    }

    private function addressActivatedMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Security alert: Active shipping address changed')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('Your active shipping address has been changed.')
            ->line('Future orders will use this address by default.')
            ->line('Security details:')
            ->line('IP Address: '.$this->ip)
            ->line('Device: '.$this->userAgent)
            ->line('If you did not make this change, please contact our support team immediately.')
            ->salutation(config('app.name').' Security Team');
    }

    private function defaultMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Security alert: Shipping address activity detected')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('A change related to your shipping address was detected.')
            ->line('If this was not you, please contact support immediately.')
            ->salutation(config('app.name').' Security Team');
    }
}
