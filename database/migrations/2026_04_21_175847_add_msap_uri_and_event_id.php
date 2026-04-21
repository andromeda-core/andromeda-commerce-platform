<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Smartphones
        Schema::table('smartphones', function (Blueprint $table) {
            $table->string('event_id')->nullable()->after('id');
            $table->string('msap_uri')->nullable()->after('event_id');
        });

        // Posts
        Schema::table('posts', function (Blueprint $table) {
            $table->string('event_id')->nullable()->after('id');
            $table->string('msap_uri')->nullable()->after('event_id');
        });


        // Orders
        Schema::table('orders', function (Blueprint $table) {
            $table->string('event_id')->nullable()->after('id');
            $table->string('msap_uri')->nullable()->after('event_id');
        });
    }

    public function down(): void
    {
        Schema::table('smartphones', function (Blueprint $table) {
            $table->dropColumn(['event_id', 'msap_uri']);
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn(['event_id', 'msap_uri']);
        });



        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['event_id', 'msap_uri']);
        });
    }
};
