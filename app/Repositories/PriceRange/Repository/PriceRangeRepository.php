<?php

namespace App\Repositories\PriceRange\Repository;

use App\Models\PriceRange;
use App\Repositories\PriceRange\Interface\IPriceRangeRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PriceRangeRepository implements IPriceRangeRepository
{
    public function __construct(
        private PriceRange $priceRange,
    ) {}

    public function getAllPriceRanges(Request $request)
    {
        $priceRanges = $this->priceRange
            ->when(!empty($request->input('search')), function ($query) use ($request) {
                $query->where('value', 'like', '%' . $request->input('search') . '%');
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $priceRanges;
    }

    public function getSinglePriceRange(string $id)
    {
        $priceRange = $this->priceRange->find($id);

        if (empty($priceRange)) {
            return [
                'status' => false,
                'message' => 'Price Range Not Found',
            ];
        }

        return $priceRange;
    }

    public function storePriceRange(Request $request)
    {
        $validated_req = $request->validate([
            'value' => [
                'required',
                'integer',
                'min:0',
                Rule::unique('price_ranges')->where(fn($query) => $query->where('type', $request->input('type'))),
            ],
            'type' => ['required', 'in:less_than,greater_than'],
            'is_active' => ['nullable', 'boolean'],
        ], [
            'value.unique' => 'This Value Already Exists For The Selected Type',
        ]);

        try {

            if ($this->getPriceRangesCount() >= 10) {
                throw new Exception('Maximum Price Ranges Limit Reached. You Cannot Add More Than 10 Price Ranges.');
            }

            DB::beginTransaction();

            $created = $this->priceRange->create($validated_req);

            if (empty($created)) {
                throw new Exception('Something Went Wrong While Creating Price Range');
            }

            DB::commit();

            return [
                'status' => true,
                'message' => 'Price Range Created Successfully',
            ];
        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updatePriceRange(Request $request, string $id)
    {
        $priceRange = $this->priceRange->find($id);

        if (empty($priceRange)) {
            return [
                'status' => false,
                'message' => 'Price Range Not Found',
            ];
        }

        $validated_req = $request->validate([
            'value' => [
                'required',
                'integer',
                'min:0',
                Rule::unique('price_ranges')->where(fn($query) => $query->where('type', $request->input('type')))->ignore($priceRange->id),
            ],
            'type' => ['required', 'in:less_than,greater_than'],
            'is_active' => ['nullable', 'boolean'],
        ], [
            'value.unique' => 'This Value Already Exists For The Selected Type',
        ]);

        try {
            DB::beginTransaction();

            $updated = $priceRange->update($validated_req);

            if (!$updated) {
                throw new Exception('Something Went Wrong While Updating Price Range');
            }

            DB::commit();

            return [
                'status' => true,
                'message' => 'Price Range Updated Successfully',
            ];
        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function togglePriceRangeStatus(string $id)
    {
        try {
            $priceRange = $this->priceRange->find($id);

            if (empty($priceRange)) {
                throw new Exception('Price Range Not Found');
            }

            DB::beginTransaction();

            $updated = $priceRange->update([
                'is_active' => !$priceRange->is_active,
            ]);

            if (!$updated) {
                throw new Exception('Something Went Wrong While Updating Status');
            }

            DB::commit();

            return [
                'status' => true,
                'message' => 'Status Updated Successfully',
            ];
        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyPriceRange(string $id)
    {
        try {
            $priceRange = $this->priceRange->find($id);

            if (empty($priceRange)) {
                throw new Exception('Price Range Not Found');
            }

            DB::beginTransaction();

            $deleted = $priceRange->delete();

            if (!$deleted) {
                throw new Exception('Something Went Wrong While Deleting Price Range');
            }

            DB::commit();

            return [
                'status' => true,
                'message' => 'Price Range Deleted Successfully',
            ];
        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyPriceRangeBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Price Range To Delete');
            }

            DB::beginTransaction();

            foreach ($ids as $id) {
                $response = $this->destroyPriceRange($id);

                if ($response['status'] === false) {
                    throw new Exception($response['message']);
                }
            }

            DB::commit();

            return [
                'status' => true,
                'message' => 'Selected Price Ranges Deleted Successfully',
            ];
        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }


    public function getPriceRangesCount()
    {
        return $this->priceRange::count();
    }
}
