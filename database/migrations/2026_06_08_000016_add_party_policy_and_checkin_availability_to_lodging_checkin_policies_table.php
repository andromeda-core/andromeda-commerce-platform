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
        Schema::table('lodging_checkin_policies', function (Blueprint $table) {
            // Split: the existing `noise_party_restriction` stays as the noise policy;
            // `party_policy` holds the party rules separately.
            $table->text('party_policy')->nullable()->after('noise_party_restriction');

            // Check-in availability flags (alongside the existing checkin_method enum).
            // Default false preserves current behavior.
            $table->boolean('front_desk_available')->default(false)->after('checkin_method');
            $table->boolean('self_checkin_available')->default(false)->after('front_desk_available');
            $table->boolean('contactless_checkin_available')->default(false)->after('self_checkin_available');
            $table->boolean('host_meet_checkin_available')->default(false)->after('contactless_checkin_available');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lodging_checkin_policies', function (Blueprint $table) {
            $table->dropColumn([
                'party_policy',
                'front_desk_available',
                'self_checkin_available',
                'contactless_checkin_available',
                'host_meet_checkin_available',
            ]);
        });
    }
};
