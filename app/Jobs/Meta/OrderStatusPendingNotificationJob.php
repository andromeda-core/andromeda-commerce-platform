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

class OrderStatusPendingNotificationJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private Collection $meta_contacts,
        private Order $order,
        private Currency $currency,
        private MetaSetting $meta_setting,
        private User $user
    ) {}

    public function handle(): void
    {
        $meta_service = new MetaService($this->meta_setting);

        $locale = $this->user->language_locale ?? 'en';
        $currency = $this->currency->name ?? 'USD';

        $message = Trans::get('Hello', $locale)." {$this->user->name},\n\n";

        $message .= Trans::get('Your order has been placed successfully.', $locale)."\n\n";

        $message .= '📦 '.Trans::get('Order Details', $locale)."\n";

        $message .= Trans::get('Order Number', $locale).": {$this->order->order_no}\n";

        $message .= Trans::get('Status', $locale).': '.Trans::get('PENDING', $locale)."\n";

        $message .= Trans::get('Remaining Amount', $locale).': '.number_format($this->order->amount, 2).' '.($currency)."\n\n";

        $message .= Trans::get('Full Amount', $locale).': '.number_format($this->order->full_amount, 2).' '.($currency)."\n\n";

        $distributor = $this->order
            ->orderItems[0]
            ->smartphone
            ->category
            ->distributor;

        $message .= '🏦 '.Trans::get('Bank Transfer Instructions', $locale)."\n";

        $message .= Trans::get('Bank Name', $locale).': '.($distributor->bank_name ?? 'N/A')."\n";

        $message .= Trans::get('Account Name', $locale).': '.($distributor->bank_account_name ?? 'N/A')."\n";

        $message .= Trans::get('Account Number', $locale).': '.($distributor->bank_account_no ?? 'N/A')."\n";

        $message .= Trans::get('IBAN', $locale).': '.($distributor->iban ?? 'N/A')."\n";

        $message .= Trans::get('SWIFT Code', $locale).': '.($distributor->swift_code ?? 'N/A')."\n\n";

        $message .= Trans::get('Please transfer the total amount to the bank account above and upload your payment proof from the My Orders page.', $locale)."\n\n";

        $message .= '⏳ '.Trans::get('Payment verification time: 2 to 3 business days', $locale)."\n\n";

        $message .= Trans::get('View your order', $locale).":\n";

        $message .= route('website.orders.order-view', $this->order->order_no)."\n\n";

        $message .= Trans::get('Thank you for shopping with us. We appreciate your trust!', $locale);

        $internal_id = $this->meta_setting->meta_fb_page_id;
        $token = $this->meta_setting->meta_fb_page_access_token;

        foreach ($this->meta_contacts as $contact) {
            $platform = $contact->platform;
            $meta_service->sendMessageViaMeta($platform, $token, $internal_id, $contact->platform_user_id, $message);
        }

    }
}
