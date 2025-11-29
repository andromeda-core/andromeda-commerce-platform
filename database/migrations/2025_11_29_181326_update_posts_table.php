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
        Schema::table('posts', function (Blueprint $table) {
            // Feed performance
            $table->index(['status', 'id'], 'posts_status_id_index');

            // Tags feed
            $table->index(['tag', 'id'], 'posts_tag_id_index');

            // User feed
            $table->index(['user_id', 'id'], 'posts_user_id_index');

            // Floor feed
            $table->index(['floor_id', 'id'], 'posts_floor_id_index');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropIndex('posts_status_id_index');
            $table->dropIndex('posts_tag_id_index');
            $table->dropIndex('posts_user_id_index');
            $table->dropIndex('posts_floor_id_index');
        });
    }
};
