<?php

namespace App\Notifications;

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
        $mail = (new MailMessage)
            ->subject('Action Required: Account Issue')
            ->greeting('Hello '.$notifiable->name)
            ->line($this->message);

        if ($this->actionUrl) {
            $mail->action('View Details', $this->actionUrl);
        }

        return $mail->line('If you have already resolved this, you may ignore this message.');
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Action Required: Account Issue',
            'message' => $this->message,
            'action_url' => $this->actionUrl,
        ];
    }
}
