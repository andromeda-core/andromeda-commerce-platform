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
        Schema::table('lodging_parking_policies', function (Blueprint $table) {
            // Add 'no_parking' for properties with no parking. The existing 4 values are preserved;
            // this is purely additive. parking_type stays nullable (no default), matching the original.
            $table->enum('parking_type', ['onsite', 'underground', 'nearby', 'valet', 'no_parking'])->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lodging_parking_policies', function (Blueprint $table) {
            // Restore the original 4 values (no_parking removed).
            $table->enum('parking_type', ['onsite', 'underground', 'nearby', 'valet'])->nullable()->change();
        });
    }
};
