<?php

namespace App\Jobs\Meta;

use App\Helpers\Trans;
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

        $locale = $this->user->language_locale ?? 'en';
        $currency = $this->currency->name ?? 'USD';

        $message = Trans::get('Hello', $locale)." {$this->user->name},\n\n";

        $message .= Trans::get('Thank you for your payment! We’ve successfully received your payment for your order.', $locale)."\n\n";

        $message .= '📦 '.Trans::get('Order Details', $locale)."\n";

        $message .= Trans::get('Order Number', $locale).": {$this->order->order_no}\n";

        $message .= Trans::get('Amount Paid', $locale).': '.number_format($this->order->full_amount, 2).' '.($currency)."\n\n";

        $message .= Trans::get('Current Status', $locale).': '.Trans::get('PAID', $locale)."\n";

        $message .= Trans::get('Payment Method', $locale).': '.(
            $this->order->payment_method === 'bank_transfer'
                ? Trans::get('Bank Transfer', $locale)
                : Trans::get('Points', $locale)
        )."\n\n";

        $message .= Trans::get('Your order is now being processed and will be prepared for shipment shortly.')."\n\n";

        $message .= Trans::get('You can track the progress of your order anytime from your account’s My Orders page.', $locale)."\n\n";

        $message .= Trans::get('View Your Order', $locale).': '.route('website.orders.order-view', $this->order->order_no)."\n\n";

        $message .= Trans::get('View Your Order Invoice', $locale).': '.route('orders.customer-order-invoice', $this->order->order_no)."\n\n";

        $message .= Trans::get('We truly appreciate your trust in us and look forward to delivering your order soon.', $locale)."\n\n";

        $internal_id = $this->meta_setting->meta_fb_page_id;
        $token = $this->meta_setting->meta_fb_page_access_token;

        foreach ($this->meta_contacts as $contact) {
            $platform = $contact->platform;
            $meta_service->sendMessageViaMeta($platform, $token, $internal_id, $contact->platform_user_id, $message);
        }

    }
}
