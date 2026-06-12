<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Stage 3.2 — add the canonical URL slug to lodging_products.
     * Mirrors smartphones.slug: nullable + unique. Generated in the model booted() hook
     * (Str::slug(property_name)-id-random) and backfilled for existing rows.
     */
    public function up(): void
    {
        Schema::table('lodging_products', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('public_id');
        });
    }

    public function down(): void
    {
        Schema::table('lodging_products', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
