<?php

namespace App\Helpers;

use App\Models\UnsettledAccount;

class UnsettledAccountMessageBuilder
{
    public static function build(UnsettledAccount $issue): string
    {
        $orderNo = $issue->order?->order_no
            ? "Order #{$issue->order->order_no}"
            : 'your recent order';

        return match ($issue->reason) {

            'payment_pending_too_long' => "We noticed that the payment for {$orderNo} has been pending for some time. "
                .'Please complete the payment to avoid any delays in processing your order.',

            'payment_failed' => "The payment attempt for {$orderNo} was not successful. "
                .'Please try again or use a different payment method to proceed with your order.',

            'refund_not_resolved' => "Your refund request for {$orderNo} is currently under review. "
                .'Our team is working on it, and you will be notified once the refund is finalized.',

            'paid_but_not_fulfilled' => "The payment for {$orderNo} has been received, however the order has not yet been fulfilled. "
                .'Our team is actively reviewing this and will update you shortly.',

            'repeated_failed_orders_in_this_week' => 'We have noticed multiple failed order attempts on your account recently. '
                .'Please review your recent orders or verify your payment details to avoid further issues.',

            default => 'There is an unresolved issue associated with your account. '
                .'Please review your account details or contact our support team if you need assistance.',
        };
    }
}
