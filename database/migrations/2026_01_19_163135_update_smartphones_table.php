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
            $table->foreignId('floor_id')->nullable()->after('category_id')->constrained('floors')->cascadeOnUpdate()->nullOnDelete();
            $table->json('images')->nullable()->change();
            $table->json('videos')->nullable()->after('images');
            $table->decimal('latitude', 10, 7)->nullable()->after('videos');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            $table->string('location_name')->nullable()->after('longitude');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('smartphones', function (Blueprint $table) {
            $table->dropForeign(['floor_id']);
            $table->json('images')->change();
            $table->dropColumn(['videos', 'latitude', 'longitude', 'location_name', 'floor_id']);
        });
    }
};
