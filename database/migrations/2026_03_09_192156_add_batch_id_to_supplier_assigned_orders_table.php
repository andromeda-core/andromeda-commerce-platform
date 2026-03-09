<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('supplier_assigned_orders', function (Blueprint $table) {
            $table->foreignId('batch_id')
                ->nullable()
                ->after('assigned_by')
                ->constrained('batches')
                ->nullOnDelete();
        });
    }

    public function down()
    {
        Schema::table('supplier_assigned_orders', function (Blueprint $table) {
            $table->dropForeign(['batch_id']);
            $table->dropColumn('batch_id');
        });
    }
};
