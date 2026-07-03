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
        Schema::create('lodging_distributor_commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->nullable()->unique()
                ->constrained('lodging_reservations')->nullOnDelete()->cascadeOnUpdate();
            // Explicit short constraint name — the auto-generated
            // "lodging_distributor_commissions_accommodation_distributor_id_foreign" is 68 chars,
            // over MySQL's 64-char identifier limit.
            $table->foreignId('accommodation_distributor_id')
                ->constrained('accommodation_distributors', indexName: 'ldc_accommodation_distributor_id_foreign')
                ->cascadeOnDelete()->cascadeOnUpdate();
            // Rate mirrors the settings/individual-rate columns (decimal 5,2); amount mirrors
            // online_amount's own precision (decimal 30,2) so it can never overflow/truncate.
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
        Schema::dropIfExists('lodging_distributor_commissions');
    }
};
