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
            $table->string('meta_fb_app_name')->nullable()->after('meta_app_secret');
            $table->longText('meta_fb_page_access_token')->nullable()->after('meta_fb_app_name');
            $table->string('meta_fb_page_username')->nullable()->after('meta_fb_page_access_token');
            $table->enum('meta_fb_token_type', ['short_lived', 'long_lived'])->default('short_lived')->after('meta_fb_page_username');

            $table->longText('meta_verify_token')->nullable()->after('meta_fb_token_type');

            $table->longText('meta_ig_app_id')->nullable()->after('meta_verify_token');
            $table->longText('meta_ig_app_secret')->nullable()->after('meta_ig_app_id');
            $table->string('meta_ig_app_name')->nullable()->after('meta_ig_app_secret');
            $table->longText('meta_ig_access_token')->nullable()->after('meta_ig_app_name');
            $table->string('meta_ig_username')->nullable()->after('meta_ig_access_token');
            $table->enum('meta_ig_token_type', ['short_lived', 'long_lived'])->default('short_lived')->after('meta_ig_username');

            $table->timestamp('meta_ig_token_expires_at')->nullable()->after('meta_ig_token_type');
            $table->timestamp('meta_fb_token_expires_at')->nullable()->after('meta_ig_token_expires_at');

            $table->renameColumn('meta_app_id', 'meta_fb_app_id');
            $table->renameColumn('meta_app_secret', 'meta_fb_app_secret');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('meta_settings', function (Blueprint $table) {

            $table->renameColumn('meta_fb_app_id', 'meta_app_id');
            $table->renameColumn('meta_fb_app_secret', 'meta_app_secret');

            $table->dropColumn([
                'meta_fb_app_name',
                'meta_fb_page_access_token',
                'meta_fb_page_username',
                'meta_fb_token_type',
                'meta_verify_token',
                'meta_ig_app_id',
                'meta_ig_app_secret',
                'meta_ig_app_name',
                'meta_ig_access_token',
                'meta_ig_username',
                'meta_ig_token_type',
                'meta_ig_token_expires_at',
                'meta_fb_token_expires_at',
            ]);

        });
    }
};
