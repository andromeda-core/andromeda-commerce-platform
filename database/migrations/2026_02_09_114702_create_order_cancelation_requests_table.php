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
        Schema::create('order_cancelation_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete()->cascadeOnUpdate();
            $table->longText('reason');
            $table->longText('note')->nullable();
            $table->enum('status', ['approved', 'rejected', 'requested'])->default('requested');
            $table->timestamp('requested_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_cancelation_requests');
    }
};
