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
            if (Schema::hasColumn('users', 'is_deactivated')) {
                $table->dropColumn('is_deactivated');
            }

            if (Schema::hasColumn('users', 'is_active')) {
                $table->dropColumn('is_active');
            }

            $table->timestamp('suspended_at')->nullable()->after('deactivated_at');
            $table->timestamp('under_dispute_at')->nullable()->after('suspended_at');
            $table->timestamp('under_investigation_at')->nullable()->after('under_dispute_at');

            $table->enum('status', ['active', 'deactivated', 'suspended', 'under_dispute', 'under_investigation'])->default('active')->after('dormant_at');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['status', 'suspended_at', 'under_dispute_at', 'under_investigation_at']);
            $table->boolean('is_deactivated')->default(false)->after('password');
            $table->timestamp('deactivated_at')->nullable()->after('is_deactivated');
        });
    }
};
