<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('internal_product_videos', function (Blueprint $table) {
            $table->id();
            $table->string('public_id')->unique();
            $table->string('original_name');
            $table->string('file_name')->nullable();
            $table->string('folder');
            $table->string('file_path')->nullable();
            $table->text('file_url')->nullable();
            $table->string('mime_type')->nullable();
            $table->string('extension')->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->enum('upload_status', ['pending', 'completed', 'failed'])->default('pending');
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('internal_product_videos');
    }
};
