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
        Schema::create('account_risk_signals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('signal_type');
            $table->string('context');
            $table->json('meta');

            $table->enum('status', ['resolved', 'expired', 'open'])->default('open');
            $table->foreignId('resolved_by')->nullable()->constrained('users')->cascadeOnDelete()->cascadeOnUpdate();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('expired_at')->nullable();
            $table->timestamps();

            $table->boolean('is_active')
                ->nullable()
                ->storedAs("
            CASE
                WHEN status = 'open' THEN 1
                ELSE NULL
            END
        ");

            $table->unique(
                ['user_id', 'signal_type', 'is_active'],
                'unique_active_signal_per_user'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('account_risk_signals');
    }
};
