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
        Schema::table('lodging_rooms', function (Blueprint $table) {
            // Operator's custom view type, shown to the customer when view_type === 'other'
            // (instead of the literal word "Other"). System-1 translatable content column.
            $table->string('view_type_other')->nullable()->after('view_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lodging_rooms', function (Blueprint $table) {
            $table->dropColumn('view_type_other');
        });
    }
};
