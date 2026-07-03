<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Keyed on the roles table's unique(['name', 'guard_name']) constraint, so this is safe
        // to run against any environment regardless of what IDs are already occupied.
        DB::table('roles')->insertOrIgnore([
            [
                'name' => 'Accommodation Operator',
                'guard_name' => 'web',
                'description' => 'System Defined Roles',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Accommodation Distributor',
                'guard_name' => 'web',
                'description' => 'System Defined Roles',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('roles')->whereIn('name', ['Accommodation Operator', 'Accommodation Distributor'])
            ->where('guard_name', 'web')
            ->delete();

        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
