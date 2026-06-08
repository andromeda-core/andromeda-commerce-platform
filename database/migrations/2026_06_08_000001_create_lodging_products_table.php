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
        Schema::create('lodging_products', function (Blueprint $table) {
            $table->id();
            $table->string('public_id')->nullable()->unique(); // will hold lod_<uuid>
            $table->string('property_name');
            $table->enum('property_type', ['hotel', 'bnb', 'guesthouse', 'villa', 'room', 'pension', 'resort', 'motel']);
            $table->string('city_region')->nullable();
            $table->text('location_description')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('location_name')->nullable();
            $table->foreignId('floor_id')->nullable()->constrained('floors')->nullOnDelete()->cascadeOnUpdate();
            $table->string('tag')->nullable();
            $table->longText('content')->nullable();
            $table->string('base_checkin_time')->nullable();
            $table->string('base_checkout_time')->nullable();
            $table->decimal('from_price', 30, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_reservation_closed')->default(false);
            $table->foreignId('assigned_dashboard_user_id')->nullable()->constrained('users')->nullOnDelete()->cascadeOnUpdate();
            $table->string('booking_source')->default('LOCAL_TEMP');
            $table->string('source_of_truth')->default('ECOMMERCE_LOCAL');
            $table->string('sync_status')->default('LOCAL_ONLY');
            $table->string('external_provider')->nullable();
            $table->string('external_listing_id')->nullable();
            $table->string('external_api_render_mode')->nullable();
            $table->json('external_api_payload_snapshot')->nullable();
            $table->string('msap_uri')->nullable();
            $table->string('msap_event_ref')->nullable();
            $table->json('element_bundle')->nullable();
            $table->timestamps();

            $table->index(['tag', 'id']);
            $table->index(['floor_id', 'id']);
            $table->index(['is_active', 'id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lodging_products');
    }
};
