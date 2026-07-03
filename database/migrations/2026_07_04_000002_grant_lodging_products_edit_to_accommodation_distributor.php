<?php

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Guards against granting a not-yet-seeded permission (mirrors the Phase 3 commission-grant
     * migration's helper — reused here rather than reinvented). In this specific case "Lodging
     * Products Edit" already exists (seeded well before Phase 2), so this guard is a no-op safety
     * net, not a functional requirement, but kept for consistency with the established pattern.
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
     *
     * Owner-controlled per-property distributor management. Granting this permission alone does
     * NOT let a Distributor edit anything — it only lets them REACH the edit route; the
     * per-property accommodation_distributor_can_manage toggle (set by the owning Operator/Admin)
     * is a separate, additional gate enforced in LodgingProductController::edit() and
     * LodgingProductRepository::updateLodgingProduct().
     */
    public function up(): void
    {
        $distributorRole = Role::where('name', 'Accommodation Distributor')->first();
        $this->grant($distributorRole, ['Lodging Products Edit']);

        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $distributorRole = Role::where('name', 'Accommodation Distributor')->first();
        if (! empty($distributorRole)) {
            $distributorRole->revokePermissionTo(['Lodging Products Edit']);
        }

        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
