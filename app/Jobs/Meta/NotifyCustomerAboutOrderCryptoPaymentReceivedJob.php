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

class NotifyCustomerAboutOrderCryptoPaymentReceivedJob implements ShouldQueue
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

        $message .= "Good news! We’ve successfully received your Crypto Currency payment for Order #{$this->order->order_no}.\n\n";
        $message .= "Your transaction has been fully confirmed on the blockchain, and your order is now officially confirmed in our system.\n\n";

        $message .= "📦 Order Details:\n";
        $message .= "Order Number: {$this->order->order_no}\n";
        $message .= 'Amount Paid:'.number_format($this->order->amount, 2).' '.($this->currency->name ?? 'USD')."\n";
        $message .= "Payment Method: Crypto Currency\n\n";

        $message .= "Our team will now begin preparing your order for dispatch. You can track your order status anytime using the button below.\n\n";
        $message .= 'View Your Order: '.route('website.orders.order-view', $this->order->order_no)."\n\n";
        $message .= "If you have any questions or need assistance, feel free to contact our support team.\n\n";

        foreach ($this->meta_contacts as $contact) {
            $platform = $contact->platform;
            $internal_id = $this->meta_setting->meta_fb_page_id;
            $token = $this->meta_setting->meta_fb_page_access_token;
            $meta_service->sendMessageViaMeta($platform, $token, $internal_id, $contact->platform_user_id, $message);
        }
    }
}
