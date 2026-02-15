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
        $locale = $this->user->language_locale ?? 'en';
        $currency = $this->currency->name ?? 'USD';

        $message = Trans::get('Hello', $locale)." {$this->user->name},\n\n";

        $message .= Trans::get('We wanted to let you know that your Crypto Currency payment for Order', $locale)." #{$this->order->order_no} ".Trans::get('was not completed.', $locale)."\n\n";

        $message .= Trans::get('The transaction either failed or expired before the blockchain confirmation was received. No funds have been deducted from your account.', $locale)."\n\n";

        $message .= '📦 '.Trans::get('Order Details', $locale).":\n";

        $message .= Trans::get('Order Number', $locale).": {$this->order->order_no}\n";

        $message .= Trans::get('Remaining Amount', $locale).': '.number_format($this->order->amount, 2).' '.($currency)."\n";

        $message .= Trans::get('Full Amount', $locale).': '.number_format($this->order->full_amount, 2).' '.($currency)."\n";

        $message .= Trans::get('Payment Method', $locale).': '.Trans::get('Crypto Payment', $locale)."\n\n";

        $message .= Trans::get('If you’d like to try again, you can easily complete your payment or choose a different method below.', $locale)."\n\n";

        $message .= Trans::get('Your order has been  marked as Failed, but you can re-order anytime using the same items', $locale)."\n\n";

        $message .= Trans::get('Place a New Order', $locale).': '.route('home')."\n\n";

        $message .= Trans::get('If you believe the payment went through or have any questions, please contact our support team with your transaction details.', $locale)."\n\n";

        $internal_id = $this->meta_setting->meta_fb_page_id;
        $token = $this->meta_setting->meta_fb_page_access_token;

        foreach ($this->meta_contacts as $contact) {
            $platform = $contact->platform;
            $meta_service->sendMessageViaMeta($platform, $token, $internal_id, $contact->platform_user_id, $message);
        }
    }
}
