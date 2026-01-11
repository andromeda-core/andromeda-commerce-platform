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
        Schema::create('smartphone_order_item_addons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('smartphone_id')->constrained('smartphones')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('order_item_id')->constrained('order_items')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('addon_id')->constrained('addons')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('name');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('smartphone_order_item_addons');
    }
};
