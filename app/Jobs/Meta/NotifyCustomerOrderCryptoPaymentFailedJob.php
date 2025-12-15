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

class NotifyCustomerOrderCryptoPaymentFailedJob implements ShouldQueue
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

        $message .= " We wanted to let you know that your Crypto Currency payment for Order #{$this->order->order_no} was not completed.\n\n";
        $message .= "The transaction either failed or expired before the blockchain confirmation was received. No funds have been deducted from your account.\n\n";

        $message .= "📦 Order Details:\n";
        $message .= "Order Number: {$this->order->order_no}\n";
        $message .= 'Amount Paid:'.number_format($this->order->amount, 2).' '.($this->currency->name ?? 'USD')."\n";
        $message .= "Payment Method: Crypto Currency\n\n";

        $message .= "If you’d like to try again, you can easily complete your payment or choose a different method below.\n\n";
        $message .= "Your order has been  marked as Failed, but you can re-order anytime using the same items \n\n";

        $message .= 'Place a New Order: '.route('home')."\n\n";
        $message .= "If you believe the payment went through or have any questions, please contact our support team with your transaction details.\n\n";

        foreach ($this->meta_contacts as $contact) {
            $platform = $contact->platform;
            $internal_id = $this->meta_setting->meta_fb_page_id;
            $token = $this->meta_setting->meta_fb_page_access_token;
            $meta_service->sendMessageViaMeta($platform, $token, $internal_id, $contact->platform_user_id, $message);
        }
    }
}
