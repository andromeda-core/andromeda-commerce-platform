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
        Schema::create('platform_commissions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('order_id')
                ->unique()
                ->constrained('orders')
                ->cascadeOnDelete();

            $table->decimal('commission_rate', 30, 2)->default(0);
            $table->decimal('commission_amount', 30, 2)->default(0);
            $table->enum('payout_method', ['crypto', 'bank_transfer', 'points']);

            $table->decimal('received_amount', 30, 2)->nullable();
            $table->enum('received_method', ['crypto', 'bank_transfer', 'points'])->nullable();
            $table->foreignId('currency_id', 50)->nullable()->constrained('currencies')->nullOnDelete()->cascadeOnUpdate();

            $table->timestamp('recorded_at')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();

            $table->text('note')->nullable();

            $table->timestamps();

            $table->index(['payout_method']);
            $table->index(['received_method']);
            $table->index(['currency_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('platform_commissions');
    }
};
