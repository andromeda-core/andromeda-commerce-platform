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
            // stay_type: nullable string (option list lives in the repo as STAY_TYPES + Rule::in).
            $table->string('stay_type')->nullable()->after('name');
            $table->integer('minimum_nights')->nullable()->after('is_active');
            $table->integer('maximum_nights')->nullable()->after('minimum_nights');
            $table->string('booking_cutoff_time')->nullable()->after('maximum_nights'); // HH:MM time-of-day
            // Default true preserves current behavior (same-day booking allowed).
            $table->boolean('same_day_booking_allowed')->default(true)->after('booking_cutoff_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lodging_rate_plans', function (Blueprint $table) {
            $table->dropColumn([
                'stay_type',
                'minimum_nights',
                'maximum_nights',
                'booking_cutoff_time',
                'same_day_booking_allowed',
            ]);
        });
    }
};
