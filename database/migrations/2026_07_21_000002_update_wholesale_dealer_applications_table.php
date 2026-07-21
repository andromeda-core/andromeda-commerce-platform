<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Schema hardening for wholesale_dealer_applications:
     *  - widen quantity columns INT UNSIGNED -> BIGINT UNSIGNED (fixes SQLSTATE[22003] overflow)
     *  - widen primary_storefront_url VARCHAR(255) -> VARCHAR(500) to match the
     *    controller's max:500 validation (prevents "Data too long" errors)
     * Nullability is preserved per column. year_established is intentionally left
     * as INT UNSIGNED (bounded by min:1800/max:currentYear).
     */
    public function up(): void
    {
        if (! Schema::hasTable('wholesale_dealer_applications')) {
            return;
        }

        // Quantity columns -> BIGINT UNSIGNED (NOT NULL)
        DB::statement('ALTER TABLE `wholesale_dealer_applications` MODIFY `years_selling_smartphones` BIGINT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE `wholesale_dealer_applications` MODIFY `average_monthly_smartphone_sales_last_3_months_units` BIGINT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE `wholesale_dealer_applications` MODIFY `average_monthly_smartphone_purchase_last_3_months_units` BIGINT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE `wholesale_dealer_applications` MODIFY `largest_single_smartphone_purchase_last_12_months_units` BIGINT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE `wholesale_dealer_applications` MODIFY `initial_order_quantity_units` BIGINT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE `wholesale_dealer_applications` MODIFY `expected_monthly_order_volume_units` BIGINT UNSIGNED NOT NULL');

        // Quantity columns -> BIGINT UNSIGNED (NULL)
        DB::statement('ALTER TABLE `wholesale_dealer_applications` MODIFY `number_of_retail_locations` BIGINT UNSIGNED NULL');
        DB::statement('ALTER TABLE `wholesale_dealer_applications` MODIFY `number_of_active_reseller_or_b2b_buyers` BIGINT UNSIGNED NULL');

        // URL column -> VARCHAR(500) (NULL) to match max:500 validation
        DB::statement('ALTER TABLE `wholesale_dealer_applications` MODIFY `primary_storefront_url` VARCHAR(500) NULL');
    }

    /**
     * Revert to original types (same nullability). INT revert is safe only if
     * stored values still fit INT; VARCHAR(255) revert is safe only if no stored
     * URL exceeds 255 chars.
     */
    public function down(): void
    {
        if (! Schema::hasTable('wholesale_dealer_applications')) {
            return;
        }

        DB::statement('ALTER TABLE `wholesale_dealer_applications` MODIFY `years_selling_smartphones` INT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE `wholesale_dealer_applications` MODIFY `average_monthly_smartphone_sales_last_3_months_units` INT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE `wholesale_dealer_applications` MODIFY `average_monthly_smartphone_purchase_last_3_months_units` INT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE `wholesale_dealer_applications` MODIFY `largest_single_smartphone_purchase_last_12_months_units` INT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE `wholesale_dealer_applications` MODIFY `initial_order_quantity_units` INT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE `wholesale_dealer_applications` MODIFY `expected_monthly_order_volume_units` INT UNSIGNED NOT NULL');

        DB::statement('ALTER TABLE `wholesale_dealer_applications` MODIFY `number_of_retail_locations` INT UNSIGNED NULL');
        DB::statement('ALTER TABLE `wholesale_dealer_applications` MODIFY `number_of_active_reseller_or_b2b_buyers` INT UNSIGNED NULL');

        DB::statement('ALTER TABLE `wholesale_dealer_applications` MODIFY `primary_storefront_url` VARCHAR(255) NULL');
    }
};
