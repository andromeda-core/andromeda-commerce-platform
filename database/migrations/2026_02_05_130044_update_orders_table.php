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
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('points_used', 30, 2)->nullable()->after('amount');
            $table->decimal('full_amount', 30, 2)->nullable()->after('points_used');
            $table->enum('secondary_payment_method', ['crypto', 'bank_transfer'])->nullable()->after('payment_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['points_used', 'full_amount', 'secondary_payment_method']);
        });
    }
};
