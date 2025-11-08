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
        Schema::create('now_payments', function (Blueprint $table) {
            $table->id();
            $table->longText('now_payment_api_key');
            $table->longText('now_payment_public_key');
            $table->string('now_payment_baseurl');
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('now_payments');
    }
};
