<?php

namespace App\Jobs\Meta;

use App\Models\MetaSetting;
use App\Models\Order;
use App\Models\User;
use App\Services\MetaService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Queue\Queueable;

class OrderCancellationRequestSubmittedJob implements ShouldQueue
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
        $message .= "Your order cancellation request has been successfully submitted.\n";
        $message .= "Our team will review your request shortly.\n";
        $message .= "Please wait for confirmation from our side.\n";
        $message .= "Order Number. #{$this->order->order_no}\n\n";
        $message .= 'View Order Details: '
            .route('website.orders.order-view', $this->order->order_no)."\n\n";
        $message .= 'Thank you for your patience.';

        foreach ($this->meta_contacts as $contact) {
            $meta_service->sendMessageViaMeta(
                $contact->platform,
                $this->meta_setting->meta_fb_page_access_token,
                $this->meta_setting->meta_fb_page_id,
                $contact->platform_user_id,
                $message
            );
        }
    }
}
