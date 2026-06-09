<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Stage 2.1: lodging reservation payment. NOWPayments (crypto-only at launch).
     * SEPARATE PARALLEL DOMAIN — NO FK or linkage to orders / payments.
     * MSAP limited to msap_uri + event_id per decision (not the full MSAP set).
     */
    public function up(): void
    {
        Schema::create('lodging_reservation_payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('lodging_reservation_id')
                ->constrained('lodging_reservations')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->enum('status', [
                'created',
                'pending',
                'confirmed',
                'failed',
                'expired',
                'canceled',
            ])->default('created');

            $table->string('method_type')->default('crypto'); // crypto only at launch

            // Standard payment fields (mirror the existing payments table style).
            $table->decimal('amount', 30, 2)->nullable();
            $table->decimal('price_amount', 30, 2)->nullable();
            $table->string('price_currency')->nullable(); // dynamic base, not hardcoded
            $table->string('pay_currency')->nullable();
            $table->string('external_ref')->nullable();
            $table->string('tx_hash')->nullable();

            // NOWPayments
            $table->string('nowpayments_invoice_id')->nullable();
            $table->string('nowpayments_payment_id')->nullable();
            $table->text('nowpayments_payment_url')->nullable();
            $table->string('nowpayments_order_id')->nullable(); // merchant ref string sent to NOWPayments — NOT a local orders FK
            $table->string('nowpayments_payment_status')->nullable();
            $table->timestamp('nowpayments_ipn_received_at')->nullable();

            // Timing
            $table->timestamp('payment_link_created_at')->nullable();
            $table->timestamp('payment_expires_at')->nullable();
            $table->timestamp('payment_confirmed_at')->nullable();
            $table->timestamp('failed_at')->nullable();

            // MSAP (only two, per decision)
            $table->string('msap_uri')->nullable();
            $table->string('event_id')->nullable();

            $table->timestamps();

            // lodging_reservation_id is indexed automatically by its foreign key constraint.
            $table->index('status');
            $table->index('nowpayments_payment_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lodging_reservation_payments');
    }
};
