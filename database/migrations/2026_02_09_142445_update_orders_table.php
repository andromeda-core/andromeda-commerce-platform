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
                'canceled',
                'blockchain_confirmation_pending',
                'refund_requested',
                'refund_approved',
                'refund_rejected',
                'refund_completed',

            ])->default('pending')->change();

            $table->string('previous_status')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
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
                'refund_requested',
                'refund_approved',
                'refund_rejected',
                'refund_completed',

            ])->default('pending')->change();

            $table->dropColumn(['previous_status']);
        });
    }
};
