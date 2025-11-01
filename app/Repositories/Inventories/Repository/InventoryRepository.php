<?php

namespace App\Repositories\Inventories\Repository;

use App\Models\Batch;
use App\Models\Inventory;
use App\Models\Smartphone;
use App\Models\SmartphoneForSale;
use App\Models\StorageLocation;
use App\Repositories\Inventories\Interface\IInventoryRepository;
use Exception;
use Illuminate\Http\Request;

class InventoryRepository implements IInventoryRepository
{
    public function __construct(
        private Inventory $inventory,
        private Batch $batch,
        private StorageLocation $storage_location,
        private Smartphone $smartphone,
        private SmartphoneForSale $smartphone_for_sale
    ) {}

    public function getAllInventory(Request $request)
    {
        $inventories = $this->inventory
            ->with(['batch', 'smartphone', 'smartphone.model_name', 'storage_location'])
            ->when(! empty($request->input('batch_id')), function ($query) use ($request) {
                $query->where('batch_id', $request->input('batch_id'));
            })
            ->when(! empty($request->input('smartphone_id')), function ($query) use ($request) {
                $query->where('smartphone_id', $request->input('smartphone_id'));
            })
            ->when(! empty($request->input('storage_location_id')), function ($query) use ($request) {
                $query->where('storage_location_id', $request->input('storage_location_id'));
            })
            ->when(! empty($request->input('status')), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $inventories;
    }

    public function getSingleInventory(string $id)
    {
        $inventory = $this->inventory
            ->with(['batch', 'smartphone', 'smartphone.model_name', 'storage_location'])
            ->find($id);

        return $inventory;
    }

    public function storeInventory(Request $request)
    {
        $validated_req = $request->validate([
            'smartphone_id' => ['required', 'exists:smartphones,id'],
            'batch_id' => ['required', 'exists:batches,id'],
            'storage_location_id' => ['required', 'exists:storage_locations,id'],
            'imei1' => ['required', 'unique:inventories,imei1'],
            'imei2' => ['nullable', 'unique:inventories,imei2'],
            'eid' => ['nullable', 'unique:inventories,eid'],
            'serial_no' => ['nullable', 'unique:inventories,serial_no'],
        ], [
            'smartphone_id.required' => 'Smartphone Is Required',
            'smartphone_id.exists' => 'Selected Smartphone Is Invalid',
            'batch_id.required' => 'Batch Is Required',
            'batch_id.exists' => 'Selected Batch Is Invalid',
            'storage_location_id.required' => 'Storage Location Is Required',
            'storage_location_id.exists' => 'Selected Storage Location Is Invalid',
        ]);

        try {
            $batch = $this->batch->find($validated_req['batch_id']);
            if (empty($batch)) {
                throw new Exception('Givin Batch ID Is Invalid');
            }

            $already_exists_batch_items = $this->inventory
                ->where('batch_id', $validated_req['batch_id'])
                ->count();

            if ($already_exists_batch_items >= $batch->total_quantity) {
                throw new Exception('This Batch Is Full Please Select Another Batch To Add Inventory Items');
            }

            $created = $this->inventory->create($validated_req);
            if (empty($created)) {
                throw new Exception('Something Went Wrong While Creating Inventory Items');
            }

            return [
                'status' => true,
                'message' => 'Inventory Items Created Successfully',
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateInventory(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'smartphone_id' => ['required', 'exists:smartphones,id'],
            'batch_id' => ['required', 'exists:batches,id'],
            'storage_location_id' => ['required', 'exists:storage_locations,id'],
            'imei1' => ['required', 'unique:inventories,imei1,'.$id],
            'imei2' => ['nullable', 'unique:inventories,imei2,'.$id],
            'eid' => ['nullable', 'unique:inventories,eid,'.$id],
            'serial_no' => ['nullable', 'unique:inventories,serial_no,'.$id],
            'returned_date' => ['nullable', 'date'],
            'status' => ['required', 'in:in_stock,sold,returned,on_hold'],
        ], [
            'smartphone_id.required' => 'Smartphone Is Required',
            'smartphone_id.exists' => 'Selected Smartphone Is Invalid',
            'batch_id.required' => 'Batch Is Required',
            'batch_id.exists' => 'Selected Batch Is Invalid',
            'storage_location_id.required' => 'Storage Location Is Required',
            'storage_location_id.exists' => 'Selected Storage Location Is Invalid',
        ]);

        try {

            $inventory = $this->getSingleInventory($id);
            if (empty($inventory)) {
                throw new Exception('Inventory Not Found');
            }

            $batch = $this->batch->find($validated_req['batch_id']);
            if (empty($batch)) {
                throw new Exception('Givin Batch ID Is Invalid');
            }

            $already_exists_batch_items = $this->inventory
                ->where('batch_id', $validated_req['batch_id'])
                ->whereNot('id', $inventory->id)
                ->count();

            if ($already_exists_batch_items >= $batch->total_quantity) {
                throw new Exception('This Batch Is Full Please Select Another Batch To Add Inventory Items');
            }

            if ($validated_req['status'] === 'returned' && empty($inventory->returned_date)) {
                $validated_req['returned_date'] = now();
            }

            if ($validated_req['status'] !== 'returned' && ! empty($inventory->returned_date)) {
                $validated_req['returned_date'] = null;
            }

            $updated = $inventory->update($validated_req);
            if (! $updated) {
                throw new Exception('Something Went Wrong While Updating Inventory Items');
            }

            return [
                'status' => true,
                'message' => 'Inventory Items Updated Successfully',
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyInventory(string $id)
    {
        try {
            $inventory = $this->getSingleInventory($id);
            if (empty($inventory)) {
                throw new Exception('Inventory Not Found');
            }

            $deleted = $inventory->delete();
            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Inventory Items');
            }

            return [
                'status' => true,
                'message' => 'Inventory Items Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyInventoryBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');
            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Inventory Item');
            }

            $deleted = $this->inventory->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Something Went Wrong While Deleting Inventory Items');
            }

            return [
                'status' => true,
                'message' => 'Inventory Items Deleted Successfully',
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getBatches()
    {
        return $this->batch->all();
    }

    public function getStorageLocations()
    {
        return $this->storage_location->where('is_active', true)->get();
    }

    public function getSmartphones()
    {
        return $this->smartphone->whereNotIn('id', $this->smartphone_for_sale->pluck('smartphone_id'))->with(['model_name'])->get()->map(function ($smartphone) {
            return [
                'id' => $smartphone->id,
                'name' => $smartphone->model_name->name,
            ];
        });
    }

    public function getSmartPhoneByUpc(string $upc)
    {
        try {
            $smartphone = $this->smartphone->with('model_name')->where('upc', $upc)->first();

            if (empty($smartphone)) {
                throw new Exception('Smartphone Not Found From Given UPC/EAN');
            }

            $result = [
                'id' => $smartphone->id,
                'name' => $smartphone->model_name->name,
            ];

            return [
                'status' => true,
                'smartphone' => $result,
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
