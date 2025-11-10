<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NotifyUserAboutContactSubmission extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        private array $data
    ) {
        //
    }

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
            ->subject('We’ve received your message!')
            ->greeting('Hello '.$this->data['name'].',')
            ->line('Thank you for contacting us. We’ve received your message and our team will respond soon.')
            ->line('Here’s a summary of your submission:')
            ->line('**Subject:** '.$this->data['subject'])
            ->line('**Message:**')
            ->line($this->data['message'])
            ->line('')
            ->line('You don’t need to reply to this email. We’ll reach out if we need more details.')
            ->salutation('Warm regards, Support Team');
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
