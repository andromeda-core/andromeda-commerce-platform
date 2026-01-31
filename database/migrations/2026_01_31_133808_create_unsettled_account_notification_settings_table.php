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
        Schema::create('unsettled_account_notification_settings', function (Blueprint $table) {
            $table->id();
            $table->string('reason');
            $table->integer('delay');
            $table->enum('channel', ['in_app', 'email']);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unsettled_account_notification_settings');
    }
};
