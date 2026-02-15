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
use Str;

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
        $locale = $this->user->language_locale ?? 'en';
        $currency = $this->currency->name ?? 'USD';

        $message = Trans::get('Hello', $locale)." {$this->user->name},\n\n";

        $message .= Trans::get('Your order', $locale)." #{$this->order->order_no} ".Trans::get('was created but we didn’t receive the payment within the allowed time window.', $locale)." \n\n";

        $message .= Trans::get('As a result, the order has now expired automatically. No funds have been deducted from your wallet.', $locale)."\n\n";

        $message .= '📦 '.Trans::get('Order Details', $locale).":\n";

        $message .= Trans::get('Order Number', $locale).": {$this->order->order_no}\n";

        $message .= Trans::get('Remaining Amount', $locale).': '.number_format($this->order->amount, 2).' '.($currency)."\n";

        $message .= Trans::get('Full Amount', $locale).': '.number_format($this->order->full_amount, 2).' '.($currency)."\n";

        $message .= Trans::get('Payment Method', $locale).': '.Trans::get(Str::of($this->order->payment_method)->replace('_', ' ')->title(), $locale)."\n\n";

        $message .= Trans::get('If you still wish to complete your purchase, you can simply place the order again or choose another payment method below.', $locale)."\n\n";

        $message .= Trans::get('Place a New Order', $locale).': '.route('home')."\n\n";

        $message .= Trans::get('We’ve released the reserved items back into stock so they remain available for purchase.', $locale)."\n\n";

        $message .= Trans::get('Thank you for your understanding, we’re here if you have any questions or need assistance.', $locale);

        $internal_id = $this->meta_setting->meta_fb_page_id;
        $token = $this->meta_setting->meta_fb_page_access_token;

        foreach ($this->meta_contacts as $contact) {
            $platform = $contact->platform;
            $meta_service->sendMessageViaMeta($platform, $token, $internal_id, $contact->platform_user_id, $message);
        }
    }
}
