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
        Schema::table('lodging_media', function (Blueprint $table) {
            // Plain nullable reference, no FK constraint (loose MSAP-reference style).
            // Inert: reserved for future MSAP wiring; never auto-populated.
            $table->unsignedBigInteger('source_product_id')->nullable()->after('source_post_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lodging_media', function (Blueprint $table) {
            $table->dropColumn('source_product_id');
        });
    }
};
