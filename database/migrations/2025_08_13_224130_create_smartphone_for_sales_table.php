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
        Schema::create('smartphone_for_sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('smartphone_id')->constrained('smartphones')->cascadeOnUpdate()->cascadeOnDelete();
            $table->decimal('selling_price', 30, 2);
            $table->json('additional_fee')->nullable();
            $table->decimal('total_price', 30, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('smartphone_for_sales');
    }
};
