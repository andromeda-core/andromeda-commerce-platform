<?php

namespace App\Jobs\Meta;

use App\Helpers\Trans;
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

        $locale = $this->user->language_locale ?? 'en';
        $currency = $this->currency->name ?? 'USD';

        $message = Trans::get('Hello', $locale)." {$this->user->name},\n\n";

        $message .= Trans::get('Good news! We’ve successfully received your Crypto Currency payment for Order', $locale).
        " #{$this->order->order_no}.\n\n";

        $message .= Trans::get('Your transaction has been fully confirmed on the blockchain, and your order is now officially confirmed in our system.', $locale)."\n\n";

        $message .= '📦 '.Trans::get('Order Details', $locale)." :\n";

        $message .= Trans::get('Order Number', $locale).": {$this->order->order_no}\n";

        $message .= Trans::get('Amount Paid', $locale).': '.number_format($this->order->full_amount, 2).' '.($currency)."\n";

        $message .= Trans::get('Payment Method', $locale).': '.Trans::get('Crypto Payment', $locale)."\n\n";

        $message .= Trans::get('Our team will now begin preparing your order for dispatch. You can track your order status anytime using the button below.', $locale)."\n\n";

        $message .= Trans::get('View Your Order', $locale).': '.route('website.orders.order-view', $this->order->order_no)."\n\n";

        $message .= Trans::get('If you have any questions or need assistance, feel free to contact our support team.', $locale)."\n\n";

        $internal_id = $this->meta_setting->meta_fb_page_id;
        $token = $this->meta_setting->meta_fb_page_access_token;

        foreach ($this->meta_contacts as $contact) {
            $platform = $contact->platform;
            $meta_service->sendMessageViaMeta($platform, $token, $internal_id, $contact->platform_user_id, $message);
        }
    }
}
