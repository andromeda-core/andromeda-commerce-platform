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
        Schema::create('ad_banners', function (Blueprint $table) {
            $table->id();
            $table->string('public_id')->unique();
            $table->string('name');
            $table->enum('media_type', ['image', 'video']);
            $table->string('original_name')->nullable();
            $table->string('file_name')->nullable();
            $table->string('folder')->nullable();
            $table->string('file_path')->nullable();
            $table->text('file_url')->nullable();
            $table->string('mime_type')->nullable();
            $table->string('extension')->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->enum('upload_status', ['pending', 'completed', 'failed'])->default('pending');
            $table->string('redirect_url');
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ad_banners');
    }
};
