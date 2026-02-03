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
        Schema::table('smartphone_cart_addons', function (Blueprint $table) {
            $table->foreignId('cart_item_id')->after('smartphone_id')->constrained('cart_items')->cascadeOnDelete()->cascadeOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('smartphone_cart_addons', function (Blueprint $table) {
            $table->dropForeign(['cart_item_id']);
            $table->dropColumn('cart_item_id');
        });
    }
};
