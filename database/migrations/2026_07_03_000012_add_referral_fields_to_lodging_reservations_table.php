<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Phase 4 — referral code on accommodation reservations. Correctly spelled `referral_code`
     * (the phone side's `referal_code` misspelling is a legacy constraint that does not apply to
     * this new domain). `reward_points_awarded_at` is an explicit idempotency guard for the
     * reward-points award on CONFIRMED — the phone side's Order model has no equivalent guard;
     * this is a deliberate improvement, not a mirror of that gap. Not mass-assignable (set only
     * by the CONFIRMED-trigger code), matching how status/approval fields are handled elsewhere
     * on this model.
     */
    public function up(): void
    {
        Schema::table('lodging_reservations', function (Blueprint $table) {
            $table->foreignId('collaborator_id')->nullable()->after('lodging_rate_plan_id')
                ->constrained('collaborators')->nullOnDelete()->cascadeOnUpdate();
            $table->string('referral_code')->nullable()->after('collaborator_id');
            $table->timestamp('reward_points_awarded_at')->nullable()->after('referral_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lodging_reservations', function (Blueprint $table) {
            $table->dropForeign(['collaborator_id']);
            $table->dropColumn(['collaborator_id', 'referral_code', 'reward_points_awarded_at']);
        });
    }
};
