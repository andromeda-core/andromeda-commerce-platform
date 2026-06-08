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
        Schema::create('lodging_product_amenities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lodging_product_id')->constrained('lodging_products')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('lodging_amenity_id')->constrained('lodging_amenities')->cascadeOnDelete()->cascadeOnUpdate();
            $table->timestamps();

            // Explicit short name: the auto-generated unique index name would exceed MySQL's 64-char limit.
            $table->unique(['lodging_product_id', 'lodging_amenity_id'], 'lodging_prod_amenity_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lodging_product_amenities');
    }
};
