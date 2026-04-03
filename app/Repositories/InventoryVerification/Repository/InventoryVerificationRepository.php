<?php

namespace App\Repositories\InventoryVerification\Repository;

use App\Jobs\UploadInventoryVerificationVideoOnAWSJob;
use App\Models\Inventory;
use App\Models\InventoryVerification;
use App\Repositories\InventoryVerification\Interface\IInventoryVerificationRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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

    public function verifyInventory(Request $request)
    {
        try {
            $request->validate([
                'code' => ['required', 'string', 'max:255'],
            ]);

            $exists = $this->inventory
                ->where(function ($query) use ($request) {
                    $query->where('imei1', $request->code)
                        ->orWhere('imei2', $request->code)
                        ->orWhere('eid', $request->code)
                        ->orWhere('serial_no', $request->code);
                })->first();

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
                'scanned_code' => ['required', 'string', 'max:255'],
                'barcode_photo' => ['required', 'image', 'mimetypes:image/jpeg,image/png,image/webp', 'max:10240'],
                'screen_recording' => ['required', 'file', 'mimetypes:video/webm,video/mp4,video/quicktime', 'max:10485760'],
                'scene_video' => ['required', 'file', 'mimetypes:video/webm,video/mp4,video/quicktime', 'max:10485760'],
            ]);

            $user = $request->user();

            $created = $this->inventory_verification->create([
                'inventory_id' => $request->input('inventory_id'),
                'verified_by_id' => $user->id,
                'scanned_code' => $request->input('scanned_code'),
                'verified_at' => now(),
            ]);

            if (empty($created)) {
                throw new Exception('Something Went Wrong While Creating Verification');
            }

            // ── Barcode Photo — direct S3 (no compression needed)
            $photo = $request->file('barcode_photo');
            $photoName = 'BPH-'.time().uniqid().'.'.$photo->getClientOriginalExtension();
            $photoPath = Storage::disk('s3')->putFileAs(
                'InventoryVerification/Photos',
                $photo,
                $photoName
            );
            $photoUrl = Storage::disk('s3')->url($photoPath);
            $created->barcode_photo = $photoUrl;
            $created->save();

            // ── Screen Recording
            $screenVideo = $request->file('screen_recording');
            $screenVideoName = 'SCR-'.time().uniqid().'.'.$screenVideo->getClientOriginalExtension();
            $screenTempPath = 'temp/uploads/'.$screenVideoName;
            Storage::disk('local')->put($screenTempPath, file_get_contents($screenVideo->getRealPath()));

            dispatch(new UploadInventoryVerificationVideoOnAWSJob(
                $created,
                $screenTempPath,
                'screen_recording_video'
            ));

            // ── Scene Video
            $sceneVideo = $request->file('scene_video');
            $sceneVideoName = 'SCV-'.time().uniqid().'.'.$sceneVideo->getClientOriginalExtension();
            $sceneTempPath = 'temp/uploads/'.$sceneVideoName;
            Storage::disk('local')->put($sceneTempPath, file_get_contents($sceneVideo->getRealPath()));

            dispatch(new UploadInventoryVerificationVideoOnAWSJob(
                $created,
                $sceneTempPath,
                'scene_video'
            ));

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
