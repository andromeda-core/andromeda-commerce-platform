<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Owner-controlled per-property distributor management (Joseph's original requirement,
     * deferred from Phase 2). Deliberately NOT added to LodgingProduct's $fillable — set only
     * through the dedicated toggleAccommodationDistributorManagement endpoint, never through the
     * normal create/update mass-assignment path (same defensive reasoning as
     * accommodation_distributor_id in Phase 2).
     */
    public function up(): void
    {
        Schema::table('lodging_products', function (Blueprint $table) {
            $table->boolean('accommodation_distributor_can_manage')->default(false)->after('accommodation_distributor_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lodging_products', function (Blueprint $table) {
            $table->dropColumn('accommodation_distributor_can_manage');
        });
    }
};
