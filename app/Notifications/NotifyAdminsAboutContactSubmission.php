<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NotifyAdminsAboutContactSubmission extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private array $data
    ) {}

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
            ->subject('New Contact Form Submission')
            ->greeting('Hello '.$notifiable->name)
            ->line('A new contact form has been submitted:')
            ->line('**Name:** '.$this->data['name'])
            ->line('**Email:** '.$this->data['email'])
            ->line('**Phone:** '.$this->data['phone'])
            ->line('**Subject:** '.$this->data['subject'])
            ->line('**Message:**')
            ->line($this->data['message'])
            ->line('')
            ->line('Please review and respond to this contact Form Submission as soon as possible.');
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
