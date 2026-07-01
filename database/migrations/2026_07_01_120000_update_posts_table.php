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
        // Per-post banner ad (single post page only): an optional image URL, a
        // clickable redirect URL, and a top|bottom position chosen per post.
        Schema::table('posts', function (Blueprint $table) {
            $table->string('banner_image_url')->nullable()->after('location_name');
            $table->string('banner_redirect_url')->nullable()->after('banner_image_url');
            $table->string('banner_position')->nullable()->after('banner_redirect_url'); // values: top|bottom
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn(['banner_image_url', 'banner_redirect_url', 'banner_position']);
        });
    }
};
