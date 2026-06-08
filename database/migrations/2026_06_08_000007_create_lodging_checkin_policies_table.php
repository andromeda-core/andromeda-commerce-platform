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
        Schema::create('lodging_checkin_policies', function (Blueprint $table) {
            $table->id();
            // UNIQUE enforces the 1:1 relationship with lodging_products.
            $table->foreignId('lodging_product_id')->unique()->constrained('lodging_products')->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('checkin_time')->nullable();
            $table->string('checkout_time')->nullable();
            $table->boolean('early_checkin_available')->default(false);
            $table->decimal('early_checkin_fee', 30, 2)->nullable();
            $table->boolean('late_checkout_available')->default(false);
            $table->decimal('late_checkout_fee', 30, 2)->nullable();
            $table->enum('checkin_method', ['front_desk', 'self_checkin', 'contactless', 'host_meet'])->nullable();
            $table->string('instructions_sent_when')->nullable();
            $table->text('same_day_booking_notice')->nullable();
            $table->text('early_entry_penalty')->nullable();
            $table->text('late_checkout_penalty')->nullable();
            $table->boolean('id_verification_required')->default(false);
            $table->text('minor_policy')->nullable();
            $table->text('mixed_gender_policy')->nullable();
            $table->text('noise_party_restriction')->nullable();
            $table->longText('checkin_instruction_message')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lodging_checkin_policies');
    }
};
