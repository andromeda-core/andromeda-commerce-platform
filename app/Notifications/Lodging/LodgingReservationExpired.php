<?php

namespace App\Notifications\Lodging;

use App\Helpers\Trans;
use App\Models\LodgingReservation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Stage 2.4 — customer notification: reservation expired.
 *
 * Covers BOTH expiry deadlines via the $reason flag:
 *   - 'no_response' : the 24h operator no-response window (EXPIRED_NO_RESPONSE)
 *   - 'payment'     : the 60min approved-but-unpaid window (PAYMENT_EXPIRED)
 *
 * Carries the reservation_no (Joseph point 8). Customer copy via Trans::get
 * (clean ASCII keys). Delivered to mail + database (in-app).
 */
class LodgingReservationExpired extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private LodgingReservation $reservation,
        private string $reason = 'payment',
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    private function reasonLine(string $locale): string
    {
        return $this->reason === 'no_response'
            ? Trans::get('Your reservation request expired because the property did not respond in time.', $locale)
            : Trans::get('Your reservation expired because the payment was not completed in time.', $locale);
    }

    public function toMail(object $notifiable): MailMessage
    {
        $locale = $notifiable->language_locale ?? 'en';
        $reservationNo = $this->reservation->reservation_no;

        return (new MailMessage)
            ->subject(Trans::get('Your Reservation Has Expired', $locale)." #{$reservationNo}")
            ->greeting(Trans::get('Hi', $locale)." {$notifiable->name},")
            ->line($this->reasonLine($locale))
            ->line('• '.Trans::get('Reservation Number', $locale).": {$reservationNo}")
            ->line(Trans::get('You are welcome to submit a new reservation request anytime.', $locale))
            ->line(Trans::get('If you have any questions or need assistance, feel free to contact our support team.', $locale));
    }

    public function toDatabase(object $notifiable): array
    {
        $locale = $notifiable->language_locale ?? 'en';

        return [
            'type' => 'lodging_reservation_expired',
            'reason' => $this->reason,
            'title' => Trans::get('Your Reservation Has Expired', $locale),
            'message' => $this->reasonLine($locale),
            'reservation_no' => $this->reservation->reservation_no,
            'action_url' => null,
        ];
    }
}
