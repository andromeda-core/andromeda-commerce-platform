<?php

namespace App\Notifications;

use App\Helpers\Trans;
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
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('We’ve received your message!', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$this->data['name'].',')
            ->line(Trans::get('Thank you for contacting us. We’ve received your message and our team will respond soon.', $locale))
            ->line(Trans::get('Here’s a summary of your submission:', $locale))
            ->line('**'.Trans::get('Subject', $locale).':** '.$this->data['subject'])
            ->line('**'.Trans::get('Message', $locale).':**')
            ->line($this->data['message'])
            ->line('')
            ->line(Trans::get('You don’t need to reply to this email. We’ll reach out if we need more details.', $locale))
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
