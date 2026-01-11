<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('translations', function (Blueprint $table) {
            $table->unique(['language_id', 'translation_key_id'], 'translations_unique_lang_key');
        });
    }

    public function down()
    {
        Schema::table('translations', function (Blueprint $table) {
            $table->dropUnique('translations_unique_lang_key');
        });
    }
};
