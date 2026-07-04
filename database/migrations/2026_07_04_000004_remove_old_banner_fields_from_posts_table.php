<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Phase 2: the old position-based per-post banner (banner_image_url/banner_redirect_url/
     * banner_position) is fully superseded by the Ad Banner Archive content-embed shortcode
     * system. Drops the 3 now-unused columns.
     */
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn(['banner_image_url', 'banner_redirect_url', 'banner_position']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * NOTE: this restores the COLUMNS only, not the data — any values that existed before
     * up() ran are permanently gone once this migrates. Expected and already flagged.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->string('banner_image_url')->nullable()->after('location_name');
            $table->string('banner_redirect_url')->nullable()->after('banner_image_url');
            $table->string('banner_position')->nullable()->after('banner_redirect_url');
        });
    }
};
