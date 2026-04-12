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
        Schema::table('smtp_settings', function (Blueprint $table) {
            $table->string('smtp_scheme')->nullable()->change();
            $table->string('smtp_host')->nullable()->change();
            $table->string('smtp_port')->nullable()->change();
            $table->string('smtp_username')->nullable()->change();
            $table->string('smtp_password')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('smtp_settings', function (Blueprint $table) {
           $table->string('smtp_scheme')->nullable(false)->change();
            $table->string('smtp_host')->nullable(false)->change();
            $table->string('smtp_port')->nullable(false)->change();
            $table->string('smtp_username')->nullable(false)->change();
            $table->string('smtp_password')->nullable(false)->change();
        });
    }
};
