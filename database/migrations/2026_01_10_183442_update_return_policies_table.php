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
            $table->json('content')->change();
            $table->string('slug')->after('content');
            $table->foreignId('language_id')->nullable()->after('slug')->constrained('languages')->cascadeOnDelete()->cascadeOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('return_policies', function (Blueprint $table) {
            $table->longText('content')->change();
            $table->dropForeign(['language_id']);
            $table->dropColumn(['slug', 'language_id']);
        });
    }
};
