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
        Schema::table('lodging_rate_plans', function (Blueprint $table) {
            // Default true so every existing rate plan stays active (behavior preserved).
            $table->boolean('is_active')->default(true)->after('is_bookable');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lodging_rate_plans', function (Blueprint $table) {
            $table->dropColumn('is_active');
        });
    }
};
