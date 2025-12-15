<?php

namespace App\Jobs\Meta;

use App\Models\MetaSetting;
use App\Models\Order;
use App\Models\User;
use App\Services\MetaService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Queue\Queueable;

class OrderStatusArrivedLocallyNotificationJob implements ShouldQueue
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
        $message .= "We’re excited to let you know that your order has arrived in your city and will be delivered to you very soon.\n\n";

        $message .= "📦 Order Details\n";
        $message .= "Order Number: {$this->order->order_no}\n";
        $message .= "Current Status: Arrived Locally\n";
        $message .= "Our delivery partner will be reaching out to you shortly to complete the final step of your delivery.\n\n";
        $message .= "You can always check the latest status of your order in the My Orders section of your account.\n\n";
        $message .= 'View Your Order: '.route('website.orders.order-view', $this->order->order_no)."\n\n";
        $message .= 'Thank you for your patience and for choosing us! We look forward to delivering your package soon!';

        foreach ($this->meta_contacts as $contact) {
            $platform = $contact->platform;
            $internal_id = $this->meta_setting->meta_fb_page_id;
            $token = $this->meta_setting->meta_fb_page_access_token;
            $meta_service->sendMessageViaMeta($platform, $token, $internal_id, $contact->platform_user_id, $message);
        }
    }
}
