<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->text('courier_company_address')->nullable()->after('courier_company');
            $table->string('courier_company_postal_code')->nullable()->after('courier_company_address');
            $table->string('courier_company_phone')->nullable()->after('courier_company_postal_code');
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'courier_company_address',
                'courier_company_postal_code',
                'courier_company_phone',
            ]);
        });
    }
};
