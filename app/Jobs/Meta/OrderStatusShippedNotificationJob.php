<?php

namespace App\Jobs\Meta;

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
        $message = "Hello {$this->user->name},\n\n";
        $message .= "Good news! Your order has been shipped and is now on its way to you.\n\n";

        $message .= "📦 Order Details\n";
        $message .= "Order Number: {$this->order->order_no}\n";
        $message .= "Current Status: Shipped\n";
        $message .= "Courier Company: {$this->order->courier_company}\n";
        $message .= "Tracking Number: {$this->order->tracking_no}\n";
        $message .= "Shipping Date: {$this->order->shipping_date->format('M d, Y')}\n\n";

        $message .= "You can track your shipment directly on {$this->order->courier_company}’s website using your tracking number: {$this->order->tracking_no}'\n\n";
        $message .= "For complete details and the latest status of your order, please visit the My Orders Page in your account.\n\n";
        $message .= 'View Your Order: '.route('website.orders.order-view', $this->order->order_no)."\n\n";
        $message .= 'Thank you for shopping with us! We look forward to delivering your order soon.';

        foreach ($this->meta_contacts as $contact) {
            $platform = $contact->platform;
            $internal_id = $this->meta_setting->meta_fb_page_id;
            $token = $this->meta_setting->meta_fb_page_access_token;
            $meta_service->sendMessageViaMeta($platform, $token, $internal_id, $contact->platform_user_id, $message);
        }
    }
}
