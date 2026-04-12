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

            if (Schema::hasColumn('smartphones', 'model_name') && Schema::hasColumn('smartphones', 'capacity')) {
                $table->dropColumn(['model_name', 'capacity']);
            }

        });

        Schema::table('smartphones', function (Blueprint $table) {
            $table->foreignId('model_name_id')
                ->nullable()
                ->after('color_ids')
                ->constrained('model_names')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('capacity_id')
                ->nullable()
                ->after('model_name_id')
                ->constrained('capacities')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('smartphones', function (Blueprint $table) {
            $table->dropForeign(['model_name_id']);
            $table->dropForeign(['capacity_id']);
            $table->dropColumn(['model_name_id', 'capacity_id']);
        });
    }
};
