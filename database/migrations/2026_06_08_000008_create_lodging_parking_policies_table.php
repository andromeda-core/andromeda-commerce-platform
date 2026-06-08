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
        Schema::create('lodging_parking_policies', function (Blueprint $table) {
            $table->id();
            // UNIQUE enforces the 1:1 relationship with lodging_products.
            $table->foreignId('lodging_product_id')->unique()->constrained('lodging_products')->cascadeOnDelete()->cascadeOnUpdate();
            $table->boolean('parking_available')->default(false);
            $table->boolean('parking_free')->default(false);
            $table->integer('spaces_per_room')->nullable();
            $table->enum('parking_type', ['onsite', 'underground', 'nearby', 'valet'])->nullable();
            $table->boolean('pre_registration_required')->default(false);
            $table->string('parking_availability_time')->nullable();
            $table->text('before_checkin_after_checkout')->nullable();
            $table->text('full_lot_policy')->nullable();
            $table->boolean('nearby_parking_available')->default(false);
            $table->boolean('fee_paid_by_guest')->default(false);
            $table->string('vehicle_height_limit')->nullable();
            $table->text('large_vehicle_restrictions')->nullable();
            $table->boolean('ev_charging_available')->default(false);
            $table->boolean('refund_if_no_parking')->default(false);
            $table->decimal('extra_parking_fee', 30, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lodging_parking_policies');
    }
};
