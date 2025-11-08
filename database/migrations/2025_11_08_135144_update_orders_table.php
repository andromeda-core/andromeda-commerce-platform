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
            $table->enum('status', [

                'awaiting_payment',
                'failed',
                'expired',
                'pending',
                'paid',
                'shipped',
                'arrived_locally',
                'delivered',
                'blockchain_confirmation_pending',

            ])->default('pending')->change();

            $table->string('np_id')->nullable()->after('payment_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('status', ['pending', 'paid', 'shipped', 'arrived_locally', 'delivered'])->default('pending')->change();
            $table->dropColumn(['np_id']);
        });
    }
};
