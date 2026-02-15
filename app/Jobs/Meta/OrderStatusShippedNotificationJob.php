<?php

namespace App\Jobs\Meta;

use App\Helpers\Trans;
use App\Models\MetaSetting;
use App\Models\Order;
use App\Models\User;
use App\Services\MetaService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Queue\Queueable;

class OrderStatusShippedNotificationJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private Collection $meta_contacts,
        private Order $order,
        private MetaSetting $meta_setting,
        private User $user
    ) {}

    public function handle(): void
    {
        $meta_service = new MetaService($this->meta_setting);
        $locale = $this->user->language_locale ?? 'en';

        $message = Trans::get('Hello', $locale)." {$this->user->name},\n\n";

        $message .= Trans::get('Good news! Your order has been shipped and is now on its way to you.', $locale)."\n\n";

        $message .= '📦 '.Trans::get('Order Details', $locale)."\n";

        $message .= Trans::get('Order Number', $locale).": {$this->order->order_no}\n";

        $message .= Trans::get('Current Status', $locale).': '.Trans::get('SHIPPED', $locale)."\n";

        $message .= Trans::get('Courier Company', $locale).": {$this->order->courier_company}\n";

        $message .= Trans::get('Tracking Number', $locale).": {$this->order->tracking_no}\n";

        $message .= Trans::get('Shipping Date', $locale).": {$this->order->shipping_date->format('M d, Y')}\n\n";

        $message .= Trans::get('You can track your shipment directly on', $locale)." {$this->order->courier_company} ".Trans::get('website using your tracking number').": {$this->order->tracking_no}'\n\n";

        $message .= Trans::get('For complete details and the latest status of your order, please visit the My Orders Page in your account.', $locale)."\n\n";

        $message .= Trans::get('View Your Order', $locale).': '.route('website.orders.order-view', $this->order->order_no)."\n\n";

        $message .= Trans::get('Thank you for shopping with us! We look forward to delivering your order soon.', $locale);

        $internal_id = $this->meta_setting->meta_fb_page_id;
        $token = $this->meta_setting->meta_fb_page_access_token;

        foreach ($this->meta_contacts as $contact) {
            $platform = $contact->platform;
            $meta_service->sendMessageViaMeta($platform, $token, $internal_id, $contact->platform_user_id, $message);
        }
    }
}
