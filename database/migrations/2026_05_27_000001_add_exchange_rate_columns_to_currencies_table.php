<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds display-only local currency conversion columns to the currencies table.
     * USD is the base currency; exchange_rate represents local units per 1 USD.
     * These columns are purely for display purposes and must NOT be used in any
     * pricing, order, reward, commission, or checkout logic.
     */
    public function up(): void
    {
        Schema::table('currencies', function (Blueprint $table) {
            $table->unsignedBigInteger('country_id')
                  ->nullable()
                  ->after('symbol');

            $table->decimal('exchange_rate', 20, 10)
                  ->default(1.0000000000)
                  ->after('country_id');

            $table->string('rate_source')
                  ->nullable()
                  ->after('exchange_rate');

            $table->timestamp('rate_updated_at')
                  ->nullable()
                  ->after('rate_source');

            $table->foreign('country_id')
                  ->references('id')
                  ->on('countries')
                  ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('currencies', function (Blueprint $table) {
            // Drop the foreign key constraint before dropping the column.
            // Laravel auto-names FK constraints as {table}_{column}_foreign.
            $table->dropForeign(['country_id']);

            $table->dropColumn([
                'country_id',
                'exchange_rate',
                'rate_source',
                'rate_updated_at',
            ]);
        });
    }
};
