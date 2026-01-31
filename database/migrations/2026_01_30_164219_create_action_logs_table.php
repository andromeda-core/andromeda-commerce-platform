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
        Schema::create('action_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('route')->nullable();
            $table->string('path');
            $table->string('ip_address');
            $table->string('user_agent');
            $table->string('device_fingerprint')->nullable();

            $table->index(['user_id', 'created_at']);
            $table->index('ip_address');
            $table->index('device_fingerprint');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('action_logs');
    }
};
