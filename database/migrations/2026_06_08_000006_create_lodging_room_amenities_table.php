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
        Schema::create('lodging_room_amenities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lodging_room_id')->constrained('lodging_rooms')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('lodging_amenity_id')->constrained('lodging_amenities')->cascadeOnDelete()->cascadeOnUpdate();
            $table->timestamps();

            // Explicit short name: the auto-generated unique index name would be at MySQL's 64-char limit.
            $table->unique(['lodging_room_id', 'lodging_amenity_id'], 'lodging_room_amenity_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lodging_room_amenities');
    }
};
