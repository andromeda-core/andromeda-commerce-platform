<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_currency_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')
                ->constrained('orders')
                ->cascadeOnDelete();

            // Base (settlement) currency — always USD per platform design
            $table->string('base_currency', 10)->default('USD');
            $table->decimal('base_amount', 30, 2);

            // Display currency — what the customer saw at checkout
            $table->string('display_currency', 10);
            $table->decimal('display_amount', 30, 2);

            // Exchange rate snapshot at the time of order placement
            $table->decimal('exchange_rate', 20, 10);
            $table->string('rate_source')->nullable();
            $table->timestamp('rate_timestamp')->nullable();

            // Payment currency:
            // - 'bank_transfer', 'points' set at order creation (Phase 1)
            // - 'BTC', 'USDT', etc. set by NOWPaymentInvoiceStatusCheck (Phase 2)
            $table->string('selected_pay_currency', 20)->nullable();

            $table->timestamps();

            $table->index('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_currency_snapshots');
    }
};
