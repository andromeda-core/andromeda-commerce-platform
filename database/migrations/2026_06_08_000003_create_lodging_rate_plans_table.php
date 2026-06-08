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
        Schema::create('lodging_rate_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lodging_room_id')->constrained('lodging_rooms')->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('name');
            $table->decimal('original_price', 30, 2)->nullable();
            $table->decimal('sale_price', 30, 2);
            $table->decimal('discount_rate', 5, 2)->nullable();
            $table->decimal('member_price', 30, 2)->nullable();
            $table->boolean('crypto_supported')->default(true);
            $table->json('payment_methods')->nullable();
            $table->boolean('is_cancellable')->default(true);
            $table->boolean('is_non_refundable')->default(false);
            $table->boolean('breakfast_included')->default(false);
            $table->boolean('free_parking_included')->default(false);
            $table->boolean('early_checkin_included')->default(false);
            $table->boolean('late_checkout_included')->default(false);
            $table->boolean('consecutive_nights_allowed')->default(true);
            $table->integer('remaining_room_count')->nullable();
            $table->boolean('is_bookable')->default(true);
            $table->string('external_rate_plan_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lodging_rate_plans');
    }
};
