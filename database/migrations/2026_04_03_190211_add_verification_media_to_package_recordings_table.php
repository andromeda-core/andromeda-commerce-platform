<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('package_recordings', function (Blueprint $table) {
            $table->dropColumn('package_video');
            $table->dropColumn('thumbnail_url');

            $table->string('barcode_photo')->nullable()->after('order_id');
            $table->string('screen_recording_video')->nullable()->after('barcode_photo');
            $table->string('scene_video')->nullable()->after('screen_recording_video');
            $table->string('screen_recording_thumbnail')->nullable();
            $table->string('scene_video_thumbnail')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('package_recordings', function (Blueprint $table) {
            $table->dropColumn(['barcode_photo', 'screen_recording_video', 'scene_video', 'screen_recording_thumbnail', 'scene_video_thumbnail']);

            $table->string('package_video');
            $table->string('thumbnail_url');
        });
    }
};
