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
        Schema::table('lodging_products', function (Blueprint $table) {
            // MSAP parity flag. Default false; inert (no UI, no logic wired yet).
            $table->boolean('msap_ready')->default(false)->after('element_bundle');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lodging_products', function (Blueprint $table) {
            $table->dropColumn('msap_ready');
        });
    }
};
