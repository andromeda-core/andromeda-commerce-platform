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
        Schema::create('batches', function (Blueprint $table) {
            $table->id();
            $table->string('batch_name');
            $table->integer('total_quantity');
            $table->decimal('base_purchase_unit_price', 30, 2);
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete()->cascadeOnUpdate();
            $table->json('extra_costs')->nullable();
            $table->decimal('total_batch_cost', 30, 2);
            $table->decimal('final_unit_price', 30, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batches');
    }
};
