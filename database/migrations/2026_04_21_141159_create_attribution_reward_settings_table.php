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
        Schema::create('attribution_reward_settings', function (Blueprint $table) {
            $table->id();
            $table->enum('calculation_type', ['percentage', 'fixed'])->default('percentage');
            $table->decimal('value', 30, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attribution_reward_settings');
    }
};
