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
        Schema::create('lodging_media', function (Blueprint $table) {
            $table->id();
            $table->string('public_id')->nullable()->unique(); // will hold lmd_<uuid>
            $table->foreignId('lodging_product_id')->constrained('lodging_products')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('source_post_id')->nullable()->constrained('posts')->nullOnDelete()->cascadeOnUpdate();
            $table->string('file_path')->nullable();
            $table->text('file_url')->nullable();
            $table->string('file_name')->nullable();
            $table->enum('type', ['image', 'video']);
            $table->text('thumbnail_url')->nullable();
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->enum('upload_status', ['pending', 'completed', 'failed'])->default('pending');
            $table->string('caption')->nullable();
            $table->string('alt_text')->nullable();
            $table->json('hashtags')->nullable();
            $table->string('space_ref')->nullable();
            $table->string('time_ref')->nullable();
            $table->enum('evidence_role', ['marketing', 'room_photo', 'location_guide', 'checkin_guide', 'booking_proof', 'review', 'defect_evidence'])->nullable();
            $table->string('future_payload_ref')->nullable();
            $table->string('visibility')->default('public');
            $table->integer('sort_order')->nullable();
            $table->timestamps();
            // lodging_product_id is indexed automatically by the foreign key constraint.
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lodging_media');
    }
};
