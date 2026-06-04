<?php

namespace App\Repositories\SmartphoneForSales\Repository;

use App\Models\AdditionalFeeList;
use App\Models\SmartphoneForSale;
use App\Repositories\SmartphoneForSales\Interface\ISmartphoneForSaleRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SmartphoneForSaleRepository implements ISmartphoneForSaleRepository
{
    public function __construct(
        private SmartphoneForSale $smartphone_for_sale,
        private AdditionalFeeList $additional_fee_list,
    ) {}

    public function getAllSmartphoneForSales(Request $request)
    {
        $smartphone_for_sales = $this->smartphone_for_sale
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $query->whereHas('smartphone.model_name', function ($subQ) use ($request) {
                    $subQ->where('name', 'like', '%'.$request->input('search').'%');
                });
            })
            ->with(['smartphone', 'smartphone.model_name', 'shipping_fee', 'import_tax'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $smartphone_for_sales;
    }

    public function getSingleSmartphoneForSale(string $id, array $with = [])
    {
        $smartphone_for_sale = $this->smartphone_for_sale->with($with)->find($id);

        return $smartphone_for_sale;
    }

    private function countryShippingValidationRules(): array
    {
        return [
            [
                'country_shippings' => ['nullable', 'array'],
                'country_shippings.*.country_id' => ['required', 'distinct', 'exists:countries,id'],
                'country_shippings.*.shipping_fee_id' => ['nullable', 'exists:additional_fee_lists,id'],
                'country_shippings.*.import_tax_id' => ['nullable', 'exists:additional_fee_lists,id'],
            ],
            [
                'country_shippings.*.country_id.required' => 'Country is required for each country based shipping row',
                'country_shippings.*.country_id.distinct' => 'The same country cannot be added more than once',
                'country_shippings.*.country_id.exists' => 'The selected country is not valid',
            ],
        ];
    }

    public function storeSmartphoneForSale(Request $request)
    {
        [$country_shipping_rules, $country_shipping_messages] = $this->countryShippingValidationRules();

        $validated_req = $request->validate([
            'smartphone_id' => ['required', 'exists:smartphones,id', 'unique:smartphone_for_sales,smartphone_id'],
            'selling_price' => ['required', 'numeric', 'min:1'],
            'shipping_fee_id' => ['nullable', 'exists:additional_fee_lists,id'],
            'import_tax_id' => ['nullable', 'exists:additional_fee_lists,id'],

            ...$country_shipping_rules,

        ], [
            'smartphone_id.required' => 'Smartphone is required',
            'smartphone_id.exists' => 'Smartphone is not valid',
            'smartphone_id.unique' => 'Smartphone is already Exists',

            ...$country_shipping_messages,
        ]);

        try {

            DB::transaction(function () use ($validated_req) {
                $country_shippings = $validated_req['country_shippings'] ?? [];
                unset($validated_req['country_shippings']);

                $total_price = (float) $validated_req['selling_price'];
                $validated_req['total_price'] = $total_price;

                $created = $this->smartphone_for_sale->create($validated_req);
                if (empty($created)) {
                    throw new Exception('Something Went Wrong While Creating Smartphone For Sale');
                }

                foreach ($country_shippings as $row) {
                    $created->countryShippings()->create([
                        'country_id' => $row['country_id'],
                        'shipping_fee_id' => $row['shipping_fee_id'] ?? null,
                        'import_tax_id' => $row['import_tax_id'] ?? null,
                        'is_active' => true,
                    ]);
                }
            });

            return [
                'status' => true,
                'message' => 'Smartphone For Sale Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateSmartphoneForSale(Request $request, string $id)
    {
        [$country_shipping_rules, $country_shipping_messages] = $this->countryShippingValidationRules();

        $validated_req = $request->validate([
            'smartphone_id' => ['required', 'exists:smartphones,id', 'unique:smartphone_for_sales,smartphone_id,'.$id],
            'selling_price' => ['required', 'numeric', 'min:1'],
            'shipping_fee_id' => ['nullable', 'exists:additional_fee_lists,id'],
            'import_tax_id' => ['nullable', 'exists:additional_fee_lists,id'],

            ...$country_shipping_rules,

        ], [
            'smartphone_id.required' => 'Smartphone ID is required',
            'smartphone_id.exists' => 'Smartphone ID is not valid',
            'smartphone_id.unique' => 'Smartphone ID is already used',

            ...$country_shipping_messages,
        ]);

        try {

            $smartphone_for_sale = $this->getSingleSmartphoneForSale($id);

            if (empty($smartphone_for_sale)) {
                throw new Exception('Smartphone For Sale Not Found');
            }

            DB::transaction(function () use ($validated_req, $smartphone_for_sale) {
                $country_shippings = $validated_req['country_shippings'] ?? [];
                unset($validated_req['country_shippings']);

                $total_price = (float) $validated_req['selling_price'];

                if (isset($validated_req['additional_fee'])) {
                    foreach ($validated_req['additional_fee'] as $fee) {
                        $total_price += (float) $fee['amount'];
                    }
                }

                $validated_req['total_price'] = $total_price;

                $updated = $smartphone_for_sale->update($validated_req);
                if (! $updated) {
                    throw new Exception('Something Went Wrong While Updating Smartphone For Sale');
                }

                $smartphone_for_sale->countryShippings()->delete();

                foreach ($country_shippings as $row) {
                    $smartphone_for_sale->countryShippings()->create([
                        'country_id' => $row['country_id'],
                        'shipping_fee_id' => $row['shipping_fee_id'] ?? null,
                        'import_tax_id' => $row['import_tax_id'] ?? null,
                        'is_active' => true,
                    ]);
                }
            });

            return [
                'status' => true,
                'message' => 'Smartphone For Sale Updated Successfully',
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroySmartphoneForSale(string $id)
    {
        try {
            $smartphone_for_sale = $this->getSingleSmartphoneForSale($id);

            if (empty($smartphone_for_sale)) {
                throw new Exception('Smartphone For Sale Not Found');
            }

            $deleted = $smartphone_for_sale->delete();
            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Smartphone For Sale');
            }

            return [
                'status' => true,
                'message' => 'Smartphone For Sale Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroySmartphoneForSaleBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');
            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Smartphone For Sale');
            }

            $deleted = $this->smartphone_for_sale->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Something Went Wrong While Deleting Smartphone For Sales');
            }

            return [
                'status' => true,
                'message' => 'Smartphone For Sales Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getAllAdditionalFeeLists()
    {
        return $this->additional_fee_list->where('is_active', true)->get()->map(function ($list) {
            return [
                'name' => $list->name,
            ];
        });
    }

    public function getAllShippingFeeLists()
    {
        $currency = Cache::get('currency');

        return $this->additional_fee_list->where('is_active', true)->where('category', 'shipping_fee')->get()
            ->map(function ($list) use ($currency) {
                $name = $list->name;
                $type = $list->value_type;
                $price = $currency?->symbol.$list->default_value ?? 0;
                $percentage = $list->default_value ?? 0;

                $list->name = $name.' '.(
                    $type === 'percentage'
                        ? $percentage.'%'
                        : $price." ( {$type} )"
                );

                return $list;
            });
    }

    public function getAllImportTaxFeeLists()
    {
        $currency = Cache::get('currency');

        return $this->additional_fee_list->where('is_active', true)->where('category', 'import_tax')->get()
            ->map(function ($list) use ($currency) {
                $name = $list->name;
                $type = $list->value_type;
                $price = $currency?->symbol.$list->default_value ?? 0;
                $percentage = $list->default_value ?? 0;

                $list->name = $name.' '.(
                    $type === 'percentage'
                        ? $percentage.'%'
                        : $price." ( {$type} )"
                );

                return $list;
            });
    }

    public function getAllSmartphoneForSalesForCountryPrices()
    {
        $currency = Cache::get('currency');

        return $this->smartphone_for_sale->with(['smartphone.model_name'])
            ->get()
            ->map(function ($sale) use ($currency) {
                return [
                    'id' => $sale->id,
                    'name' => $sale->smartphone->model_name->name.' - '.($currency?->symbol ?? '').$sale->total_price,
                ];
            });
    }
}
