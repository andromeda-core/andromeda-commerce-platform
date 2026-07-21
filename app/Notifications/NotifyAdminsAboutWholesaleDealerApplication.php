<?php

namespace App\Notifications;

use App\Helpers\Trans;
use App\Models\WholesaleDealerApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NotifyAdminsAboutWholesaleDealerApplication extends Notification implements ShouldQueue
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

        $dashboardUrl = route('dashboard.wholesale-dealer-applications.show', $application->public_id);

        return (new MailMessage)
            ->subject(Trans::get('New Wholesale Dealer Application', $locale) . ' — ' . $application->application_id)
            ->greeting(Trans::get('New Wholesale Dealer Application', $locale))
            ->line(Trans::get('A new wholesale dealer application has been submitted:', $locale))
            ->line('**' . Trans::get('Application ID', $locale) . ':** ' . $application->application_id)
            ->line('**' . Trans::get('Company / Store Name', $locale) . ':** ' . $application->company_store_name)
            ->line('**' . Trans::get('Registered Legal Business Name', $locale) . ':** ' . $application->legal_business_name)
            ->line('**' . Trans::get('Contact Person', $locale) . ':** ' . $application->contact_person)
            ->line('**' . Trans::get('Business Email', $locale) . ':** ' . $application->business_email)
            ->line('**' . Trans::get('Phone / WhatsApp', $locale) . ':** ' . $application->phone_whatsapp)
            ->line('**' . Trans::get('Country of Registration', $locale) . ':** ' . $application->country_of_registration)
            ->line('**' . Trans::get('Initial Order Quantity (Units)', $locale) . ':** ' . $application->initial_order_quantity_units)
            ->line('**' . Trans::get('Available Budget for Initial Order (USD)', $locale) . ':** ' . $application->available_initial_order_budget_usd)
            ->action(Trans::get('Review Application', $locale), $dashboardUrl)
            ->line(Trans::get('Please review this wholesale dealer application in the dashboard.', $locale));
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
