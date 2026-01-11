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
        Schema::table('additional_fee_lists', function (Blueprint $table) {
            $table->string('category')->nullable()->after('name');
            $table->enum('value_type', ['fixed', 'percentage'])->nullable()->after('category');
            $table->decimal('default_value', 30, 2)->nullable()->after('value_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('additional_fee_lists', function (Blueprint $table) {
            $table->dropColumn(['category', 'value_type', 'default_value']);
        });
    }
};
