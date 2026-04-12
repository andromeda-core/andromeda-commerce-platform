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
        Schema::table('collaborators', function (Blueprint $table) {
            $table->text('address')->after('user_id');
            $table->string('bank_account_no')->after('address');
            $table->decimal('point_accumulation_rate', 8, 2)->after('bank_account_no')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('collaborators', function (Blueprint $table) {
            $table->dropColumn(['address', 'bank_account_no', 'point_accumulation_rate']);
        });
    }
};
