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
        Schema::table('inventory_verifications', function (Blueprint $table) {
            if (Schema::hasColumn('inventory_verifications', 'imei')) {
                $table->dropColumn('imei');
            }

            $table->string('scanned_code')->nullable()->after('video');
        });
    }

    public function down(): void
    {
        Schema::table('inventory_verifications', function (Blueprint $table) {
            $table->dropColumn('scanned_code');

            $table->string('imei')->nullable()->after('video');
        });
    }
};
