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
        Schema::create('terms_of_services', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->json('content');
            $table->string('slug');
            $table->string('company_name');
            $table->string('country');
            $table->string('state');
            $table->string('dpo_name');
            $table->string('dpo_email');
            $table->string('dpo_phone');
            $table->longText('dpo_address');
            $table->foreignId('language_id')->nullable()->constrained('languages')->cascadeOnDelete()->cascadeOnUpdate();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('terms_of_services');
    }
};
