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

class NotifyCustomerOrderExpiredJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private Collection $meta_contacts,
        private Order $order,
        private MetaSetting $meta_setting,
        private User $user,
        private Currency $currency
    ) {}

    public function handle(): void
    {
        $meta_service = new MetaService($this->meta_setting);

        $message = "Hello {$this->user->name},\n\n";

        $message .= "Your order #{$this->order->order_no} was created but we didn’t receive the payment within the allowed time window.\n\n";
        $message .= "As a result, the order has now expired automatically. No funds have been deducted from your wallet.\n\n";

        $message .= "📦 Order Details:\n";
        $message .= "Order Number: {$this->order->order_no}\n";
        $message .= 'Remeaning Amount:'.number_format($this->order->amount, 2).' '.($this->currency->name ?? 'USD')."\n";
        $message .= 'Full Amount:'.number_format($this->order->full_amount, 2).' '.($this->currency->name ?? 'USD')."\n";
        $message .= "Payment Method: {$this->order->payment_method}\n\n";

        $message .= "If you still wish to complete your purchase, you can simply place the order again or choose another payment method below.\n\n";
        $message .= 'Place a New Order: '.route('home')."\n\n";
        $message .= "We’ve released the reserved items back into stock so they remain available for purchase.\n\n";
        $message .= 'Thank you for your understanding, we’re here if you have any questions or need assistance.';

        foreach ($this->meta_contacts as $contact) {
            $platform = $contact->platform;
            $internal_id = $this->meta_setting->meta_fb_page_id;
            $token = $this->meta_setting->meta_fb_page_access_token;
            $meta_service->sendMessageViaMeta($platform, $token, $internal_id, $contact->platform_user_id, $message);
        }
    }
}
