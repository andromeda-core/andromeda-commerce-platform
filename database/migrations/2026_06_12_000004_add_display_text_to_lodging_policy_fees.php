<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add an OPTIONAL free-text companion column for each ON-SITE / display-only lodging fee.
 *
 * When a `<fee>_display_text` is set, the customer sees that text verbatim (e.g. "Free",
 * "Pay at property", "10,000 KRW per hour", "Varies by season"); otherwise the existing
 * numeric `<fee>` column is shown comma-formatted. The numeric columns are UNCHANGED.
 *
 * STRICTLY display-only and confined to the 12 on-site fees. The four ONLINE-PAYABLE fees
 * (rate sale_price, service_fee, cleaning_fee, tax_amount) get NO text column, so text can
 * never enter the online_amount calculation / NOWPayments invoice.
 *
 * Additive + reversible. New columns are System-1 translatable (English fallback) via the
 * policy models' $translatableFields.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Check-in policy — early_checkin_fee, late_checkout_fee.
        Schema::table('lodging_checkin_policies', function (Blueprint $table) {
            $table->string('early_checkin_fee_display_text')->nullable()->after('early_checkin_fee');
            $table->string('late_checkout_fee_display_text')->nullable()->after('late_checkout_fee');
        });

        // Parking policy — extra_parking_fee.
        Schema::table('lodging_parking_policies', function (Blueprint $table) {
            $table->string('extra_parking_fee_display_text')->nullable()->after('extra_parking_fee');
        });

        // Cancellation policy — the 9 on-site fees (NOT service_fee / cleaning_fee / tax_amount).
        Schema::table('lodging_cancellation_policies', function (Blueprint $table) {
            $table->string('extra_guest_fee_display_text')->nullable()->after('extra_guest_fee');
            $table->string('child_fee_display_text')->nullable()->after('child_fee');
            $table->string('pet_fee_display_text')->nullable()->after('pet_fee');
            $table->string('extension_fee_display_text')->nullable()->after('extension_fee');
            $table->string('security_deposit_display_text')->nullable()->after('security_deposit');
            $table->string('onsite_payment_amount_display_text')->nullable()->after('onsite_payment_amount');
            $table->string('damage_fee_display_text')->nullable()->after('damage_fee');
            $table->string('minibar_incidental_fee_display_text')->nullable()->after('minibar_incidental_fee');
            $table->string('onsite_tax_display_text')->nullable()->after('onsite_tax');
        });
    }

    public function down(): void
    {
        Schema::table('lodging_checkin_policies', function (Blueprint $table) {
            $table->dropColumn([
                'early_checkin_fee_display_text',
                'late_checkout_fee_display_text',
            ]);
        });

        Schema::table('lodging_parking_policies', function (Blueprint $table) {
            $table->dropColumn('extra_parking_fee_display_text');
        });

        Schema::table('lodging_cancellation_policies', function (Blueprint $table) {
            $table->dropColumn([
                'extra_guest_fee_display_text',
                'child_fee_display_text',
                'pet_fee_display_text',
                'extension_fee_display_text',
                'security_deposit_display_text',
                'onsite_payment_amount_display_text',
                'damage_fee_display_text',
                'minibar_incidental_fee_display_text',
                'onsite_tax_display_text',
            ]);
        });
    }
};
