<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_refunds', function (Blueprint $table) {
            $table->enum('refund_status', [
                'requested',
                'approved',
                'awaiting_return_tracking',
                'awaiting_returned_item',
                'rejected',
                'completed',
                'withdrawn',
            ])->default('requested')->change();
        });
    }

    public function down(): void
    {
        Schema::table('order_refunds', function (Blueprint $table) {
            $table->enum('refund_status', [
                'requested',
                'approved',
                'awaiting_return_tracking',
                'rejected',
                'completed',
                'withdrawn',
            ])->default('requested')->change();
        });
    }
};
