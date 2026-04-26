<?php

namespace App\Notifications;

use App\Helpers\Trans;
use App\Models\OrderRefund;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RefundAwaitingTrackingNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private OrderRefund $refund) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Action Required: Upload Your Return Tracking Slip', $locale))
            ->greeting(Trans::get('Hello', $locale) . ' ' . $this->refund->customer->user->name . ',')
            ->line(Trans::get('Your refund request has been approved. To proceed, please ship the item back and upload a photo of your return shipping tracking slip.', $locale))
            ->line(Trans::get('Order Number', $locale) . ': ' . $this->refund->order->order_no)
            ->line(Trans::get('Deadline', $locale) . ': ' . Carbon::parse($this->refund->return_tracking_deadline_at)->format('d M Y, h:i A'))
            ->line(Trans::get('If the tracking slip is not uploaded within 48 hours, your refund request will be automatically rejected.', $locale))
            ->action(Trans::get('Upload Tracking Slip', $locale), route('website.orders.order-view', ['order_no' => $this->refund->order->order_no]));
    }
}
