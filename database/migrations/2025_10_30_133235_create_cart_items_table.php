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
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('smartphone_id')->nullable()->constrained('smartphones')->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('type');
            $table->integer('quantity')->default(1);
            $table->foreignId('color_id')->nullable()->constrained()->cascadeOnDelete()->cascadeOnUpdate();
            $table->decimal('unit_price', 30, 2)->default(1);
            $table->decimal('total_price', 30, 2)->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
