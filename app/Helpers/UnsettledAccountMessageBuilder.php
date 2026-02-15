<?php

namespace App\Helpers;

use App\Models\UnsettledAccount;
use App\Models\User;

class UnsettledAccountMessageBuilder
{
    public static function build(UnsettledAccount $issue, User $user): string
    {
        $locale = $user->language_locale ?? 'en';

        $orderNo = $issue->order?->order_no
            ? Trans::get('Order')." #{$issue->order->order_no}"
            : Trans::get('your recent order', $locale);

        return match ($issue->reason) {

            'payment_pending_too_long' => Trans::get('We noticed that the payment for', $locale).' '.$orderNo.' '.
                Trans::get('has been pending for some time. Please complete the payment to avoid any delays in processing your order.', $locale),

            'payment_failed' => Trans::get('The payment attempt for', $locale).' '.$orderNo.' '.
                Trans::get('was not successful. Please try again or use a different payment method to proceed with your order.', $locale),

            'refund_not_resolved' => Trans::get('Your refund request for', $locale).' '.$orderNo.' '.
                Trans::get('is currently under review. Our team is working on it, and you will be notified once the refund is finalized.', $locale),

            'paid_but_not_fulfilled' => Trans::get('The payment for', $locale).' '.$orderNo.' '.
                Trans::get('has been received, however the order has not yet been fulfilled. Our team is actively reviewing this and will update you shortly.', $locale),

            'repeated_failed_orders_in_this_week' => Trans::get('We have noticed multiple failed order attempts on your account recently. Please review your recent orders or verify your payment details to avoid further issues.', $locale),

            default => Trans::get('There is an unresolved issue associated with your account. Please review your account details or contact our support team if you need assistance.', $locale),
        };
    }
}
