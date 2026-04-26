<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_refunds', function (Blueprint $table) {
            // Change enum to add new status
            $table->enum('refund_status', [
                'requested',
                'approved',
                'awaiting_return_tracking',
                'rejected',
                'completed',
                'withdrawn',
            ])->default('requested')->change();

            // New columns
            $table->string('return_tracking_image')->nullable()->after('refund_reference');
            $table->timestamp('return_tracking_uploaded_at')->nullable()->after('return_tracking_image');
            $table->timestamp('return_tracking_deadline_at')->nullable()->after('return_tracking_uploaded_at');
            $table->boolean('is_auto_rejected')->default(false)->after('return_tracking_deadline_at');
        });
    }

    public function down(): void
    {
        Schema::table('order_refunds', function (Blueprint $table) {
            $table->enum('refund_status', [
                'requested',
                'approved',
                'rejected',
                'completed',
                'withdrawn',
            ])->default('requested')->change();

            $table->dropColumn([
                'return_tracking_image',
                'return_tracking_uploaded_at',
                'return_tracking_deadline_at',
                'is_auto_rejected',
            ]);
        });
    }
};
