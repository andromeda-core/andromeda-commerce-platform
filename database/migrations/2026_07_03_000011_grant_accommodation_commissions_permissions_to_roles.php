<?php

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Grants only permissions that already exist in the `permissions` table. Guards against a
     * fresh install where `migrate --seed` runs all migrations before DatabaseSeeder/PermissionSeeder
     * populates the table — this migration is then a safe no-op for any not-yet-seeded permission,
     * rather than throwing PermissionDoesNotExist.
     */
    private function grant(?Role $role, array $permissionNames): void
    {
        if (empty($role)) {
            return;
        }

        foreach ($permissionNames as $name) {
            if (Permission::where('name', $name)->exists()) {
                $role->givePermissionTo($name);
            }
        }
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Ledger transparency (Joseph): Operator sees, read-only, the commission rows tied to
        // reservations on their own properties, across all three accommodation ledger types.
        $operatorRole = Role::where('name', 'Accommodation Operator')->first();
        $this->grant($operatorRole, [
            'Accommodation Distributor Commissions View',
            'Accommodation Platform Commissions View',
            'Accommodation Collaborator Commissions View',
        ]);

        // Distributor sees only their own earnings ledger — view-only, no edit/delete.
        $distributorRole = Role::where('name', 'Accommodation Distributor')->first();
        $this->grant($distributorRole, [
            'Accommodation Distributor Commissions View',
        ]);

        $collaboratorRole = Role::where('name', 'Collaborator')->first();
        if (! empty($collaboratorRole)) {
            $this->grant($collaboratorRole, ['Accommodation Collaborator Commissions View']);
        }

        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $operatorRole = Role::where('name', 'Accommodation Operator')->first();
        if (! empty($operatorRole)) {
            $operatorRole->revokePermissionTo([
                'Accommodation Distributor Commissions View',
                'Accommodation Platform Commissions View',
                'Accommodation Collaborator Commissions View',
            ]);
        }

        $distributorRole = Role::where('name', 'Accommodation Distributor')->first();
        if (! empty($distributorRole)) {
            $distributorRole->revokePermissionTo(['Accommodation Distributor Commissions View']);
        }

        $collaboratorRole = Role::where('name', 'Collaborator')->first();
        if (! empty($collaboratorRole)) {
            $collaboratorRole->revokePermissionTo(['Accommodation Collaborator Commissions View']);
        }

        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
