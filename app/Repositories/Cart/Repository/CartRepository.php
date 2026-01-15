<?php

namespace App\Repositories\Cart\Repository;

use App\Models\CartItem;
use App\Models\Collaborator;
use App\Models\RewardSetting;
use App\Models\Smartphone;
use App\Models\SmartphoneCartAddon;
use App\Repositories\Cart\Interface\ICartRepository;
use App\Services\CartPriceCalculator;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartRepository implements ICartRepository
{
    public function __construct(
        private CartItem $cart,
        private Smartphone $smartphone,
        private Collaborator $collaborator,
        private RewardSetting $reward_setting,
        private SmartphoneCartAddon $smartphone_cart_addon,
        private CartPriceCalculator $price_calculator
    ) {}

    public function getCartItems(Request $request)
    {

        $user = $request->user();

        if (empty($user)) {
            return [
                'status' => false,
                'message' => 'Please login first',
            ];
        }

        // It Means Logged in user is Admin or Distributor Or Supplier So Cart Functionality is only for Customers
        if (empty($user->customer)) {
            return [
                'status' => true,
                'cart_items' => [],
                'addon_items' => [],
                'cart_items_count' => 0,
                'total_summary' => [],
            ];

        }

        $items = $this->cart
            ->where('customer_id', $user->customer->id)
            ->with(
                [
                    'smartphone',
                    'smartphone.selling_info',
                    'smartphone.model_name',
                    'smartphone.capacity',
                    'color',
                    'smartphone.selling_info.shipping_fee',
                    'smartphone.selling_info.import_tax',
                    'smartphone' => function ($query) {
                        $query->withCount([
                            'inventory_items as inventory_items_count' => function ($q) {
                                $q->where('status', 'in_stock');
                            },
                        ]);
                    },
                ])

            ->get();

        $addon_items = $this->smartphone_cart_addon
            ->where('customer_id', $user->customer->id)
            ->with(
                ['addon']
            )
            ->latest()
            ->get();

        $total_summary = $this->price_calculator->calculate($items, $addon_items);

        return [
            'status' => true,
            'cart_items' => $items,
            'addon_items' => $addon_items,
            'total_summary' => $total_summary,

        ];

    }

    public function getCartItemsCount(Request $request)
    {
        $user = $request->user();

        if (empty($user)) {
            return [
                'status' => false,
                'message' => 'Please login first',
            ];
        }

        // It Means Logged in user is Admin or Distributor Or Supplier So Cart Functionality is only for Customers
        if (empty($user->customer)) {
            return [
                'status' => true,
                'cart_items_count' => 0,
            ];

        }

        $items = $this->cart->where('customer_id', $user->customer->id)->count();

        return [
            'status' => true,
            'cart_items_count' => $items,
        ];
    }

    public function addItem(Request $request)
    {

        DB::beginTransaction();
        try {
            $user = $request->user();

            if (empty($user)) {
                throw new Exception('Please login first');
            }

            if (! $user->hasRole('Customer')) {
                throw new Exception('Only Customers Can Add items In Cart');
            }

            $customer = $user->customer;

            if (empty($customer)) {
                throw new Exception('Only Customers Can Add items To Cart And Purchase');
            }

            $smartphones = $request->array('smartphones');

            if (blank($smartphones)) {
                throw new Exception('Please Select Atleast One Smartphone');
            }

            $addons = $request->array('addons');

            $smartphone_cart_items = [];
            $addon_cart_items = [];

            $already_items_in_cart = $this->cart->where('customer_id', $customer->id)->get();

            if (! blank($smartphones)) {

                foreach ($smartphones as $cart_smartphone) {
                    $smartphone = $this->smartphone->where('id', $cart_smartphone['smartphone_id'])
                        ->with(['selling_info', 'category.distributor.user'])
                        ->withCount(['inventory_items as inventory_items_count' => function ($q) {
                            $q->where('status', 'in_stock');
                        }])
                        ->first();

                    if ($smartphone->inventory_items_count < $cart_smartphone['quantity']) {
                        throw new Exception('Out Of Stock');
                    }

                    if ($already_items_in_cart->isNotEmpty()) {
                        $is_same_distributor = $this->checkIsSameDistributor($already_items_in_cart, $smartphone);

                        if (! $is_same_distributor) {
                            throw new Exception('You Cannot Add Product From Different Distributor');
                        }
                    }

                    if (empty($smartphone)) {
                        throw new Exception('Wrong Product Selected Please Select Valid Product');
                    }

                    $exists = $this->cart->where('customer_id', $customer->id)->where('smartphone_id', $smartphone->id)
                        ->with([
                            'smartphone' => function ($q) {
                                $q->withCount([
                                    'inventory_items as inventory_items_count' => function ($q) {
                                        $q->where('status', 'in_stock');
                                    },
                                ]);
                            },
                        ])
                        ->first();

                    if (! empty($exists)) {

                        $total_quantity = $exists->quantity + $cart_smartphone['quantity'];

                        if ($exists->smartphone->inventory_items_count < $total_quantity) {
                            throw new Exception('Product Out Of Stock Please Adjust Quantity');
                        }

                        if ($exists->smartphone) {
                            $exists->update([
                                'quantity' => $total_quantity,
                            ]);
                        }

                        continue;
                    }

                    $smartphone_cart_items[] = [
                        'type' => 'smartphone',
                        'color_id' => $cart_smartphone['color_id'],
                        'color_name' => $cart_smartphone['color_name'],
                        'capacity' => $cart_smartphone['capacity'],
                        'customer_id' => $customer->id,
                        'quantity' => $cart_smartphone['quantity'],
                        'smartphone_id' => $smartphone->id,
                        'total_price' => $cart_smartphone['price'],
                        'unit_price' => $cart_smartphone['unit_price'],
                    ];
                }

            }

            if (! blank($addons)) {
                foreach ($addons as $addon) {

                    $exists = $this->smartphone_cart_addon->where('customer_id', $customer->id)->where('addon_id', $addon['id'])->where('smartphone_id', $addon['smartphone_id'])->with('addon')->first();
                    if (! empty($exists)) {
                        $exists->update([
                            'quantity' => $exists->quantity + $addon['quantity'],
                        ]);

                        continue;
                    }

                    $addon_cart_items[] = [
                        'addon_id' => $addon['id'],
                        'name' => $addon['name'],
                        'customer_id' => $customer->id,
                        'smartphone_id' => $addon['smartphone_id'],
                        'quantity' => $addon['quantity'],
                        'total_price' => $addon['price'],
                        'unit_price' => $addon['unit_price'],
                    ];
                }
            }

            if (! blank($smartphone_cart_items)) {
                $this->cart->insert($smartphone_cart_items);
            }

            if (! blank($addon_cart_items)) {
                $this->smartphone_cart_addon->insert($addon_cart_items);

            }

            DB::commit();

            return [
                'status' => true,
                'message' => 'Added Succesfully To Cart',
            ];
        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateItemFromFeed(Request $request, ?string $smartphone_id = null)
    {

        DB::beginTransaction();
        try {

            if (empty($smartphone_id)) {
                throw new Exception('Wrong Product Selected Please Select Valid Product');
            }

            $user = $request->user();

            if (empty($user)) {
                throw new Exception('Please login first');
            }

            if (! $user->hasRole('Customer')) {
                throw new Exception('Only Customers Can Add items In Cart');
            }

            $customer = $user->customer;

            if (empty($customer)) {
                throw new Exception('Only Customers Can Add items To Cart And Purchase');
            }

            $smartphones = $request->array('smartphones');

            if (blank($smartphones)) {
                throw new Exception('Please Select Atleast One Smartphone');
            }

            $this->cart->where('customer_id', $customer->id)
                ->where('smartphone_id', $smartphone_id)
                ->delete();

            $this->smartphone_cart_addon->where('customer_id', $customer->id)
                ->where('smartphone_id', $smartphone_id)
                ->delete();

            $addons = $request->array('addons');

            $smartphone_cart_items = [];
            $addon_cart_items = [];

            $already_items_in_cart = $this->cart->where('customer_id', $customer->id)->get();

            if (! blank($smartphones)) {

                foreach ($smartphones as $cart_smartphone) {
                    $smartphone = $this->smartphone->where('id', $cart_smartphone['smartphone_id'])
                        ->with(['selling_info', 'category.distributor.user'])
                        ->withCount(['inventory_items as inventory_items_count' => function ($q) {
                            $q->where('status', 'in_stock');
                        }])
                        ->first();

                    if ($smartphone->inventory_items_count < $cart_smartphone['quantity']) {
                        throw new Exception('Out Of Stock');
                    }

                    if ($already_items_in_cart->isNotEmpty()) {
                        $is_same_distributor = $this->checkIsSameDistributor($already_items_in_cart, $smartphone);

                        if (! $is_same_distributor) {
                            throw new Exception('You Cannot Add Product From Different Distributor');
                        }
                    }

                    if (empty($smartphone)) {
                        throw new Exception('Wrong Product Selected Please Select Valid Product');
                    }

                    $exists = $this->cart->where('customer_id', $customer->id)->where('smartphone_id', $smartphone->id)
                        ->with([
                            'smartphone' => function ($q) {
                                $q->withCount([
                                    'inventory_items as inventory_items_count' => function ($q) {
                                        $q->where('status', 'in_stock');
                                    },
                                ]);
                            },
                        ])
                        ->first();

                    if (! empty($exists)) {

                        $total_quantity = $exists->quantity + $cart_smartphone['quantity'];

                        if ($exists->smartphone->inventory_items_count < $total_quantity) {
                            throw new Exception('Product Out Of Stock Please Adjust Quantity');
                        }

                        if ($exists->smartphone) {
                            $exists->update([
                                'quantity' => $total_quantity,
                            ]);
                        }

                        continue;
                    }

                    $smartphone_cart_items[] = [
                        'type' => 'smartphone',
                        'color_id' => $cart_smartphone['color_id'],
                        'color_name' => $cart_smartphone['color_name'],
                        'capacity' => $cart_smartphone['capacity'],
                        'customer_id' => $customer->id,
                        'quantity' => $cart_smartphone['quantity'],
                        'smartphone_id' => $smartphone->id,
                        'total_price' => $cart_smartphone['price'],
                        'unit_price' => $cart_smartphone['unit_price'],
                    ];
                }

            }

            if (! blank($addons)) {
                foreach ($addons as $addon) {

                    $exists = $this->smartphone_cart_addon->where('customer_id', $customer->id)->where('addon_id', $addon['id'])->where('smartphone_id', $addon['smartphone_id'])->with('addon')->first();
                    if (! empty($exists)) {
                        $exists->update([
                            'quantity' => $exists->quantity + $addon['quantity'],
                        ]);

                        continue;
                    }

                    $addon_cart_items[] = [
                        'addon_id' => $addon['id'],
                        'name' => $addon['name'],
                        'customer_id' => $customer->id,
                        'smartphone_id' => $addon['smartphone_id'],
                        'quantity' => $addon['quantity'],
                        'total_price' => $addon['price'],
                        'unit_price' => $addon['unit_price'],
                    ];
                }
            }

            // dd($smartphone_cart_items, $addon_cart_items);

            if (! blank($smartphone_cart_items)) {
                $this->cart->insert($smartphone_cart_items);
            }

            if (! blank($addon_cart_items)) {
                $this->smartphone_cart_addon->insert($addon_cart_items);

            }

            DB::commit();

            return [
                'status' => true,
                'message' => 'Updated Succesfully',
            ];
        } catch (Exception $e) {
            DB::rollback();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function removeItem(Request $request)
    {
        try {
            $user = $request->user();
            if (empty($user)) {
                throw new Exception('Please login first');
            }

            if (! $user->hasRole('Customer')) {
                throw new Exception('Only Customers Can Remove items In Cart');
            }

            $customer = $user->customer;

            if (empty($customer)) {
                throw new Exception('Only Customers Can Remove items From Cart');
            }

            $item_type = $request->input('type');
            $item_id = $request->integer('item_id');

            if ($item_type === 'smartphone') {
                $smartphone = $this->smartphone->where('id', $item_id)->first();

                if (empty($smartphone)) {
                    throw new Exception('Wrong Product Selected Please Select Valid Product');
                }

                $item = $this->cart->where('customer_id', $customer->id)->where('smartphone_id', $item_id)->with(['smartphone'])->first();
                if (empty($item)) {
                    throw new Exception('Something Went Wrong While Removing Product From Cart');
                }

                DB::transaction(function () use ($item) {
                    if ($item->smartphone) {
                        $item->smartphone
                            ->smartphoneAddons()
                            ->where('smartphone_id', $item->smartphone->id)
                            ->delete();
                    }
                    $deleted = $item->delete();
                    if (! $deleted) {
                        throw new Exception('Something Went Wrong While Removing Product From Cart');
                    }
                });

                $all_cart_items = $this->cart->where('customer_id', $customer->id)->with(['smartphone', 'smartphone.selling_info', 'smartphone.selling_info.shipping_fee', 'smartphone.selling_info.import_tax'])->get();

                $addon_cart_items = $this->smartphone_cart_addon
                    ->where('customer_id', $customer->id)
                    ->whereIn('smartphone_id', $all_cart_items->pluck('smartphone_id')->toArray())
                    ->get();

                $total_summary = $this->price_calculator->calculate($all_cart_items, $addon_cart_items);

                return [
                    'status' => true,
                    'message' => 'Removed Succesfully From Cart',
                    'total_summary' => $total_summary,
                ];

            }
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    private function checkIsSameDistributor($cart_items, $smartphone)
    {
        foreach ($cart_items as $cart_item) {
            $carted_smartphone = $this->smartphone->where('id', $cart_item->smartphone_id)->first();

            if ($carted_smartphone->category->distributor_id === $smartphone->category->distributor_id) {
                return true;
            }
        }

        return false;
    }

    public function updateItem(Request $request)
    {
        try {
            $user = $request->user();
            if (empty($user)) {
                throw new Exception('Please login first');
            }

            if (! $user->hasRole('Customer')) {
                throw new Exception('Only Customers Can Update items From Cart');
            }

            $customer = $user->customer;

            if (empty($customer)) {
                throw new Exception('Only Customers Can Remove items From Cart');
            }

            $item_type = $request->input('type');
            $item_id = $request->integer('item_id');
            $quantity = $request->integer('quantity');

            $cart_item = $this->cart
                ->where('customer_id', $customer->id)
                ->where('id', $item_id)
                ->with(['smartphone', 'smartphone.selling_info', 'smartphone.selling_info.shipping_fee', 'smartphone.selling_info.import_tax'])
                ->get();

            if ($cart_item->isEmpty()) {
                throw new Exception('Wrong Product Selected Please Select Valid Product');
            }

            if ($item_type === 'smartphone') {

                $smartphone = $this->smartphone->where('id', $cart_item->first()->smartphone_id)->first();

                if (empty($smartphone)) {
                    throw new Exception('Wrong Product Selected Please Select Valid Product');
                }

                $cart_item->first()->update([
                    'quantity' => $quantity,
                    'total_price' => $cart_item->first()->unit_price * $quantity,

                ]);

                $all_cart_items = $this->cart->where('customer_id', $customer->id)->with(['smartphone', 'smartphone.selling_info', 'smartphone.selling_info.shipping_fee', 'smartphone.selling_info.import_tax'])->get();

                $addon_cart_items = $this->smartphone_cart_addon
                    ->where('customer_id', $customer->id)
                    ->whereIn('smartphone_id', $all_cart_items->pluck('smartphone_id')->toArray())
                    ->get();

                $total_summary = $this->price_calculator->calculate($all_cart_items, $addon_cart_items);

                return [
                    'status' => true,
                    'message' => 'Product Updated Succesfully From Cart',
                    'total_summary' => $total_summary,
                ];
            }

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateSmartphoneAddonItem(Request $request)
    {
        try {
            $user = $request->user();
            if (empty($user)) {
                throw new Exception('Please login first');
            }

            if (! $user->hasRole('Customer')) {
                throw new Exception('Only Customers Can Update items From Cart');
            }

            $customer = $user->customer;

            if (empty($customer)) {
                throw new Exception('Only Customers Can Remove items From Cart');
            }

            $item_id = $request->integer('item_id');
            $quantity = $request->integer('quantity');

            $cart_item = $this->smartphone_cart_addon->where('customer_id', $customer->id)->where('id', $item_id)->first();

            if (empty($cart_item)) {
                throw new Exception('Wrong Product Selected Please Select Valid Product');
            }

            $smartphone = $this->smartphone->where('id', $cart_item->smartphone_id)->first();

            if (empty($smartphone)) {
                throw new Exception('Wrong Product Selected Please Select Valid Product');
            }

            $cart_item->update([
                'quantity' => $quantity,
                'total_price' => $cart_item->unit_price * $quantity,

            ]);

            $all_cart_items = $this->cart->where('customer_id', $customer->id)->with(['smartphone', 'smartphone.selling_info', 'smartphone.selling_info.shipping_fee', 'smartphone.selling_info.import_tax'])->get();

            $addon_cart_items = $this->smartphone_cart_addon
                ->where('customer_id', $customer->id)
                ->whereIn('smartphone_id', $all_cart_items->pluck('smartphone_id')->toArray())
                ->get();

            $total_summary = $this->price_calculator->calculate($all_cart_items, $addon_cart_items);

            return [
                'status' => true,
                'message' => 'Updated Succesfully',
                'total_summary' => $total_summary,
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function removeSmartphoneAddonItem(Request $request)
    {
        try {

            $user = $request->user();
            if (empty($user)) {
                throw new Exception('Please login first');
            }

            if (! $user->hasRole('Customer')) {
                throw new Exception('Only Customers Can Remove items In Cart');
            }

            $customer = $user->customer;

            if (empty($customer)) {
                throw new Exception('Only Customers Can Remove items From Cart');
            }

            $item_id = $request->integer('item_id');

            $item = $this->smartphone_cart_addon->where('customer_id', $customer->id)->where('id', $item_id)->first();
            if (empty($item)) {
                throw new Exception('Something Went Wrong While Removing Product From Cart');
            }

            $deleted = $item->delete();
            if (! $deleted) {
                throw new Exception('Something Went Wrong While Removing Product From Cart');
            }

            $all_cart_items = $this->cart->where('customer_id', $customer->id)->with(['smartphone', 'smartphone.selling_info', 'smartphone.selling_info.shipping_fee', 'smartphone.selling_info.import_tax'])->get();

            $addon_cart_items = $this->smartphone_cart_addon
                ->where('customer_id', $customer->id)
                ->whereIn('smartphone_id', $all_cart_items->pluck('smartphone_id')->toArray())
                ->get();

            $total_summary = $this->price_calculator->calculate($all_cart_items, $addon_cart_items);

            return [
                'status' => true,
                'message' => 'Removed Succesfully From Cart',
                'total_summary' => $total_summary,
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function referalCode(Request $request)
    {
        try {
            $code = $request->input('code');
            if (empty($code)) {
                return [
                    'status' => false,
                    'message' => 'Please Enter Coupon Code',
                ];
            }

            $user = $request->user();

            if (empty($user)) {
                return [
                    'status' => false,
                    'message' => 'Please login first',
                ];
            }

            $customer = $user->customer;

            if (empty($customer)) {
                return [
                    'status' => false,
                    'message' => 'Only Customers Can Perform This Action',
                ];
            }

            $cart = $this->cart->where('customer_id', $customer->id)
                ->with(['smartphone', 'smartphone.selling_info', 'smartphone.selling_info.shipping_fee', 'smartphone.selling_info.import_tax'])
                ->get();

            if ($cart->isEmpty()) {
                return [
                    'status' => false,
                    'message' => 'Cart Is Empty',
                ];
            }

            $smartphone_addon_cart_item = $this->smartphone_cart_addon->where('customer_id', $customer->id)->get();
            $collaborator = $this->collaborator->where('referral_code', $code)->first();
            if (empty($collaborator)) {
                return [
                    'status' => false,
                    'message' => 'Invalid Coupon Code',
                ];
            }

            $reward_rate = 0;
            $total_points = 0;

            $total_amount = (float) $this->price_calculator->calculate($cart, $smartphone_addon_cart_item)['total'];

            if (empty($collaborator->point_accumulation_rate)) {
                $reward_rate = $this->reward_setting->first()->reward_rate ?? 0;
                $total_points = $total_amount * $reward_rate / 100;
            } else {
                $reward_rate = $collaborator->point_accumulation_rate ?? 0;
                $total_points = $total_amount * $reward_rate / 100;
            }

            session()->put('referal_data', [
                'collaborator_id' => $collaborator->id,
                'total_points' => $total_points,
                'reward_rate' => $reward_rate,
                'referal_code' => $collaborator->referral_code,
                'total_price' => $total_amount,
                'cart_customer_id' => $customer->id,
            ]);

            return [
                'status' => true,
                'total_points' => $total_points,
                'referal_code' => $collaborator->referral_code,
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function removeReferal(Request $request)
    {
        try {
            session()->forget('referal_data');

            return [
                'status' => true,
                'message' => 'Referal Removed Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateCartRefferalSession(?array $session_data, $cart_items, $addon_items)
    {

        if (empty($session_data)) {
            return [];
        }

        $cart_items = collect($cart_items);
        $smartphone_cart_addon_items = collect($addon_items);

        $total_amount = (float) $this->price_calculator->calculate($cart_items, $smartphone_cart_addon_items)['total'];

        $new_session_data = [
            'collaborator_id' => $session_data['collaborator_id'],
            'reward_rate' => $session_data['reward_rate'],
            'referal_code' => $session_data['referal_code'],
            'total_points' => $session_data['total_points'],
            'total_price' => $session_data['total_price'],
            'cart_customer_id' => $session_data['cart_customer_id'],
        ];

        $total_points = $total_amount * $new_session_data['reward_rate'] / 100;

        $new_session_data['total_points'] = $total_points;

        session()->put('referal_data', $new_session_data);

        return $new_session_data;
    }
}
