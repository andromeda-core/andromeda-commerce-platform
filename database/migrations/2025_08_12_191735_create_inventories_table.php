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
        Schema::create('inventories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('smartphone_id')->constrained('smartphones')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('batch_id')->constrained('batches')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('storage_location_id')->nullable()->constrained('storage_locations')->cascadeOnUpdate()->nullOnDelete();

            $table->string('imei1')->unique();
            $table->string('imei2')->nullable()->unique();
            $table->string('eid')->nullable()->unique();
            $table->string('serial_no')->nullable()->unique();
            $table->timestamp('returned_date')->nullable();
            $table->enum('status', ['in_stock', 'sold', 'returned', 'on_hold'])->default('in_stock');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventories');
    }
};
