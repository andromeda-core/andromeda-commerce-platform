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

        $message = "Hello {$this->user->name},\n\n";
        $message .= "Your order has been placed successfully.\n\n";

        $message .= "📦 Order Details\n";
        $message .= "Order Number: {$this->order->order_no}\n";
        $message .= "Status: Pending\n";
        $message .= 'Remeaning Amount: '.number_format($this->order->amount, 2).' '.($this->currency->name ?? 'USD')."\n\n";
        $message .= 'Full Amount: '.number_format($this->order->full_amount, 2).' '.($this->currency->name ?? 'USD')."\n\n";

        $distributor = $this->order
            ->orderItems[0]
            ->smartphone
            ->category
            ->distributor;

        $message .= "🏦 Bank Transfer Instructions\n";
        $message .= 'Bank Name: '.($distributor->bank_name ?? 'N/A')."\n";
        $message .= 'Account Name: '.($distributor->bank_account_name ?? 'N/A')."\n";
        $message .= 'Account Number: '.($distributor->bank_account_no ?? 'N/A')."\n";
        $message .= 'IBAN: '.($distributor->iban ?? 'N/A')."\n";
        $message .= 'SWIFT Code: '.($distributor->swift_code ?? 'N/A')."\n\n";

        $message .= "Please transfer the total amount to the bank account above and upload your payment proof from the My Orders page.\n\n";
        $message .= "⏳ Payment verification time: 2 to 3 business days\n\n";

        $message .= "View your order:\n";
        $message .= route('website.orders.order-view', $this->order->order_no)."\n\n";

        $message .= 'Thank you for shopping with us. We appreciate your trust!';

        foreach ($this->meta_contacts as $contact) {
            $platform = $contact->platform;
            $internal_id = $this->meta_setting->meta_fb_page_id;
            $token = $this->meta_setting->meta_fb_page_access_token;
            $meta_service->sendMessageViaMeta($platform, $token, $internal_id, $contact->platform_user_id, $message);
        }

    }
}
