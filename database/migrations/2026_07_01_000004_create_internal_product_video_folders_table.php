<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('internal_product_video_folders', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // NOTE: No rows seeded on purpose. Video folders are created manually by the admin via
        // the inline "New Folder" flow (mirrors the Internal Product Images behaviour) and live
        // in this OWN separate table, independent of the image folders.
    }

    public function down(): void
    {
        Schema::dropIfExists('internal_product_video_folders');
    }
};
