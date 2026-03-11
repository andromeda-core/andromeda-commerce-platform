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
            if (Schema::hasColumn('order_refunds', 'scanned_imei')) {
                $table->dropColumn('scanned_imei');
            }
            $table->string('scanned_code')->nullable()->after('return_Packaging_video');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_refunds', function (Blueprint $table) {
            $table->dropColumn('scanned_code');

            $table->string('scanned_imei')->nullable()->after('return_Packaging_video');
        });
    }
};
