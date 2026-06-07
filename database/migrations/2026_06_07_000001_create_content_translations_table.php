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
        Schema::create('content_translations', function (Blueprint $table) {
            $table->id();
            $table->string('translatable_type');          // App\Models\Post / App\Models\Smartphone / future LodgingProduct
            $table->unsignedBigInteger('translatable_id');
            $table->foreignId('language_id')->constrained('languages')->cascadeOnDelete();
            $table->string('field', 191);                  // title / content / tag / product_details
            $table->longText('value')->nullable();         // plain text, or JSON string for product_details
            $table->timestamps();

            $table->unique(
                ['translatable_type', 'translatable_id', 'language_id', 'field'],
                'content_translations_unique'
            );
            $table->index(
                ['translatable_type', 'translatable_id', 'language_id'],
                'content_translations_lookup'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('content_translations');
    }
};
