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
        Schema::create('lodging_platform_commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->nullable()->unique()
                ->constrained('lodging_reservations')->nullOnDelete()->cascadeOnUpdate();
            // Platform commission is not tied to a partner record — no distributor/collaborator FK.
            $table->decimal('commission_rate', 5, 2)->default(0);
            $table->decimal('commission_amount', 30, 2)->default(0);
            $table->enum('status', ['paid', 'unpaid'])->default('unpaid');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lodging_platform_commissions');
    }
};
