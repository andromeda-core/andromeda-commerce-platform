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
            // Split: the existing `large_vehicle_restrictions` stays as the large-vehicle
            // restriction; these add the modified and supercar restrictions separately.
            $table->text('modified_vehicle_restriction')->nullable()->after('large_vehicle_restrictions');
            $table->text('supercar_restriction')->nullable()->after('modified_vehicle_restriction');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lodging_parking_policies', function (Blueprint $table) {
            $table->dropColumn(['modified_vehicle_restriction', 'supercar_restriction']);
        });
    }
};
