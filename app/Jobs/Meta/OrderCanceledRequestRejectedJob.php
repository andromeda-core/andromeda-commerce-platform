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

class OrderCanceledRequestRejectedJob implements ShouldQueue
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

        $message .= Trans::get('We have reviewed your order cancellation request.', $locale)."\n";

        $message .= Trans::get('Unfortunately, your request has been rejected at this time.', $locale)."\n";

        $message .= Trans::get('Order Number', $locale)." #{$this->order->order_no}\n\n";

        $message .= Trans::get('If you need more information or have any concerns, please feel free to contact our support team.', $locale)."\n";

        $message .= Trans::get('View Order Details', $locale).': '
        .route('website.orders.order-view', $this->order->order_no)."\n\n";

        $message .= Trans::get('Thank you for your understanding.', $locale)."\n\n";

        $internal_id = $this->meta_setting->meta_fb_page_id;
        $token = $this->meta_setting->meta_fb_page_access_token;

        foreach ($this->meta_contacts as $contact) {
            $meta_service->sendMessageViaMeta(
                $contact->platform,
                $token,
                $internal_id,
                $contact->platform_user_id,
                $message
            );
        }
    }
}
