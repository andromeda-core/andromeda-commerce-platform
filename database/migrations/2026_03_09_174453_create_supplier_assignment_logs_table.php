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
        Schema::create('supplier_assignment_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_assigned_order_id')
                ->constrained('supplier_assigned_orders')
                ->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users');
            $table->text('memo')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_type')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supplier_assignment_logs');
    }
};
