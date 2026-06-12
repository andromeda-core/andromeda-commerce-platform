<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Optional floor RANGE for a lodging property (e.g. "1F - 3F"). ADDITIVE:
     *   - floor_id stays the single ANCHOR floor used by feed up/down navigation, the
     *     spatiotemporal modal and existing floor ordering — it is NOT replaced.
     *   - floor_start_id / floor_end_id are nullable FKs to floors that hold the displayable +
     *     searchable range. They share the SAME ordering basis as floor_id (the floors primary
     *     key, which is exactly how GlobalSearch already compares floors via whereBetween).
     * Mirrors the floor_id column definition (nullable, nullOnDelete, cascadeOnUpdate).
     */
    public function up(): void
    {
        Schema::table('lodging_products', function (Blueprint $table) {
            $table->foreignId('floor_start_id')->nullable()->after('floor_id')->constrained('floors')->nullOnDelete()->cascadeOnUpdate();
            $table->foreignId('floor_end_id')->nullable()->after('floor_start_id')->constrained('floors')->nullOnDelete()->cascadeOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lodging_products', function (Blueprint $table) {
            // dropConstrainedForeignId drops the FK constraint and the column together.
            $table->dropConstrainedForeignId('floor_start_id');
            $table->dropConstrainedForeignId('floor_end_id');
        });
    }
};
