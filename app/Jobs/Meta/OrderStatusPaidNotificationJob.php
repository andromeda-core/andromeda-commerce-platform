<?php

namespace App\Jobs\Meta;

use App\Models\Currency;
use App\Models\MetaSetting;
use App\Models\Order;
use App\Models\User;
use App\Services\MetaService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Queue\Queueable;

class OrderStatusPaidNotificationJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private Collection $meta_contacts,
        private Order $order,
        private Currency $currency,
        private MetaSetting $meta_setting,
        private User $user
    ) {}

    public function handle(): void
    {
        $meta_service = new MetaService($this->meta_setting);
        $message = "Hello {$this->user->name},\n\n";
        $message .= "Thank you for your payment! We’ve successfully received your payment for your order..\n\n";

        $message .= "📦 Order Details\n";
        $message .= "Order Number: {$this->order->order_no}\n";
        if ($this->order->payment_method !== 'points') {
            $message .= 'Amount: '.number_format($this->order->amount, 2).' '.($this->currency->name ?? 'USD')."\n\n";
        }

        $message .= "Current Status: Paid\n";
        $message .= 'Payment Method: '.(
            $this->order->payment_method === 'bank_transfer'
                ? 'Bank Transfer'
                : 'Points'
        )."\n\n";
        $message .= 'Your order is now being processed and will be prepared for shipment shortly.'."\n\n";
        $message .= 'You can track the progress of your order anytime from your account’s My Orders page.'."\n\n";
        $message .= 'View Your Order: '.route('website.orders.order-view', $this->order->order_no)."\n\n";
        $message .= 'View Your Order Invoice: '.route('orders.customer-order-invoice', $this->order->order_no)."\n\n";
        $message .= 'We truly appreciate your trust in us and look forward to delivering your order soon.'."\n\n";

        foreach ($this->meta_contacts as $contact) {
            $platform = $contact->platform;
            $internal_id = $this->meta_setting->meta_fb_page_id;
            $token = $this->meta_setting->meta_fb_page_access_token;
            $meta_service->sendMessageViaMeta($platform, $token, $internal_id, $contact->platform_user_id, $message);
        }

    }
}
