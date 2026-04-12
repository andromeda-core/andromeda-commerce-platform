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
        Schema::create('supplier_commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete()->cascadeOnUpdate();
            $table->foreignId('supplier_id')->constrained('suppliers')->cascadeOnDelete()->cascadeOnUpdate();
            $table->decimal('commission_rate', 30)->default(0);
            $table->decimal('commission_amount', 30)->default(0);
            $table->enum('status', ['paid', 'unpaid'])->default('unpaid');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supplier_commissions');
    }
};
