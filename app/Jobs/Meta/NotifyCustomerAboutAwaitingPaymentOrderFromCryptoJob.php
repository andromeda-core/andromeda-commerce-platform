<?php

namespace App\Jobs\Meta;

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

        $message = "Hello {$this->user->name},\n\n";

        $message .= "Thank you for placing your order with us! Your order #{$this->order->order_no} has been successfully created and is currently awaiting confirmation on the blockchain.\n\n";
        $message .= "Once the payment is verified by the network, your order will be automatically confirmed and processed for dispatch. No further action is required from your side at this time.\n\n";

        $message .= "📦 Order Details\n";
        $message .= "Order Number: {$this->order->order_no}\n";
        $message .= 'Amount: '.number_format($this->order->amount, 2).' '.($this->order->currency->name ?? 'USD')."\n";
        $message .= "Payment Method: Crypto Payment\n\n";
        $message .= 'We’ll notify you again as soon as your payment is confirmed and your order moves to the next stage.'."\n\n";
        $message .= 'View Your Order: '.route('website.orders.order-view', $this->order->order_no)."\n\n";
        $message .= 'If you have any questions, feel free to contact our support team, we’re happy to help.';

        foreach ($this->meta_contacts as $contact) {
            $platform = $contact->platform;
            $internal_id = $this->meta_setting->meta_fb_page_id;
            $token = $this->meta_setting->meta_fb_page_access_token;
            $meta_service->sendMessageViaMeta($platform, $token, $internal_id, $contact->platform_user_id, $message);
        }
    }
}
