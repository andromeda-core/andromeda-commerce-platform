<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        if (User::doesntExist()) {
            $user_details = [
                [
                    'name' => 'Abdullah',
                    'email' => 'abdullahsheikhmuhammad21@gmail.com',
                    'password' => bcrypt('12345678'),
                    'phone' => '+923092657113',
                    'is_active' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],

                [
                    'name' => 'Joseph',
                    'email' => 'joseph@gmail.com',
                    'password' => bcrypt('12345678'),
                    'phone' => '+954123513323',
                    'is_active' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ];

            foreach ($user_details as $user_detail) {
                $user = User::create($user_detail);

                if (! empty($user)) {
                    $user->syncRoles('Admin');
                }
            }
        }
    }
}
