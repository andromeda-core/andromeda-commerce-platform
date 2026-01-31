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
        Schema::create('unsettled_account_notification_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('unsettled_account_id')->constrained('unsettled_accounts')->cascadeOnDelete()->cascadeOnUpdate();
            $table->enum('channel', ['email', 'in_app']);
            $table->longText('message');
            $table->boolean('is_system_sent')->default(false);
            $table->foreignId('sent_by')->nullable()->constrained('users')->cascadeOnDelete()->cascadeOnUpdate();
            $table->timestamp('sent_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unsettled_account_notification_logs');
    }
};
