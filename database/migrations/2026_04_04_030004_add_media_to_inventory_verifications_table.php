<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_verifications', function (Blueprint $table) {
            $table->renameColumn('video', 'screen_recording_video');

            // add 2 new columns
            $table->string('barcode_photo')->nullable()->after('scanned_code');
            $table->string('scene_video')->nullable()->after('screen_recording_video');
        });
    }

    public function down(): void
    {
        Schema::table('inventory_verifications', function (Blueprint $table) {
            $table->renameColumn('screen_recording_video', 'video');
            $table->dropColumn(['barcode_photo', 'scene_video']);
        });
    }
};
