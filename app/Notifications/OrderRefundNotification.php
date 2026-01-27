<?php

namespace App\Notifications;

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
            'requested' => $this->refundRequested(),
            'approved' => $this->refundApproved(),
            'rejected' => $this->refundRejected(),
            'completed' => $this->refundCompleted(),
        };
    }

    protected function refundRequested(): MailMessage
    {
        return (new MailMessage)
            ->subject('Refund Request Received')
            ->greeting('Hello '.$this->refund->customer->user->name.',')
            ->line('We have received your refund request and it is currently under review.')
            ->line('Order Number: '.$this->refund->order->order_no)
            ->line('Refund Amount: '.$this->refund->refund_amount)
            ->line('Our team will notify you once a decision is made.')
            ->action('View Order', route('website.orders.order-view', ['order_no' => $this->refund->order->order_no]))
            ->line('Thank you for your patience.');
    }

    protected function refundApproved(): MailMessage
    {
        return (new MailMessage)
            ->subject('Refund Request Approved')
            ->greeting('Good news!')
            ->line('Your refund request has been approved.')
            ->line('Order Number: '.$this->refund->order->order_no)
            ->line('Refund Amount: '.$this->refund->refund_amount)
            ->line('Refund Method: '.ucfirst(str_replace('_', ' ', $this->refund->refund_method)))
            ->line('We are processing your refund and will notify you once it is completed.')
            ->action('View Order', route('website.orders.order-view', ['order_no' => $this->refund->order->order_no]));
    }

    protected function refundRejected(): MailMessage
    {
        return (new MailMessage)
            ->subject('Refund Request Rejected')
            ->greeting('Hello '.$this->refund->customer->user->name.',')
            ->line('Unfortunately, your refund request has been rejected.')
            ->line('Order Number: '.$this->refund->order->order_no)
            ->when(
                ! empty($this->refund->note),
                fn (MailMessage $mail) => $mail->line('Reason: '.$this->refund->note)
            )
            ->line('If you believe this is a mistake, please contact our support team.')
            ->action('Contact Support', route('website.contact.index'));
    }

    protected function refundCompleted(): MailMessage
    {
        $mail = (new MailMessage)
            ->subject('Refund Completed')
            ->greeting('Refund Completed')
            ->line('Your refund has been successfully completed.')
            ->line('Order Number: '.$this->refund->order->order_no)
            ->line('Refund Amount: '.$this->refund->refund_amount);

        if ($this->refund->refund_method === 'points') {
            $mail->line('The refunded amount has been credited to your points balance.');
        } else {
            $mail->line('The refund has been processed via '.ucfirst(str_replace('_', ' ', $this->refund->refund_method)).'.');
            $mail->line('Please allow some time for it to reflect in your account.');
        }

        return $mail
            ->action('View Order', route('website.orders.order-view', ['order_no' => $this->refund->order->order_no]))
            ->line('Thank you for shopping with us.');
    }
}
