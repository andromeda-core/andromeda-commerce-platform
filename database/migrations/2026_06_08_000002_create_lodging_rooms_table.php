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
        Schema::create('lodging_rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lodging_product_id')->constrained('lodging_products')->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('room_name');
            $table->enum('room_type', ['entire_place', 'private_room', 'shared_room', 'hotel_room']);
            $table->integer('standard_guests')->default(1);
            $table->integer('max_guests')->default(1);
            $table->integer('bedrooms_count')->nullable();
            $table->integer('beds_count')->nullable();
            $table->json('bed_types')->nullable();
            $table->string('bed_size')->nullable();
            $table->integer('bathrooms_count')->nullable();
            $table->integer('toilets_count')->nullable();
            $table->boolean('is_bathroom_private')->default(false);
            $table->boolean('has_jacuzzi')->default(false);
            $table->boolean('has_bathtub')->default(false);
            $table->boolean('has_shower_booth')->default(false);
            $table->enum('view_type', ['ocean', 'harbor', 'city', 'mountain', 'garden', 'other'])->nullable();
            $table->string('room_size')->nullable();
            $table->string('room_floor_label')->nullable();
            $table->boolean('is_smoking_allowed')->default(false);
            $table->boolean('children_allowed')->default(true);
            $table->boolean('pets_allowed')->default(false);
            $table->boolean('is_random_assignment')->default(false);
            $table->integer('remaining_room_count')->nullable();
            $table->boolean('is_available')->default(true);
            $table->string('external_room_id')->nullable();
            $table->timestamps();
            // lodging_product_id is indexed automatically by the foreign key constraint.
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lodging_rooms');
    }
};
