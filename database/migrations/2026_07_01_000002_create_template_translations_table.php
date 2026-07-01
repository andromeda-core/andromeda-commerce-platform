<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Isolated (NON-polymorphic) translations table for the Templates module.
     * Deliberately separate from content_translations so the existing System-1
     * translation stack (Posts / Smartphones / Lodging) is never touched or shared.
     */
    public function up(): void
    {
        Schema::create('template_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('templates')->cascadeOnDelete();
            $table->foreignId('language_id')->constrained('languages')->cascadeOnDelete();
            $table->string('field', 191);              // content (title stays a plain, non-translated label)
            $table->longText('value')->nullable();     // translated raw HTML
            $table->timestamps();

            $table->unique(['template_id', 'language_id', 'field'], 'template_translations_unique');
            $table->index(['template_id', 'language_id'], 'template_translations_lookup');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('template_translations');
    }
};
