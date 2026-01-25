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
        Schema::create('dormancy_settings', function (Blueprint $table) {
            $table->id();
            $table->enum('dormancy_threshold_type', ['minutes', 'hours', 'days', 'years']);
            $table->bigInteger('dormancy_threshold_value');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dormancy_settings');
    }
};
