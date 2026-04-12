<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {

        if (! Role::exists()) {
            $description = 'System Defined Roles';
            $roles = [
                ['name' => 'Admin', 'guard_name' => 'web', 'description' => $description, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Customer', 'guard_name' => 'web', 'description' => $description, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Collaborator', 'guard_name' => 'web', 'description' => $description, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Supplier', 'guard_name' => 'web', 'description' => $description, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Distributor', 'guard_name' => 'web', 'description' => $description, 'created_at' => now(), 'updated_at' => now()],
            ];
            Role::insert($roles);
        }
    }
}
