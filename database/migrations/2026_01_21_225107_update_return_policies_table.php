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
        Schema::table('return_policies', function (Blueprint $table) {
            $table->string('company_name')->after('name');
            $table->string('country')->after('company_name');
            $table->string('state')->after('country');
            $table->string('dpo_name')->after('state');
            $table->string('dpo_email')->after('dpo_name');
            $table->string('dpo_phone')->after('dpo_email');
            $table->longText('dpo_address')->after('dpo_phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('return_policies', function (Blueprint $table) {
            $table->dropColumn(['company_name', 'country', 'state', 'dpo_name', 'dpo_email', 'dpo_phone', 'dpo_address']);
        });
    }
};
