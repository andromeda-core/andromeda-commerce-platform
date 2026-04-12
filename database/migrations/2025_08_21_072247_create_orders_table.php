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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_no')->nullable();

            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete()->cascadeOnUpdate();

            $table->decimal('amount', 30, 2);
            $table->enum('status', ['pending', 'paid', 'shipped', 'arrived_locally', 'delivered'])->default('pending');

            $table->foreignId('collaborator_id')->nullable()->constrained('collaborators')->nullOnDelete()->cascadeOnUpdate();

            $table->string('courier_company')->nullable();
            $table->timestamp('shipping_date')->nullable();
            $table->string('tracking_no')->nullable();
            $table->string('courier_invoice')->nullable();

            $table->string('payment_proof')->nullable();
            $table->boolean('is_cash_collected')->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
