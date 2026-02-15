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

class OrderPaymentProofUploadedNotificationJob implements ShouldQueue
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

        $message = Trans::get('Hello', $locale)." {$this->user->name}"."\n\n";

        $message .= Trans::get('We’ve successfully received your payment proof for Order', $locale).' #'.$this->order->order_no."\n\n";

        $message .= Trans::get('Our team will now review and verify your payment. This process usually takes 2 to 3 business days.'.$locale)."\n\n";

        $message .= Trans::get('Once your payment is approved, you’ll receive another Email And DM confirming your order status update.', $locale)."\n\n";

        $message .= Trans::get('If you haven’t heard back from us after 3 business days, please don’t hesitate to reach out to our support team for assistance.', $locale)."\n\n";

        $message .= Trans::get('View Your Order', $locale).': '.route('website.orders.order-view', $this->order->order_no)."\n\n";

        $internal_id = $this->meta_setting->meta_fb_page_id;
        $token = $this->meta_setting->meta_fb_page_access_token;

        foreach ($this->meta_contacts as $contact) {
            $platform = $contact->platform;
            $meta_service->sendMessageViaMeta($platform, $token, $internal_id, $contact->platform_user_id, $message);
        }
    }
}
