<?php

use App\Models\Role;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Operator manages their own properties: full CRUD on Lodging Products.
        $operatorRole = Role::where('name', 'Accommodation Operator')->first();
        if (! empty($operatorRole)) {
            $operatorRole->givePermissionTo([
                'Lodging Products View',
                'Lodging Products Create',
                'Lodging Products Edit',
                'Lodging Products Delete',
            ]);
        }

        // Distributor is view-only in this phase — per-property edit rights are a later,
        // more granular "owner grants permission" feature, not part of Phase 2.
        $distributorRole = Role::where('name', 'Accommodation Distributor')->first();
        if (! empty($distributorRole)) {
            $distributorRole->givePermissionTo(['Lodging Products View']);
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
                'Lodging Products View',
                'Lodging Products Create',
                'Lodging Products Edit',
                'Lodging Products Delete',
            ]);
        }

        $distributorRole = Role::where('name', 'Accommodation Distributor')->first();
        if (! empty($distributorRole)) {
            $distributorRole->revokePermissionTo(['Lodging Products View']);
        }

        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
