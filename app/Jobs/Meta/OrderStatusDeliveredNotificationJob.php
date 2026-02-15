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

class OrderStatusDeliveredNotificationJob implements ShouldQueue
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

        $message .= Trans::get('We’re happy to inform you that your order has been delivered successfully.', $locale);

        $message .= '📦 '.Trans::get('Order Details', $locale)."\n";

        $message .= Trans::get('Order Number', $locale).": {$this->order->order_no}\n";

        $message .= Trans::get('Current Status', $locale).': '.Trans::get('DELIVERED', $locale)."\n";

        $message .= Trans::get('We hope you’re satisfied with your purchase and enjoy using your new product(s).', $locale)."\n\n";

        $message .= Trans::get('You can view your order details anytime in the My Orders section of your account.', $locale)."\n\n";

        $message .= Trans::get('View Your Order', $locale).': '.route('website.orders.order-view', $this->order->order_no)."\n\n";

        $message .= Trans::get('Thank you for choosing us! We look forward to serving you again soon.', $locale);

        $internal_id = $this->meta_setting->meta_fb_page_id;
        $token = $this->meta_setting->meta_fb_page_access_token;

        foreach ($this->meta_contacts as $contact) {
            $platform = $contact->platform;
            $meta_service->sendMessageViaMeta($platform, $token, $internal_id, $contact->platform_user_id, $message);
        }
    }
}
