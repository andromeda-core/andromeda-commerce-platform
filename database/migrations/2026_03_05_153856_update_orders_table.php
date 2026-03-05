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

            $table->boolean('is_delivery_confirmed')->default(false)->after('status');

            $table->timestamp('delivered_at')->nullable()->after('final_attachments');
            $table->timestamp('delivery_confirmed_at')->nullable()->after('delivered_at');

            $table->index(['is_delivery_confirmed', 'delivered_at']);
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['is_delivery_confirmed', 'delivery_confirmed_at', 'delivered_at']);
        });
    }
};
