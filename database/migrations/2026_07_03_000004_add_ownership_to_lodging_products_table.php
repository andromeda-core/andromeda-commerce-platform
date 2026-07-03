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
            $table->foreignId('accommodation_operator_id')->nullable()->after('id')
                ->constrained('accommodation_operators')->nullOnDelete()->cascadeOnUpdate();
            $table->foreignId('accommodation_distributor_id')->nullable()->after('accommodation_operator_id')
                ->constrained('accommodation_distributors')->nullOnDelete()->cascadeOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lodging_products', function (Blueprint $table) {
            $table->dropConstrainedForeignId('accommodation_operator_id');
            $table->dropConstrainedForeignId('accommodation_distributor_id');
        });
    }
};
