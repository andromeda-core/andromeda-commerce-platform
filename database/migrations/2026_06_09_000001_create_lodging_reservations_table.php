<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Stage 2.1: lodging reservation header. SEPARATE PARALLEL DOMAIN.
     * No FK or linkage to orders / order_items / payments.
     */
    public function up(): void
    {
        Schema::create('lodging_reservations', function (Blueprint $table) {
            // Identity
            $table->id();
            $table->string('public_id')->nullable()->unique(); // will hold rsv_<uuid>
            $table->string('reservation_no')->nullable();       // will hold RSV-<id>

            // Links (lodging only — NO order linkage). Only customers perform reservations.
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete()->cascadeOnUpdate();
            $table->foreignId('lodging_product_id')->constrained('lodging_products')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('lodging_room_id')->nullable()->constrained('lodging_rooms')->nullOnDelete()->cascadeOnUpdate();
            $table->foreignId('lodging_rate_plan_id')->nullable()->constrained('lodging_rate_plans')->nullOnDelete()->cascadeOnUpdate();

            // Booking inputs
            $table->date('checkin_date');
            $table->date('checkout_date');
            $table->integer('guest_count');
            $table->text('request_message')->nullable(); // optional message from guest

            // Snapshots at create (freeze name + price so later catalog edits don't change a placed reservation)
            $table->string('property_name_snapshot')->nullable();
            $table->string('room_name_snapshot')->nullable();
            $table->string('rate_plan_name_snapshot')->nullable();
            $table->decimal('price_snapshot', 30, 2)->nullable();  // bookable price at reservation time
            $table->integer('nights')->nullable();                 // derived from dates, stored for clarity
            $table->decimal('online_amount', 30, 2)->nullable();   // computed online-payable total (filled in 2.3)
            $table->string('currency_code')->nullable();           // dynamic base currency, not hardcoded

            // Status lifecycle (Doc 2 sec 4) — full set incl. two reserved-for-future values.
            $table->enum('status', [
                'REQUESTED',
                'HOTEL_REVIEW_PENDING',
                'HOTEL_APPROVED_AWAITING_PAYMENT',
                'PAYMENT_LINK_CREATED',
                'PAYMENT_PENDING',
                'PAYMENT_CONFIRMED',
                'CONFIRMED',
                'HOTEL_REJECTED',
                'PAYMENT_EXPIRED',
                'PAYMENT_FAILED',
                'CANCELLED',
                'COMPLETED',
                'EXPIRED_NO_RESPONSE',
                // reserved for future
                'PAID_AWAITING_HOTEL_CONFIRMATION',
                'REJECTED_REFUND_REQUIRED',
            ])->default('REQUESTED');
            $table->string('previous_status')->nullable();

            // Operator / approval (Doc 2 sec 5)
            $table->string('availability_mode')->default('HOTEL_MANUAL_CONFIRMATION');
            $table->boolean('requires_hotel_approval')->default(true);
            $table->foreignId('assigned_dashboard_user_id')->nullable()->constrained('users')->nullOnDelete()->cascadeOnUpdate(); // reserved, optional at launch
            $table->string('hotel_approval_status')->nullable();   // pending / approved / rejected style
            $table->foreignId('hotel_approved_by')->nullable()->constrained('users')->nullOnDelete()->cascadeOnUpdate();
            $table->timestamp('hotel_approved_at')->nullable();
            $table->string('hotel_rejected_reason')->nullable();
            $table->text('hotel_rejection_note')->nullable();
            $table->text('alternative_room_suggestion')->nullable();
            $table->text('alternative_date_suggestion')->nullable();
            $table->string('payment_timing')->default('AFTER_HOTEL_APPROVAL');
            $table->string('approval_source')->default('DASHBOARD_MANUAL');
            $table->timestamp('approval_expires_at')->nullable();     // approved-but-unpaid window (60 min, enforced in 2.4)
            $table->timestamp('hotel_response_deadline')->nullable(); // operator no-response window (enforced in 2.4)

            // MSAP / future (full set on the reservation header)
            $table->string('booking_source')->default('LOCAL_TEMP');
            $table->string('source_of_truth')->default('ECOMMERCE_LOCAL');
            $table->string('sync_status')->default('LOCAL_ONLY');
            $table->string('external_provider')->nullable();
            $table->string('external_listing_id')->nullable();
            $table->string('external_room_id')->nullable();
            $table->string('external_rate_plan_id')->nullable();
            $table->string('external_booking_id')->nullable();
            $table->string('external_case_id')->nullable();
            $table->string('msap_uri')->nullable();
            $table->string('msap_event_ref')->nullable();
            $table->string('event_id')->nullable();
            $table->json('element_bundle')->nullable();

            $table->timestamps();

            // Indexes for the cron lookups in 2.4.
            // customer_id, lodging_product_id (and the other FK columns) are indexed automatically
            // by their foreign key constraints — no duplicate index added here.
            $table->index('status');
            $table->index('approval_expires_at');
            $table->index('hotel_response_deadline');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lodging_reservations');
    }
};
