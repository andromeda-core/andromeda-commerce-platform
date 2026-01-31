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
        Schema::create('unsettled_accounts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('order_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->string('reason');
            $table->json('meta')->nullable();

            $table->enum('status', ['open', 'resolved'])->default('open');

            // Detection & resolution
            $table->timestamp('detected_at');
            $table->timestamp('resolved_at')->nullable();

            $table->boolean('is_system_resolved')->default(false);
            $table->foreignId('resolved_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->longText('note')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unsettled_accounts');
    }
};
