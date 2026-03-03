<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NotifySupplierAboutOrderAssignment extends Notification implements ShouldQueue
{
    use Queueable;

    protected $order;

    /**
     * Create a new notification instance.
     */
    public function __construct($order)
    {
        $order->loadMissing([
            'customer.user',
            'orderItems.smartphone.model_name',
        ]);

        $this->order = $order;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $order = $this->order;

        $missingSummary = [];

        foreach ($order->orderItems as $item) {

            $qty = (int) $item->quantity;

            $ids = $item->inventory_item_ids ?? [];
            if (is_string($ids)) {
                $ids = json_decode($ids, true) ?: [];
            }
            if (! is_array($ids)) {
                $ids = [];
            }

            $reserved = count($ids);
            $missing = max(0, $qty - $reserved);

            if ($missing > 0) {
                $name =
                    $item->smartphone?->model_name?->name
                    ?? $item->smartphone?->name
                    ?? "Smartphone#{$item->smartphone_id}";

                $missingSummary[] = "{$name} (Missing: {$missing})";
            }
        }

        $mail = (new MailMessage)
            ->subject("New Order Assigned: #{$order->order_no}")
            ->greeting("Hello {$notifiable->name},")
            ->line('A new order has been assigned to you.')
            ->line("Order No: {$order->order_no}")
            ->line("Total Amount: {$order->full_amount}");

        if (! empty($missingSummary)) {
            $mail->line('Items Required to Fulfill:');
            foreach ($missingSummary as $line) {
                $mail->line("- {$line}");
            }
        }

        $mail->action(
            'View Orders',
            route('dashboard.supplier-assigned-orders.index')
        );

        return $mail->line('Please review and proceed with fulfillment.');
    }

    /**
     * Optional database representation
     */
    // public function toArray(object $notifiable): array
    // {
    //     return [
    //         'order_id' => $this->order->id,
    //         'order_no' => $this->order->order_no,
    //         'message' => "New order assigned: #{$this->order->order_no}",
    //     ];
    // }
}
