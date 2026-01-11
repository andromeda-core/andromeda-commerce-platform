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

        if (Schema::hasColumn('smartphone_for_sales', 'additional_fee')) {
            Schema::table('smartphone_for_sales', function (Blueprint $table) {
                $table->dropColumn('additional_fee');
            });
        }
        Schema::table('smartphone_for_sales', function (Blueprint $table) {
            $table->foreignId('shipping_fee_id')->nullable()->constrained('additional_fee_lists')->cascadeOnUpdate()->nullOnDelete();
            $table->foreignId('import_tax_id')->nullable()->constrained('additional_fee_lists')->cascadeOnUpdate()->nullOnDelete();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('smartphone_for_sales', function (Blueprint $table) {
            $table->dropForeign(['shipping_fee_id']);
            $table->dropForeign(['import_tax_id']);
            $table->dropColumn(['shipping_fee_id', 'import_tax_id']);
        });
    }
};
