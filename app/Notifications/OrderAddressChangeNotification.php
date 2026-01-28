<?php

namespace App\Notifications;

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
            'requested' => $this->addressRequested(),
            'approved' => $this->addressApproved(),
            'rejected' => $this->addressRejected(),
            default => $this->addressRequested(),
        };
    }

    protected function addressRequested(): MailMessage
    {
        return (new MailMessage)
            ->subject('Shipping Address Change Request Received')
            ->greeting('Hello '.$this->request->customer->user->name.',')
            ->line('We have received your request to update the shipping address for your order.')
            ->line('Order Number: '.$this->request->order->order_no)
            ->line('Our team will review your request and notify you once a decision is made.')
            ->action(
                'View Order',
                route('website.orders.order-view', ['order_no' => $this->request->order->order_no])
            )
            ->line('Thank you for your patience.');
    }

    protected function addressApproved(): MailMessage
    {
        return (new MailMessage)
            ->subject('Shipping Address Change Approved')
            ->greeting('Good news!')
            ->line('Your shipping address change request has been approved.')
            ->line('Order Number: '.$this->request->order->order_no)
            ->line('The updated address will be used for delivery of your order.')
            ->action(
                'View Order',
                route('website.orders.order-view', ['order_no' => $this->request->order->order_no])
            )
            ->line('If you have any further questions, feel free to contact our support team.');
    }

    protected function addressRejected(): MailMessage
    {
        return (new MailMessage)
            ->subject('Shipping Address Change Rejected')
            ->greeting('Hello '.$this->request->customer->user->name.',')
            ->line('Unfortunately, your request to change the shipping address could not be approved.')
            ->line('Order Number: '.$this->request->order->order_no)
            ->line('If you believe this is a mistake, please contact our support team.')
            ->action(
                'Contact Support',
                route('website.contact.index')
            );
    }
}
