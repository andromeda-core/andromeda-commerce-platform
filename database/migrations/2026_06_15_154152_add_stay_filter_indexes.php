<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lodging_rooms', function (Blueprint $table) {
            // har whereHas('rooms') is column pe join karta hai — sabse critical
            $table->index(['lodging_product_id', 'is_available'], 'lr_product_available_idx');
        });

        Schema::table('lodging_rate_plans', function (Blueprint $table) {
            $table->index(['lodging_room_id', 'sale_price'], 'lrp_room_saleprice_idx');
        });
    }

    public function down(): void
    {
        Schema::table('lodging_rooms', function (Blueprint $table) {
            $table->dropIndex('lr_product_available_idx');
        });
        Schema::table('lodging_rate_plans', function (Blueprint $table) {
            $table->dropIndex('lrp_room_saleprice_idx');
        });
    }
};
