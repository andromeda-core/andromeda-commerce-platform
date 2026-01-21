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
            $table->foreignId('shipping_policy_id')->nullable()->after('return_policy_id')->constrained('shipping_policies')->cascadeOnUpdate()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('smartphones', function (Blueprint $table) {
            $table->dropForeign(['shipping_policy_id']);
            $table->dropColumn(['shipping_policy_id']);
        });
    }
};
