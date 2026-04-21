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
        Schema::create('product_links', function (Blueprint $table) {
            $table->id();
            $table->string('link_public_id', 40)->unique();
            $table->foreignId('smartphone_id')->constrained('smartphones')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('post_id')->nullable()->constrained('posts')->cascadeOnUpdate()->cascadeOnDelete();
            $table->enum('status', ['active', 'paused'])->default('active');
            $table->string('event_id')->nullable();
            $table->string('msap_uri')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_links');
    }
};
