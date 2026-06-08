<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('lodging_cancellation_policies', function (Blueprint $table) {
            $table->id();
            // UNIQUE enforces the 1:1 relationship with lodging_products.
            $table->foreignId('lodging_product_id')->unique()->constrained('lodging_products')->cascadeOnDelete()->cascadeOnUpdate();
            $table->enum('policy_name', ['flexible', 'moderate', 'firm', 'non_refundable', 'custom'])->nullable();
            $table->string('free_cancellation_deadline')->nullable();
            $table->json('refund_schedule')->nullable();
            $table->text('no_show_policy')->nullable();
            $table->text('rejection_refund_policy')->nullable();
            $table->text('non_refundable_reasons')->nullable();
            $table->boolean('requires_admin_confirmation')->default(true);
            $table->decimal('service_fee', 30, 2)->nullable();
            $table->boolean('service_fee_online')->default(false);
            $table->decimal('cleaning_fee', 30, 2)->nullable();
            $table->boolean('cleaning_fee_online')->default(false);
            $table->decimal('tax_amount', 30, 2)->nullable();
            $table->boolean('tax_online')->default(false);
            $table->decimal('extra_guest_fee', 30, 2)->nullable();
            $table->decimal('child_fee', 30, 2)->nullable();
            $table->decimal('pet_fee', 30, 2)->nullable();
            $table->decimal('extension_fee', 30, 2)->nullable();
            $table->decimal('security_deposit', 30, 2)->nullable();
            $table->decimal('onsite_payment_amount', 30, 2)->nullable();
            $table->decimal('damage_fee', 30, 2)->nullable();
            $table->decimal('minibar_incidental_fee', 30, 2)->nullable();
            $table->decimal('onsite_tax', 30, 2)->nullable();
            $table->text('damage_policy')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lodging_cancellation_policies');
    }
};
