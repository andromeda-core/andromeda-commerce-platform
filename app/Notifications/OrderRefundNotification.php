<?php

namespace App\Notifications;

use App\Helpers\Trans;
use App\Models\OrderRefund;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderRefundNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private OrderRefund $refund,
        private string $type
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return match ($this->type) {
            'requested' => $this->refundRequested($notifiable),
            'approved' => $this->refundApproved($notifiable),
            'rejected' => $this->refundRejected($notifiable),
            'completed' => $this->refundCompleted($notifiable),
            'awaiting_returned_item' => $this->refundAwaitingReturnedItem($notifiable),
        };
    }

    protected function refundRequested($notifiable): MailMessage
    {
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Refund Request Received', $locale))
            ->greeting(Trans::get('Hello', $locale) . ' ' . $this->refund->customer->user->name . ',')
            ->line(Trans::get('We have received your refund request and it is currently under review.', $locale))
            ->line(Trans::get('Order Number', $locale) . ': ' . $this->refund->order->order_no)
            ->line(Trans::get('Refund Amount', $locale) . ': ' . $this->refund->refund_amount)
            ->line(Trans::get('Our team will notify you once a decision is made.', $locale))
            ->action(Trans::get('View Order', $locale), route('website.orders.order-view', ['order_no' => $this->refund->order->order_no]))
            ->line(Trans::get('Thank you for your patience.', $locale));
    }

    protected function refundApproved($notifiable): MailMessage
    {
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Refund Request Approved', $locale))
            ->greeting(Trans::get('Good news!', $locale))
            ->line(Trans::get('Your refund request has been approved.', $locale))
            ->line(Trans::get('Order Number', $locale) . ': ' . $this->refund->order->order_no)
            ->line(Trans::get('Refund Amount', $locale) . ': ' . $this->refund->refund_amount)
            ->line(Trans::get('Refund Method', $locale) . ': ' . ucfirst(str_replace('_', ' ', $this->refund->refund_method)))
            ->line(Trans::get('We are processing your refund and will notify you once it is completed.', $locale))
            ->action(Trans::get('View Order', $locale), route('website.orders.order-view', ['order_no' => $this->refund->order->order_no]));
    }

    protected function refundRejected($notifiable): MailMessage
    {
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Refund Request Rejected', $locale))
            ->greeting(Trans::get('Hello', $locale) . ' ' . $this->refund->customer->user->name . ',')
            ->line(Trans::get('Unfortunately, your refund request has been rejected.', $locale))
            ->line(Trans::get('Order Number', $locale) . ': ' . $this->refund->order->order_no)
            ->line(Trans::get('If you believe this is a mistake, please contact our support team.', $locale))
            ->action(Trans::get('Contact Support', $locale), route('website.contact.index'));
    }

    protected function refundCompleted($notifiable): MailMessage
    {
        $locale = $notifiable->language_locale ?? 'en';

        $mail = (new MailMessage)
            ->subject(Trans::get('Refund Completed', $locale))
            ->greeting(Trans::get('Refund Completed', $locale))
            ->line(Trans::get('Your refund has been successfully completed.', $locale))
            ->line(Trans::get('Order Number', $locale) . ': ' . $this->refund->order->order_no)
            ->line(Trans::get('Refund Amount', $locale) . ': ' . $this->refund->refund_amount);

        if ($this->refund->refund_method === 'points') {
            $mail->line(Trans::get('The refunded amount has been credited to your points balance.', $locale));
        } else {
            $mail->line(Trans::get('The refund has been processed via', $locale) . ' ' . ucfirst(str_replace('_', ' ', $this->refund->refund_method)) . '.');
            $mail->line(Trans::get('Please allow some time for it to reflect in your account.', $locale));
        }

        return $mail
            ->action(Trans::get('View Order', $locale), route('website.orders.order-view', ['order_no' => $this->refund->order->order_no]))
            ->line(Trans::get('Thank you for shopping with us.', $locale));
    }

    protected function refundAwaitingReturnedItem($notifiable): MailMessage
    {
        $locale = $notifiable->language_locale ?? 'en';

        return (new MailMessage)
            ->subject(Trans::get('Return Tracking Slip Received', $locale))
            ->greeting(Trans::get('Hello', $locale) . ' ' . $this->refund->customer->user->name . ',')
            ->line(Trans::get('We have received your return tracking slip successfully.', $locale))
            ->line(Trans::get('Order Number', $locale) . ': ' . $this->refund->order->order_no)
            ->line(Trans::get('Your returned item is now in transit. We will process your refund once the item is received.', $locale))
            ->action(Trans::get('View Order', $locale), route('website.orders.order-view', ['order_no' => $this->refund->order->order_no]));
    }
}
