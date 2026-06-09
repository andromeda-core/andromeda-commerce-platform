<?php

namespace App\Notifications\Lodging;

use App\Helpers\Trans;
use App\Models\LodgingReservation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Stage 2.4 — customer notification: payment confirmed, reservation CONFIRMED.
 *
 * Carries the reservation_no (Joseph point 8). Customer copy via Trans::get
 * (clean ASCII keys). Delivered to mail + database (in-app).
 */
class LodgingReservationConfirmed extends Notification implements ShouldQueue
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
            ->subject(Trans::get('Your Reservation Is Confirmed', $locale)." #{$reservationNo}")
            ->greeting(Trans::get('Hi', $locale)." {$notifiable->name},")
            ->line(Trans::get('Great news! Your payment has been confirmed and your reservation is now confirmed.', $locale))
            ->line('• '.Trans::get('Reservation Number', $locale).": {$reservationNo}")
            ->line(Trans::get('We look forward to hosting you.', $locale))
            ->line(Trans::get('If you have any questions or need assistance, feel free to contact our support team.', $locale));
    }

    public function toDatabase(object $notifiable): array
    {
        $locale = $notifiable->language_locale ?? 'en';

        return [
            'type' => 'lodging_reservation_confirmed',
            'title' => Trans::get('Your Reservation Is Confirmed', $locale),
            'message' => Trans::get('Great news! Your payment has been confirmed and your reservation is now confirmed.', $locale),
            'reservation_no' => $this->reservation->reservation_no,
            'action_url' => null,
        ];
    }
}
