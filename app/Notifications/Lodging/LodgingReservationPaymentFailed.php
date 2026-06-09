<?php

namespace App\Notifications\Lodging;

use App\Helpers\Trans;
use App\Models\LodgingReservation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Stage 2.4 — customer notification: reservation crypto payment failed.
 *
 * Carries the reservation_no (Joseph point 8). Customer copy via Trans::get
 * (clean ASCII keys). Delivered to mail + database (in-app).
 */
class LodgingReservationPaymentFailed extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private LodgingReservation $reservation,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $locale = $notifiable->language_locale ?? 'en';
        $reservationNo = $this->reservation->reservation_no;

        return (new MailMessage)
            ->subject(Trans::get('Your Reservation Payment Failed', $locale)." #{$reservationNo}")
            ->greeting(Trans::get('Hi', $locale)." {$notifiable->name},")
            ->line(Trans::get('Your reservation payment could not be completed.', $locale))
            ->line('• '.Trans::get('Reservation Number', $locale).": {$reservationNo}")
            ->line(Trans::get('You are welcome to submit a new reservation request anytime.', $locale))
            ->line(Trans::get('If you have any questions or need assistance, feel free to contact our support team.', $locale));
    }

    public function toDatabase(object $notifiable): array
    {
        $locale = $notifiable->language_locale ?? 'en';

        return [
            'type' => 'lodging_reservation_payment_failed',
            'title' => Trans::get('Your Reservation Payment Failed', $locale),
            'message' => Trans::get('Your reservation payment could not be completed.', $locale),
            'reservation_no' => $this->reservation->reservation_no,
            'action_url' => null,
        ];
    }
}
