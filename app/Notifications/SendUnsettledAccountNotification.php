<?php

namespace App\Notifications;

use App\Helpers\Trans;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SendUnsettledAccountNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected string $message,
        protected string $channel,
        protected ?string $actionUrl = null
    ) {}

    public function via(object $notifiable): array
    {
        return match ($this->channel) {
            'email' => ['mail'],
            'in_app' => ['database'],
            default => [],
        };
    }

    public function toMail(object $notifiable): MailMessage
    {
        $locale = $notifiable->language_locale ?? 'en';

        $mail = (new MailMessage)
            ->subject(Trans::get('Action Required: Account Issue', $locale))
            ->greeting('Hello '.$notifiable->name)
            ->line($this->message);

        if ($this->actionUrl) {
            $mail->action(Trans::get('View Details', $locale), $this->actionUrl);
        }

        return $mail->line(Trans::get('If you have already resolved this, you may ignore this message.', $locale));
    }

    public function toDatabase(object $notifiable): array
    {
        $locale = $notifiable->language_locale ?? 'en';

        return [
            'title' => Trans::get('Action Required: Account Issue', $locale),
            'message' => $this->message,
            'action_url' => $this->actionUrl,
        ];
    }
}
