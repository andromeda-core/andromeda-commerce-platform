<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('price_ranges', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('value');
            $table->enum('type', ['less_than', 'greater_than']);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['value', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('price_ranges');
    }
};
