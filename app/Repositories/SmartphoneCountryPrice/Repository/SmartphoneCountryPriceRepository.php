<?php

namespace App\Repositories\SmartphoneCountryPrice\Repository;

use App\Models\SmartphoneCountryPrice;
use App\Models\SmartphoneForSale;
use App\Repositories\SmartphoneCountryPrice\Interface\ISmartphoneCountryPriceRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SmartphoneCountryPriceRepository implements ISmartphoneCountryPriceRepository
{
    public function __construct(
        private SmartphoneCountryPrice $smartphone_country_price,
        private SmartphoneForSale $smartphone_for_sale
    ) {}

    public function getAllSmartphoneCountryPrice(Request $request)
    {
        // ROLLBACK: previous body returned all rows unfiltered:
        // return $this->smartphone_country_price->with(['country', 'selling_info.smartphone.model_name'])->latest()->paginate(10);

        return $this->smartphone_country_price
            ->with(['country', 'selling_info.smartphone.model_name'])
            ->when($request->filled('country_id'), function ($query) use ($request) {
                $query->where('country_id', $request->input('country_id'));
            })
            ->when($request->filled('q'), function ($query) use ($request) {
                $query->whereHas('selling_info.smartphone.model_name', function ($subQ) use ($request) {
                    $subQ->where('name', 'like', '%'.$request->input('q').'%');
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }

    public function getMissingSmartphonesForCountry(string $country_id)
    {
        return $this->smartphone_for_sale
            ->whereDoesntHave('territory_prices', function ($query) use ($country_id) {
                $query->where('country_id', $country_id);
            })
            ->with(['smartphone.model_name'])
            ->get()
            ->map(function ($sale) {
                return [
                    'id' => $sale->id,
                    'name' => $sale->smartphone?->model_name?->name,
                ];
            });
    }

    public function getSingleSmartphoneCountryPrice(?string $id = null)
    {
        return $this->smartphone_country_price->with(['country'])->find($id);
    }

    public function storeSmartphoneCountryPrice(Request $request)
    {

        $validated_req = $request->validate([
            'country_id' => [
                'required',
                'exists:countries,id',
                Rule::unique('smartphone_country_prices')
                    ->where(fn ($q) => $q->where('smartphone_for_sale_id', $request->smartphone_for_sale_id)),
            ],

            'smartphone_for_sale_id' => ['required', 'exists:smartphone_for_sales,id'],
            'price' => ['required', 'numeric', 'min:1'],
        ], [
            'country_id.required' => 'Country Is Required',
            'country_id.exists' => 'The Selected Country Is not Exists',
            'country_id.unique' => 'Selected Country Is Already Exists For The Selected Smartphone Price',

            'smartphone_for_sale_id.required' => 'Smartphone For Sale Is Required',
            'smartphone_for_sale_id.exists' => 'The Selected Smartphone For Sale Is not Exists',
        ]);

        try {

            $created = $this->smartphone_country_price->create($validated_req);

            if (empty($created)) {
                throw new Exception('Something went wrong while creating Smartphone Country Price');
            }

            return [
                'status' => true,
                'message' => 'Smartphone Country Price Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateSmartphoneCountryPrice(Request $request, ?string $id = null)
    {

        $validated_req = $request->validate([
            'country_id' => [
                'required',
                'exists:countries,id',
                Rule::unique('smartphone_country_prices')
                    ->where(fn ($q) => $q->where('smartphone_for_sale_id', $request->smartphone_for_sale_id))
                    ->where(fn ($q) => $q->where('id', '!=', $id)),
            ],

            'smartphone_for_sale_id' => ['required', 'exists:smartphone_for_sales,id'],
            'price' => ['required', 'numeric', 'min:1'],
        ], [
            'country_id.required' => 'Country Is Required',
            'country_id.exists' => 'The Selected Country Is not Exists',
            'country_id.unique' => 'Selected Country Is Already Exists For The Selected Smartphone Price',

            'smartphone_for_sale_id.required' => 'Smartphone For Sale Is Required',
            'smartphone_for_sale_id.exists' => 'The Selected Smartphone For Sale Is not Exists',
        ]);

        try {

            $smartphone_country_price = $this->getSingleSmartphoneCountryPrice($id);

            if (empty($smartphone_country_price)) {
                throw new Exception('Smartphone Country Price not found');
            }

            $updated = $smartphone_country_price->update($validated_req);

            if (! $updated) {
                throw new Exception('Something went wrong while updating Smartphone Country Price');
            }

            return [
                'status' => true,
                'message' => 'Smartphone Country Price Updated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroySmartphoneCountryPrice(?string $id = null)
    {
        try {
            $smartphone_country_price = $this->getSingleSmartphoneCountryPrice($id);

            if (empty($smartphone_country_price)) {
                throw new Exception('Smartphone Country Price not found');
            }

            $deleted = $smartphone_country_price->delete();

            if (! $deleted) {
                throw new Exception('Something went wrong while deleting Smartphone Country Price');
            }

            return [
                'status' => true,
                'message' => 'Smartphone Country Price Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyBySelectionSmartphoneCountryPrice(Request $request)
    {
        try {
            $ids = $request->array('ids');
            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Smartphone Country Price');
            }

            $deleted = $this->smartphone_country_price->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Something Went Wrong While Deleting Smartphone Country Price');
            }

            return [
                'status' => true,
                'message' => 'Smartphone Country Price Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
