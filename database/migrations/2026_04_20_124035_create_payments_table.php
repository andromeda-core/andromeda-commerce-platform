<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('order_id')
                ->constrained()
                ->onDelete('cascade');

            $table->enum('status', [
                'created',
                'confirmed',
                'finalized',
                'reversed',
                'failed',
                'canceled',
            ])->default('created');

            $table->enum('method_type', [
                'points',
                'bank_transfer',
                'crypto',
            ])->nullable();

            // np_id from NowPayments or any external ref
            $table->string('external_ref')->nullable();
            // crypto tx hash if applicable
            $table->string('tx_hash')->nullable();
            $table->decimal('amount', 30, 2)->nullable();

            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('finalized_at')->nullable();
            $table->timestamp('reversed_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamp('canceled_at')->nullable();

            // future MSAP placeholders
            $table->string('event_id')->nullable();
            $table->string('msap_uri')->nullable();

            $table->timestamps();

            $table->index('order_id');
            $table->index('status');
            $table->index('method_type');
            $table->index('external_ref');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
