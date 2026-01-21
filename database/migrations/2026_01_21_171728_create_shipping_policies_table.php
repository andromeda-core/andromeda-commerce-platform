<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipping_policies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->json('content');
            $table->string('slug');
            $table->string('company_name');
            $table->string('country');
            $table->string('dpo_name');
            $table->string('dpo_email');
            $table->string('dpo_phone');
            $table->longText('dpo_address');
            $table->string('state');
            $table->foreignId('language_id')->nullable()->constrained('languages')->cascadeOnDelete()->cascadeOnUpdate();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('shipping_policies');
    }
};
