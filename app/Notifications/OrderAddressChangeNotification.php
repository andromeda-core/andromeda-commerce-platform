<?php

namespace App\Notifications;

use App\Helpers\Trans;
use App\Models\OrderAddressChangeRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderAddressChangeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private OrderAddressChangeRequest $request,
        private string $type
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return match ($this->type) {
            'requested' => $this->addressRequested($notifiable),
            'approved' => $this->addressApproved($notifiable),
            'rejected' => $this->addressRejected($notifiable),
            default => $this->addressRequested($notifiable),
        };
    }

    protected function addressRequested($notifiable): MailMessage
    {
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Shipping Address Change Request Received', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$this->request->customer->user->name.',')
            ->line(Trans::get('We have received your request to update the shipping address for your order.', $locale))
            ->line(Trans::get('Order Number', $locale).': '.$this->request->order->order_no)
            ->line(Trans::get('Our team will review your request and notify you once a decision is made.', $locale))
            ->action(
                Trans::get('View Order', $locale),
                route('website.orders.order-view', ['order_no' => $this->request->order->order_no])
            )
            ->line(Trans::get('Thank you for your patience.', $locale));
    }

    protected function addressApproved($notifiable): MailMessage
    {
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Shipping Address Change Approved', $locale))
            ->greeting(Trans::get('Good news!', $locale))
            ->line(Trans::get('Your shipping address change request has been approved.', $locale))
            ->line(Trans::get('Order Number', $locale).': '.$this->request->order->order_no)
            ->line(Trans::get('The updated address will be used for delivery of your order.', $locale))
            ->action(
                Trans::get('View Order', $locale),
                route('website.orders.order-view', ['order_no' => $this->request->order->order_no])
            )
            ->line(Trans::get('If you have any further questions, feel free to contact our support team.', $locale));

    }

    protected function addressRejected($notifiable): MailMessage
    {
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Shipping Address Change Rejected', $locale))
            ->greeting(Trans::get('Hello', $locale).' '.$this->request->customer->user->name.',')
            ->line(Trans::get('Unfortunately, your request to change the shipping address could not be approved.', $locale))
            ->line(Trans::get('Order Number', $locale).': '.$this->request->order->order_no)
            ->line(Trans::get('If you believe this is a mistake, please contact our support team.', $locale))
            ->action(
                Trans::get('Contact Support', $locale),
                route('website.contact.index')
            );
    }
}
