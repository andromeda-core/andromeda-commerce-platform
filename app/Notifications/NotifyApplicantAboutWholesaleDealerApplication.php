<?php

namespace App\Notifications;

use App\Helpers\Trans;
use App\Models\WholesaleDealerApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NotifyApplicantAboutWholesaleDealerApplication extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private WholesaleDealerApplication $application
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
        $locale = app()->getLocale();
        $application = $this->application;

        return (new MailMessage)
            ->subject(Trans::get('We have received your wholesale dealer application', $locale))
            ->greeting(Trans::get('Hello', $locale) . ' ' . $application->contact_person . ',')
            ->line(Trans::get('Thank you for applying to purchase smartphone inventory for resale. We have received your wholesale dealer application and our team will review it.', $locale))
            ->line('**' . Trans::get('Application ID', $locale) . ':** ' . $application->application_id)
            ->line(Trans::get('Please keep this application ID for your records.', $locale))
            ->line(Trans::get('Our team will review your business profile, recent capacity, order budget, payment readiness, and import setup. Qualified applicants will be contacted with the next steps.', $locale))
            ->line(Trans::get('You do not need to reply to this email. We will reach out if we need more details.', $locale))
            ->salutation(Trans::get('Warm regards, Andromeda Dealer Team', $locale));
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
