<?php

namespace App\Repositories\InventoryVerification\Repository;

use App\Jobs\UploadInventoryVerificationVideoOnAWSJob;
use App\Models\Inventory;
use App\Models\InventoryVerification;
use App\Repositories\InventoryVerification\Interface\IInventoryVerificationRepository;
use Exception;
use Illuminate\Http\Request;
use Str;

class InventoryVerificationRepository implements IInventoryVerificationRepository
{
    public function __construct(
        private InventoryVerification $inventory_verification,
        private Inventory $inventory,
    ) {}

    public function getAllInventoryVerifications(Request $request)
    {

        $user = $request->user();
        $query = $this->inventory_verification->query();
        if ($user->hasRole('Distributor')) {

            $user->load(['distributor']);

            if ($user->distributor->can_verify_inventory == false) {
                return [];
            }

            $query->where('verified_by_id', $user->id);
        }

        return $query->with(['verifiedBy'])->latest()->paginate(10);

    }

    public function verifyInventory(Request $request, ?string $imei = null)
    {
        try {

            if (empty($imei)) {
                throw new Exception('IMEI Not Found');
            }

            $exists = $this->inventory->where('imei1', $imei)->first();

            if (! empty($exists)) {
                return [
                    'status' => true,
                    'message' => 'Inventory Found',
                    'data' => $exists,
                ];
            } else {
                throw new Exception('Inventory Not Found');
            }

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function storeInventoryVerification(Request $request)
    {
        try {

            $request->validate([
                'inventory_id' => ['required', 'exists:inventories,id'],
                'imei' => ['required', 'string', 'max:255'],
                'verification_video' => ['nullable', 'mimes:mp4,mov,ogg,qt,wmv,webm', 'max:10000'],
            ]);

            $user = $request->user();

            $created = $this->inventory_verification->create([
                'inventory_id' => $request->input('inventory_id'),
                'verified_by_id' => $user->id,
                'imei' => $request->input('imei'),
                'verified_at' => now(),
            ]);

            if (empty($created)) {
                throw new Exception('Something Went Wrong While Creating Verification');
            }

            $video = $request->file('verification_video');
            $originalName = time().uniqid().'-'.Str::random(8).'.'.$video->getClientOriginalExtension();
            $tempPath = $video->storeAs('temp/uploads', $originalName, 'local');

            dispatch(new UploadInventoryVerificationVideoOnAWSJob($created, $tempPath));

            return [
                'status' => true,
                'message' => 'Inventory Verification Created Successfully',
                'data' => $created,
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
