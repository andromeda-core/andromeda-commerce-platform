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
        Schema::create('smartphone_country_shippings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('smartphone_for_sale_id')->constrained('smartphone_for_sales')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('country_id')->constrained('countries')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('shipping_fee_id')->nullable()->constrained('additional_fee_lists')->cascadeOnUpdate()->nullOnDelete();
            $table->foreignId('import_tax_id')->nullable()->constrained('additional_fee_lists')->cascadeOnUpdate()->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['smartphone_for_sale_id', 'country_id'], 'smartphone_country_shippings_sale_country_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('smartphone_country_shippings');
    }
};
