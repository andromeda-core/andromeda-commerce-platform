<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_links', function (Blueprint $table) {
            $table->enum('status', ['active', 'paused', 'revoked'])
                ->default('active')
                ->change();
        });
    }

    public function down(): void
    {
        Schema::table('product_links', function (Blueprint $table) {
            $table->enum('status', ['active', 'paused'])
                ->default('active')
                ->change();
        });
    }
};
