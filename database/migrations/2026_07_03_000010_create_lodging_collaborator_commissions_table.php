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
        // Table + model created now (Phase 3) even though row-creation logic is wired in Phase 4
        // once the referral code exists on the reservation — avoids a Phase-4-only migration.
        Schema::create('lodging_collaborator_commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->nullable()->unique()
                ->constrained('lodging_reservations')->nullOnDelete()->cascadeOnUpdate();
            $table->foreignId('collaborator_id')
                ->constrained('collaborators')->cascadeOnDelete()->cascadeOnUpdate();
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
        Schema::dropIfExists('lodging_collaborator_commissions');
    }
};
