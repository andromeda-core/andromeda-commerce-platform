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
            $table->foreignId('country_id')->nullable()->after('category_id')->constrained('countries')->cascadeOnUpdate()->nullOnDelete();
            $table->foreignId('condition_id')->nullable()->after('country_id')->constrained('conditions')->cascadeOnUpdate()->nullOnDelete();
            $table->integer('delivery_days')->nullable()->after('condition_id');
            $table->foreignId('courier_company_id')->nullable()->after('delivery_days')->constrained('courier_companies')->cascadeOnUpdate()->nullOnDelete();
            $table->foreignId('return_policy_id')->nullable()->after('courier_company_id')->constrained('return_policies')->cascadeOnUpdate()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('smartphones', function (Blueprint $table) {
            $table->dropForeign(['country_id']);
            $table->dropForeign(['condition_id']);
            $table->dropForeign(['courier_company_id']);
            $table->dropForeign(['return_policy_id']);
            $table->dropColumn(['country_id', 'condition_id', 'delivery_days', 'courier_company_id', 'return_policy_id']);
        });
    }
};
