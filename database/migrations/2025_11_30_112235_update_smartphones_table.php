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
        Schema::table('smartphones', function (Blueprint $table) {
            $table->index(['tag', 'id'], 'smartphones_tag_id_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('smartphones', function (Blueprint $table) {
            $table->dropIndex('smartphones_tag_id_index');
        });
    }
};
