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
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('last_activity_at')->nullable()->after('remember_token');
            $table->boolean('is_dormant')->default(false)->after('last_activity_at');
            $table->timestamp('dormant_at')->nullable()->after('is_dormant');
            $table->boolean('is_deactivated')->default(false)->after('dormant_at');
            $table->timestamp('deactivated_at')->nullable()->after('is_deactivated');
            $table->index(
                ['is_dormant', 'last_activity_at'],
                'users_is_dormant_last_activity_at_index'
            );

            $table->index(
                ['is_deactivated', 'deactivated_at'],
                'users_is_deactivated_deactivated_at_index'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_is_dormant_last_activity_at_index');
            $table->dropIndex('users_is_deactivated_deactivated_at_index');
            $table->dropColumn(['last_activity_at', 'is_dormant', 'dormant_at', 'is_deactivated', 'deactivated_at']);
        });
    }
};
