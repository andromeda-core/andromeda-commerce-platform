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
        Schema::table('meta_settings', function (Blueprint $table) {
            $table->string('meta_fb_page_id')->nullable()->after('meta_fb_page_username');
            $table->string('meta_ig_account_id')->nullable()->after('meta_ig_username');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('meta_settings', function (Blueprint $table) {
            $table->dropColumn(['meta_fb_page_id', 'meta_ig_account_id']);
        });
    }
};
