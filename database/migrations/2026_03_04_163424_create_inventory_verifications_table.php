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
        Schema::create('inventory_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('verified_by_id')->constrained('users')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('inventory_id')->constrained('inventories')->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('imei');
            $table->string('video')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_verifications');
    }
};
