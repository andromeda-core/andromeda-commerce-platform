<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('attribution_link_id')
                ->nullable()
                ->after('collaborator_id')
                ->constrained('product_links')
                ->nullOnDelete();

            $table->foreignId('attributed_to_user_id')
                ->nullable()
                ->after('attribution_link_id')
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('attributed_smartphone_id')
                ->nullable()
                ->after('attributed_to_user_id')
                ->constrained('smartphones')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('attribution_link_id');
            $table->dropConstrainedForeignId('attributed_to_user_id');
            $table->dropConstrainedForeignId('attributed_smartphone_id');
        });
    }
};
