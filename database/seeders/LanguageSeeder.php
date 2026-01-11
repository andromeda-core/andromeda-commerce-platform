<?php

namespace Database\Seeders;

use App\Models\Language;
use Illuminate\Database\Seeder;

class LanguageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (Language::where('code', 'en')->exists()) {
            return;
        }
        \DB::table('languages')->insert([
            'id' => 1,
            'name' => 'English',
            'code' => 'en',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
