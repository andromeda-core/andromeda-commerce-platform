<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Make lodging_rooms.max_guests nullable so a room may be saved without a
     * guest cap (null = unlimited guests), mirroring the already-nullable
     * lodging_rate_plans.maximum_nights. Only the NOT NULL constraint is lifted;
     * the integer type and the existing default(1) are preserved, so this is a
     * purely additive change and no existing data is touched.
     */
    public function up(): void
    {
        Schema::table('lodging_rooms', function (Blueprint $table) {
            $table->integer('max_guests')->nullable()->default(1)->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * Restore the original NOT NULL constraint. Any rows persisted with a null
     * max_guests while this migration was applied are first backfilled to the
     * original default (1) so re-applying NOT NULL cannot fail on existing data.
     */
    public function down(): void
    {
        DB::table('lodging_rooms')->whereNull('max_guests')->update(['max_guests' => 1]);

        Schema::table('lodging_rooms', function (Blueprint $table) {
            $table->integer('max_guests')->nullable(false)->default(1)->change();
        });
    }
};
