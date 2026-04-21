<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attribution_rewards', function (Blueprint $table) {
            $table->id();

            $table->foreignId('order_id')
                ->constrained()
                ->onDelete('cascade');

            $table->foreignId('product_link_id')
                ->constrained('product_links')
                ->onDelete('cascade');

            $table->foreignId('rewarded_to_user_id')
                ->constrained('users')
                ->onDelete('cascade');

            $table->foreignId('smartphone_id')
                ->constrained()
                ->onDelete('cascade');

            // Snapshot at time of order
            $table->enum('calculation_type', ['percentage', 'fixed']);
            $table->decimal('calculation_value', 30, 2);
            $table->decimal('order_amount', 30, 2);
            $table->decimal('reward_amount', 30, 2);

            $table->enum('status', ['accrued', 'released', 'reversed'])
                ->default('accrued');

            $table->timestamp('released_at')->nullable();
            $table->timestamp('reversed_at')->nullable();

            $table->timestamps();

            $table->index('order_id');
            $table->index('rewarded_to_user_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attribution_rewards');
    }
};
