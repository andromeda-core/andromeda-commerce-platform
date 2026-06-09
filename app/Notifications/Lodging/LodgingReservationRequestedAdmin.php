<?php

namespace App\Notifications\Lodging;

use App\Models\LodgingReservation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Stage 2.4 — operator/dashboard notification: a new lodging reservation request
 * needs review. This is OPERATOR-FACING, so copy stays English (no Trans::get) per
 * the project rule. Delivered to mail + database (in-app dashboard).
 *
 * Links straight to the dashboard reservation detail so the operator can
 * approve/reject (Stage 2.3 actions).
 */
class LodgingReservationRequestedAdmin extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private LodgingReservation $reservation,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    private function dashboardUrl(): string
    {
        return route('dashboard.lodging-reservations.show', $this->reservation->reservation_no);
    }

    public function toMail(object $notifiable): MailMessage
    {
        $reservationNo = $this->reservation->reservation_no;
        $property = $this->reservation->property_name_snapshot;
        $room = $this->reservation->room_name_snapshot;

        return (new MailMessage)
            ->subject("New Lodging Reservation Request #{$reservationNo}")
            ->greeting("Hello {$notifiable->name},")
            ->line('A new lodging reservation request has been submitted and is awaiting hotel review.')
            ->line("• Reservation No: {$reservationNo}")
            ->line('• Property: '.($property ?? '-'))
            ->line('• Room: '.($room ?? '-'))
            ->line('• Check-in: '.optional($this->reservation->checkin_date)->toDateString())
            ->line('• Check-out: '.optional($this->reservation->checkout_date)->toDateString())
            ->action('Review Reservation', $this->dashboardUrl())
            ->line('Please review and approve or reject this request.');
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'lodging_reservation_requested',
            'title' => 'New Lodging Reservation Request',
            'message' => "Reservation #{$this->reservation->reservation_no} is awaiting hotel review.",
            'reservation_no' => $this->reservation->reservation_no,
            'action_url' => $this->dashboardUrl(),
        ];
    }
}
