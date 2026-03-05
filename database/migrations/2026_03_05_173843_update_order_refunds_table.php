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
        Schema::table('order_refunds', function (Blueprint $table) {
            $table->enum('refund_status', ['requested', 'approved', 'rejected', 'completed', 'withdrawn'])->default('requested')->change();
            $table->string('defect_evidence_video')->nullable()->after('refund_reason');
            $table->string('return_packaging_video')->nullable()->after('defect_evidence_video');
            $table->string('scanned_imei')->nullable()->after('return_Packaging_video');
            $table->timestamp('withdrawn_at')->nullable()->after('completed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_refunds', function (Blueprint $table) {
            $table->enum('refund_status', ['requested', 'approved', 'rejected', 'completed'])->default('requested')->change();
            $table->dropColumn(['defect_evidence_video', 'return_packaging_video', 'scanned_imei', 'withdrawn_at']);
        });
    }
};
