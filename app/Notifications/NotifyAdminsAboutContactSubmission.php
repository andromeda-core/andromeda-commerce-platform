<?php

namespace App\Notifications;

use App\Helpers\Trans;
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
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('New Contact Form Submission', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$notifiable->name)
            ->line(Trans::get('A new contact form has been submitted:', $locale))
            ->line('**'.Trans::get('Name', $locale).':** '.$this->data['name'])
            ->line('**'.Trans::get('Email', $locale).':** '.$this->data['email'])
            ->line('**'.Trans::get('Phone', $locale).':** '.$this->data['phone'])
            ->line('**'.Trans::get('Subject', $locale).':** '.$this->data['subject'])
            ->line('**'.Trans::get('Message', $locale).':**')
            ->line($this->data['message'])
            ->line('')
            ->line(Trans::get('Please review and respond to this contact Form Submission as soon as possible.', $locale));
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
