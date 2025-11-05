<?php

namespace App\Repositories\Batches\Repository;

use App\Jobs\DestroyBatchInvoiceonAWS;
use App\Jobs\StoreBatchInvoicesOnAWS;
use App\Jobs\updateBatchInvoiceOnAWS;
use App\Models\Batch;
use App\Models\Inventory;
use App\Models\Supplier;
use App\Repositories\Batches\Interface\IBatchRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Str;

class BatchRepository implements IBatchRepository
{
    public function __construct(
        private Batch $batch,
        private Supplier $supplier,
        private Inventory $inventory
    ) {}

    public function getAllBatches(Request $request)
    {
        $batches = $this->batch
            ->with(['supplier', 'supplier.user'])
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $query->where(function ($subQ) use ($request) {
                    $subQ->where('batch_name', 'like', '%'.$request->input('search').'%')
                        ->orWhereHas('supplier.user', fn ($query) => $query->where('name', 'like', '%'.$request->input('search').'%'));
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $batches;
    }

    public function getSingleBatch(string $id)
    {
        $batch = $this->batch
            ->with(['supplier', 'supplier.user', 'inventory_items', 'inventory_items.smartphone', 'inventory_items.storage_location', 'inventory_items.smartphone.model_name'])
            ->find($id);

        return $batch;
    }

    public function getSingleFormatedBatchForEdit(string $id)
    {
        $batch = $this->batch
            ->with(['inventory_items'])
            ->find($id);

        return $batch;

    }

    public function storeBatch(Request $request)
    {
        $validated_req = $request->validate([
            'batch_name' => ['required', 'string', 'max:255'],
            'vat' => ['required', 'string', 'max:255'],
            'base_purchase_unit_price' => ['required', 'numeric', 'min:1'],
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'extra_costs' => ['nullable', 'array'],
            'inventory_items' => ['required', 'array'],
            'invoices' => ['nullable', 'array', 'max:30'],
        ]);

        $validator = Validator::make($request->all(), [
            'extra_costs.*.cost_type' => ['required', 'string', 'max:255'],
            'extra_costs.*.amount' => ['required', 'numeric', 'min:1'],
            'inventory_items.*.smartphone_id' => ['required', 'exists:smartphones,id'],
            'inventory_items.*.storage_location_id' => ['required', 'exists:storage_locations,id'],
            'inventory_items.*.imei1' => ['required', 'string', 'max:255', 'unique:inventories,imei1'],
            'inventory_items.*.imei2' => ['nullable', 'string', 'max:255', 'unique:inventories,imei2'],
            'inventory_items.*.eid' => ['nullable', 'string', 'max:255', 'unique:inventories,eid'],
            'inventory_items.*.serial_no' => ['nullable', 'string', 'max:255', 'unique:inventories,serial_no'],
            'invoices.*' => ['nullable', 'mimes:jpg,jpeg,png,pdf', 'max:5048'],

        ], [
            'extra_costs.*.cost_type.required' => 'Cost type is required',
            'extra_costs.*.cost_type.max' => 'Cost type Should Not Exceed 255 Characters',
            'extra_costs.*.cost_type.string' => 'Cost type Must Be A String',
            'extra_costs.*.amount.required' => 'Cost amount is required',
            'extra_costs.*.amount.numeric' => 'Cost amount Must Be Numeric',
            'extra_costs.*.amount.min' => 'Cost amount must be at least 1',

            'inventory_items.*.smartphone_id.required' => 'Smartphone ID is required',
            'inventory_items.*.smartphone_id.exists' => 'Smartphone ID does not exist',
            'inventory_items.*.storage_location_id.required' => 'Storage Location ID is required',
            'inventory_items.*.storage_location_id.exists' => 'Storage Location ID does not exist',
            'inventory_items.*.imei1.required' => 'IMEI 1 is required',
            'inventory_items.*.imei1.max' => 'IMEI 1 Should Not Exceed 255 Characters',
            'inventory_items.*.imei1.string' => 'IMEI 1 Must Be A String',
            'inventory_items.*.imei2.max' => 'IMEI 2 Should Not Exceed 255 Characters',
            'inventory_items.*.imei2.string' => 'IMEI 2 Must Be A String',
            'inventory_items.*.eid.max' => 'EID Should Not Exceed 255 Characters',
            'inventory_items.*.eid.string' => 'EID Must Be A String',
            'inventory_items.*.serial_no.max' => 'Serial Number Should Not Exceed 255 Characters',
            'inventory_items.*.serial_no.string' => 'Serial Number Must Be A String',

            'inventory_items.*.serial_no.unique' => 'Serial Number Already Exists',
            'inventory_items.*.imei1.unique' => 'IMEI 1 Already Exists',
            'inventory_items.*.imei2.unique' => 'IMEI 2 Already Exists',
            'inventory_items.*.eid.unique' => 'EID Already Exists',

            'invoices.*.mimes' => 'Only jpg, jpeg, png, pdf files are allowed',
            'invoices.*.max' => 'File size should not exceed 5MB',

        ]);

        if ($validator->fails()) {
            throw ValidationException::withMessages([
                'file_error' => $validator->errors()->first(),
            ]);
        }

        try {
            DB::beginTransaction();
            // checking Duplications

            // Checking For Imei 1
            $imei1s = array_column($validated_req['inventory_items'], 'imei1');
            $duplicate_imei1s = array_filter(array_count_values($imei1s), fn ($count) => $count > 1);

            if (! empty($duplicate_imei1s)) {
                throw new Exception('IMEI 1 cannot be duplicated');
            }

            // Checking For Imei 2
            $imei2s = array_filter(array_column($validated_req['inventory_items'], 'imei2'));
            $duplicate_imei2s = array_filter(array_count_values($imei2s), fn ($count) => $count > 1);

            if (! empty($duplicate_imei2s)) {
                throw new Exception('IMEI 2 cannot be duplicated');
            }

            // Checking For EID
            $eids = array_filter(array_column($validated_req['inventory_items'], 'eid'));
            $duplicate_eids = array_filter(array_count_values($eids), fn ($count) => $count > 1);

            if (! empty($duplicate_eids)) {
                throw new Exception('EID cannot be duplicated');
            }

            // Checking For Serial No
            $serial_nos = array_filter(array_column($validated_req['inventory_items'], 'serial_no'));
            $duplicate_serial_nos = array_filter(array_count_values($serial_nos), fn ($count) => $count > 1);

            if (! empty($duplicate_serial_nos)) {
                throw new Exception('Serial Number cannot be duplicated');
            }

            // Extracting Quantity
            $total_quantity = 0;
            foreach ($validated_req['inventory_items'] as $inventory_item) {
                $total_quantity += 1;
            }
            $validated_req['total_quantity'] = $total_quantity;

            $total_extra_cost = 0;
            if (isset($validated_req['extra_costs'])) {
                foreach ($validated_req['extra_costs'] as $extra_cost) {
                    $total_extra_cost += (float) $extra_cost['amount'];

                }
            }

            $total_batch_cost = (int) $validated_req['total_quantity'] * (float) $validated_req['base_purchase_unit_price'] + $total_extra_cost;
            $final_unit_price = $total_batch_cost / $validated_req['total_quantity'];

            $validated_req['total_batch_cost'] = $total_batch_cost;
            $validated_req['final_unit_price'] = $final_unit_price;

            $batch = $this->batch->create(array_filter($validated_req, function ($value, $key) {
                return ! in_array($key, ['inventory_items', 'invoices']);
            }, ARRAY_FILTER_USE_BOTH));
            if (empty($batch)) {
                throw new Exception('Something Went Wrong While Creating Batch');
            }

            foreach ($validated_req['inventory_items'] as $inventory_item) {
                $created = $this->inventory->create(array_merge($inventory_item, ['batch_id' => $batch->id]));

                if (empty($created)) {
                    throw new Exception('Something Went Wrong While Creating Inventory');
                }
            }

            DB::commit();

            if ($request->hasFile('invoices')) {
                $paths = [];
                foreach ($validated_req['invoices'] as $invoice) {
                    $new_name = time().uniqid().Str::random(10).'.'.$invoice->getClientOriginalExtension();
                    $tempPath = $invoice->storeAs('temp/uploads', $new_name, 'local');
                    $paths[] = $tempPath;
                }

                dispatch(new StoreBatchInvoicesOnAWS(['invoices' => $paths], $batch));
            }

            return [
                'status' => true,
                'message' => 'Batch Created Successfully',
            ];
        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateBatch(Request $request, string $id)
    {

        $validated_req = $request->validate([
            'batch_name' => ['required', 'string', 'max:255'],
            'vat' => ['required', 'string', 'max:255'],
            'base_purchase_unit_price' => ['required', 'numeric', 'min:1'],
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'extra_costs' => ['nullable', 'array'],
            'inventory_items' => ['required', 'array'],
        ]);

        $validator = Validator::make($request->all(), [
            'extra_costs.*.cost_type' => ['required', 'string', 'max:255'],
            'extra_costs.*.amount' => ['required', 'numeric', 'min:1'],
            'inventory_items.*.smartphone_id' => ['required', 'exists:smartphones,id'],
            'inventory_items.*.storage_location_id' => ['required', 'exists:storage_locations,id'],
            'inventory_items.*.imei1' => ['required', 'string', 'max:255'],
            'inventory_items.*.imei2' => ['nullable', 'string', 'max:255'],
            'inventory_items.*.eid' => ['nullable', 'string', 'max:255'],
            'inventory_items.*.serial_no' => ['nullable', 'string', 'max:255'],
        ], [
            'extra_costs.*.cost_type.required' => 'Cost type is required',
            'extra_costs.*.cost_type.max' => 'Cost type Should Not Exceed 255 Characters',
            'extra_costs.*.cost_type.string' => 'Cost type Must Be A String',
            'extra_costs.*.amount.required' => 'Cost amount is required',
            'extra_costs.*.amount.numeric' => 'Cost amount Must Be Numeric',
            'extra_costs.*.amount.min' => 'Cost amount must be at least 1',

            'inventory_items.*.smartphone_id.required' => 'Smartphone ID is required',
            'inventory_items.*.smartphone_id.exists' => 'Smartphone ID does not exist',
            'inventory_items.*.storage_location_id.required' => 'Storage Location ID is required',
            'inventory_items.*.storage_location_id.exists' => 'Storage Location ID does not exist',
            'inventory_items.*.imei1.required' => 'IMEI 1 is required',
            'inventory_items.*.imei1.max' => 'IMEI 1 Should Not Exceed 255 Characters',
            'inventory_items.*.imei1.string' => 'IMEI 1 Must Be A String',
            'inventory_items.*.imei2.max' => 'IMEI 2 Should Not Exceed 255 Characters',
            'inventory_items.*.imei2.string' => 'IMEI 2 Must Be A String',
            'inventory_items.*.eid.max' => 'EID Should Not Exceed 255 Characters',
            'inventory_items.*.eid.string' => 'EID Must Be A String',
            'inventory_items.*.serial_no.max' => 'Serial Number Should Not Exceed 255 Characters',
            'inventory_items.*.serial_no.string' => 'Serial Number Must Be A String',

        ]);

        if ($validator->fails()) {
            throw ValidationException::withMessages([
                'file_error' => $validator->errors()->first(),
            ]);
        }

        $imei1Values = [];
        $imei2Values = [];
        $eidValues = [];
        $serialNoValues = [];

        foreach ($validated_req['inventory_items'] as $index => $item) {
            // Check IMEI1 duplicates in current request
            if (! empty($item['imei1'])) {
                if (in_array($item['imei1'], $imei1Values)) {
                    throw ValidationException::withMessages([
                        'file_error' => "Duplicate IMEI 1 found in your submission: {$item['imei1']}",
                    ]);
                }
                $imei1Values[] = $item['imei1'];
            }

            // Check IMEI2 duplicates in current request
            if (! empty($item['imei2'])) {
                if (in_array($item['imei2'], $imei2Values)) {
                    throw ValidationException::withMessages([
                        'file_error' => "Duplicate IMEI 2 found in your submission: {$item['imei2']}",
                    ]);
                }
                $imei2Values[] = $item['imei2'];
            }

            // Check EID duplicates in current request
            if (! empty($item['eid'])) {
                if (in_array($item['eid'], $eidValues)) {
                    throw ValidationException::withMessages([
                        'file_error' => "Duplicate EID found in your submission: {$item['eid']}",
                    ]);
                }
                $eidValues[] = $item['eid'];
            }

            // Check Serial No duplicates in current request
            if (! empty($item['serial_no'])) {
                if (in_array($item['serial_no'], $serialNoValues)) {
                    throw ValidationException::withMessages([
                        'file_error' => "Duplicate Serial Number found in your submission: {$item['serial_no']}",
                    ]);
                }
                $serialNoValues[] = $item['serial_no'];
            }
        }

        $currentBatchId = $id;
        // Uniqueness Checking Validation In Database
        foreach ($validated_req['inventory_items'] as $index => $item) {
            $itemId = $item['id'] ?? null;

            // Check IMEI1 against database
            if (! empty($item['imei1'])) {
                $query = $this->inventory
                    ->where('imei1', $item['imei1'])
                    ->where('batch_id', '!=', $currentBatchId);

                if ($query->exists()) {
                    throw ValidationException::withMessages([
                        'file_error' => "IMEI 1 '{$item['imei1']}' already exists in database",
                    ]);
                }
            }

            // Check IMEI2 against database
            if (! empty($item['imei2'])) {
                $query = $this->inventory
                    ->where('imei2', $item['imei2'])
                    ->where('batch_id', '!=', $currentBatchId);

                if ($query->exists()) {
                    throw ValidationException::withMessages([
                        'file_error' => "IMEI 2 '{$item['imei2']}' already exists in database",
                    ]);
                }
            }

            // Check EID against database
            if (! empty($item['eid'])) {
                $query = $this->inventory
                    ->where('eid', $item['eid'])
                    ->where('batch_id', '!=', $currentBatchId);

                if ($query->exists()) {
                    throw ValidationException::withMessages([
                        'file_error' => "EID '{$item['eid']}' already exists in database",
                    ]);
                }
            }

            // Check Serial Number against database
            if (! empty($item['serial_no'])) {
                $query = $this->inventory
                    ->where('serial_no', $item['serial_no'])
                    ->where('batch_id', '!=', $currentBatchId);

                if ($query->exists()) {
                    throw ValidationException::withMessages([
                        'file_error' => "Serial Number '{$item['serial_no']}' already exists in database",
                    ]);
                }
            }
        }

        try {
            // dd($validated_req);
            DB::beginTransaction();

            $batch = $this->getSingleBatch($id);

            if (empty($batch)) {
                throw new Exception('Batch Not Found');
            }

            // Extracting Quantity
            $total_quantity = 0;
            foreach ($validated_req['inventory_items'] as $inventory_item) {
                $total_quantity += 1;
            }
            $validated_req['total_quantity'] = $total_quantity;

            $total_extra_cost = 0;
            if (isset($validated_req['extra_costs'])) {
                foreach ($validated_req['extra_costs'] as $extra_cost) {
                    $total_extra_cost += (float) $extra_cost['amount'];

                }
            }

            $total_batch_cost = (int) $validated_req['total_quantity'] * (float) $validated_req['base_purchase_unit_price'] + $total_extra_cost;
            $final_unit_price = $total_batch_cost / $validated_req['total_quantity'];

            $validated_req['total_batch_cost'] = $total_batch_cost;
            $validated_req['final_unit_price'] = $final_unit_price;

            $validated_req = array_filter($validated_req, function ($value, $key) {
                return ! in_array($key, ['invoices']);
            }, ARRAY_FILTER_USE_BOTH);

            if ($request->filled('deleted_invoices')) {
                $deleted = $request->array('deleted_invoices');
                $deleted_invoice_urls = array_map(function ($deletedItem) {
                    return $deletedItem['url'] ?? null;
                }, $deleted);

                dispatch(new DestroyBatchInvoiceonAWS(['invoices' => $deleted_invoice_urls]));

                $oldInvoices = $batch->invoices ?? [];

                $remeaning_invoices = array_filter($oldInvoices, function ($invoice) use ($deleted) {
                    return ! in_array($invoice, $deleted);
                });

                $remaining_invoices_array = array_values($remeaning_invoices);

                $validated_req['invoices'] = $remaining_invoices_array;
            }

            $updated = $batch->update(array_filter($validated_req, function ($value, $key) {
                return ! in_array($key, ['inventory_items']);
            }, ARRAY_FILTER_USE_BOTH));

            if (! $updated) {
                throw new Exception('Something Went Wrong While Updating Batch');
            }

            // Delete all inventory items
            $this->inventory->where('batch_id', $batch->id)->delete();

            // Creating New Inventory Items From The Request Data
            foreach ($validated_req['inventory_items'] as $inventory_item) {
                $this->inventory->create([
                    'batch_id' => $batch->id,
                    'smartphone_id' => $inventory_item['smartphone_id'],
                    'storage_location_id' => $inventory_item['storage_location_id'],
                    'imei1' => $inventory_item['imei1'],
                    'imei2' => $inventory_item['imei2'],
                    'eid' => $inventory_item['eid'],
                    'serial_no' => $inventory_item['serial_no'],
                    'status' => $inventory_item['status'] ?? 'in_stock',
                    'returned_date' => $inventory_item['returned_date'] ?? null,
                ]);
            }

            DB::commit();

            if ($request->hasFile('new_invoices')) {
                $paths = [];

                foreach ($request->file('new_invoices') as $invoice) {
                    $new_name = time().uniqid().'-'.Str::random(10).'.'.$invoice->getClientOriginalExtension();

                    $tempPath = $invoice->storeAs('temp/uploads', $new_name, 'local');

                    $paths[] = $tempPath;
                }

                dispatch(new updateBatchInvoiceOnAWS(['invoices' => $paths], $batch));
            }

            return [
                'status' => true,
                'message' => 'Batch Updated Successfully',
            ];

        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyBatch(string $id)
    {
        try {

            $batch = $this->batch->find($id);

            if (empty($batch)) {
                throw new Exception('Batch Not Found');
            }

            if (! blank($batch->invoice_urls)) {
                dispatch(new DestroyBatchInvoiceonAWS(['invoices' => $batch->invoice_urls]));
            }

            $deleted = $batch->delete();
            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Batch');
            }

            return [
                'status' => true,
                'message' => 'Batch Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyBatchBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');
            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Batch');
            }

            $batches = $this->batch->whereIn('id', $ids)->get();
            if ($batches->isEmpty()) {
                throw new Exception('Given Batch Ids Are incorrect');
            }

            foreach ($batches as $batch) {
                $response = $this->destroyBatch($batch->id);
                if ($response['status'] === false) {
                    throw new Exception($response['message']);
                }
            }

            return [
                'status' => true,
                'message' => 'Batches Deleted Successfully',
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getSuppliers()
    {
        return $this->supplier->whereHas('user', fn ($query) => $query->where('is_active', 1))->with(['user'])->get()->map(function ($supplier) {
            return [
                'id' => $supplier->id,
                'name' => $supplier->user->name,
            ];
        });
    }
}
