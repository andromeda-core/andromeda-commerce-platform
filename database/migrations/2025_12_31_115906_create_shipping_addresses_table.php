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
        Schema::create('shipping_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('country_id')->nullable()->constrained('countries')->nullOnDelete()->cascadeOnUpdate();
            $table->string('name');
            $table->string('phone');
            $table->string('state');
            $table->string('city');
            $table->string('postal_code');
            $table->text('address_line1');
            $table->text('address_line2')->nullable();
            $table->boolean('is_active')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_addresses');
    }
};
