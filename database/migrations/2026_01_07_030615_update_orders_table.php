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
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('sub_total', 30, 2)->default(0);
            $table->decimal('import_tax', 30, 2)->default(0);
            $table->decimal('shipping_fee', 30, 2)->default(0);
            $table->decimal('addons_sub_total', 30, 2)->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['sub_total', 'import_tax', 'shipping_fee', 'addons_sub_total']);
        });
    }
};
