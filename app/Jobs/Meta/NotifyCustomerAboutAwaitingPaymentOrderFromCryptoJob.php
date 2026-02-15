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

class NotifyCustomerAboutAwaitingPaymentOrderFromCryptoJob implements ShouldQueue
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
        $currency = $this->currency->name ?? 'USD';

        $message = Trans::get('Hello', $locale)." {$this->user->name},\n\n";

        $message .= Trans::get('Thank you for placing your order with us! Your order', $locale)
          ." #{$this->order->order_no} "
          .Trans::get('has been successfully created and is currently awaiting confirmation on the blockchain.', $locale)
          ."\n\n";

        $message .= Trans::get('Once the payment is verified by the network, your order will be automatically confirmed and processed for dispatch. No further action is required from your side at this time.', $locale)."\n\n";

        $message .= '📦 '.Trans::get('Order Details', $locale)."\n";

        $message .= Trans::get('Order Number', $locale).": {$this->order->order_no}\n";

        $message .= Trans::get('Remaining Amount', $locale).': '.number_format($this->order->amount, 2).' '.($currency)."\n";

        $message .= Trans::get('Full Amount', $locale).': '.number_format($this->order->full_amount, 2).' '.($currency)."\n";

        $message .= Trans::get('Payment Method', $locale).': '.Trans::get('Crypto Payment', $locale)."\n\n";

        $message .= Trans::get('We’ll notify you again as soon as your payment is confirmed and your order moves to the next stage.', $locale)."\n\n";

        $message .= Trans::get('View Your Order', $locale).': '.route('website.orders.order-view', $this->order->order_no)."\n\n";

        $message .= Trans::get('If you have any questions, feel free to contact our support team, we’re happy to help.', $locale);

        $internal_id = $this->meta_setting->meta_fb_page_id;
        $token = $this->meta_setting->meta_fb_page_access_token;

        foreach ($this->meta_contacts as $contact) {
            $platform = $contact->platform;
            $meta_service->sendMessageViaMeta($platform, $token, $internal_id, $contact->platform_user_id, $message);
        }
    }
}
