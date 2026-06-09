<?php

namespace App\Notifications\Lodging;

use App\Helpers\Trans;
use App\Models\LodgingReservation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Stage 2.4 — customer notification: reservation approved + payment link created.
 *
 * Carries the correct reservation_no AND the lodging payment link (the
 * lodging_reservation_payments payment_url) per Joseph point 8. Customer copy is
 * translated via Trans::get (clean ASCII keys). Delivered to mail + database (in-app).
 */
class LodgingReservationApproved extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private LodgingReservation $reservation,
        private ?string $paymentUrl = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $locale = $notifiable->language_locale ?? 'en';
        $reservationNo = $this->reservation->reservation_no;

        $mail = (new MailMessage)
            ->subject(Trans::get('Your Reservation Is Approved', $locale)." #{$reservationNo}")
            ->greeting(Trans::get('Hi', $locale)." {$notifiable->name},")
            ->line(Trans::get('Your reservation has been approved.', $locale))
            ->line(Trans::get('A payment link has been created. Please complete your crypto payment before it expires to confirm your booking.', $locale))
            ->line('• '.Trans::get('Reservation Number', $locale).": {$reservationNo}");

        if (! empty($this->paymentUrl)) {
            $mail->action(Trans::get('Complete Payment', $locale), $this->paymentUrl);
        }

        return $mail->line(Trans::get('If you have any questions or need assistance, feel free to contact our support team.', $locale));
    }

    public function toDatabase(object $notifiable): array
    {
        $locale = $notifiable->language_locale ?? 'en';

        return [
            'type' => 'lodging_reservation_approved',
            'title' => Trans::get('Your Reservation Is Approved', $locale),
            'message' => Trans::get('Your reservation has been approved.', $locale).' '
                .Trans::get('A payment link has been created. Please complete your crypto payment before it expires to confirm your booking.', $locale),
            'reservation_no' => $this->reservation->reservation_no,
            'action_url' => $this->paymentUrl,
        ];
    }
}
