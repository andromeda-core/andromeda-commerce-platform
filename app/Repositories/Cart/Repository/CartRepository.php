<?php

namespace App\Repositories\Cart\Repository;

use App\Helpers\Trans;
use App\Models\Addon;
use App\Models\CartItem;
use App\Models\Collaborator;
use App\Models\Color;
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
        private CartPriceCalculator $price_calculator,
        private Addon $addon,
        private Color $color,
        private Trans $trans,
    ) {}

    public function getCartItems(Request $request)
    {

        $user = $request->user();

        if (empty($user)) {
            return [
                'status' => false,
                'message' => $this->trans->get('Please Login First'),
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
                    'smartphoneAddonItems.addon',
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

        $addon_items = $items->flatMap(function ($item) {
            return $item->smartphoneAddonItems;
        });

        // dd($items->toArray(), $addon_items->toArray());

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
                'message' => $this->trans->get('Please Login First'),
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
                throw new Exception($this->trans->get('Please Login First'));
            }

            if (! $user->hasRole('Customer')) {
                throw new Exception($this->trans->get('Only Customers Can Add items In Cart'));
            }

            $customer = $user->customer;

            if (empty($customer)) {
                throw new Exception($this->trans->get('Only Customers Can Add items To Cart And Purchase'));
            }

            $smartphones = $request->array('smartphones');

            if (blank($smartphones)) {
                throw new Exception($this->trans->get('Please Select Atleast One Smartphone'));
            }

            $addons = $request->array('addons');

            $already_items_in_cart = $this->cart->where('customer_id', $customer->id)->get();

            if (! blank($smartphones)) {

                foreach ($smartphones as $cart_smartphone) {
                    $smartphone = $this->smartphone->where('id', $cart_smartphone['smartphone_id'])
                        ->with(['selling_info', 'category.distributor.user'])
                        ->withCount(['inventory_items as inventory_items_count' => function ($q) {
                            $q->where('status', 'in_stock');
                        }])
                        ->first();

                    if (empty($smartphone)) {
                        throw new Exception($this->trans->get('Wrong Product Selected Please Select Valid Product'));
                    }

                    if ($smartphone->is_sold_out) {
                        throw new Exception($this->trans->get('This product is currently sold out'));
                    }

                    if ($already_items_in_cart->isNotEmpty()) {
                        $is_same_distributor = $this->checkIsSameDistributor($already_items_in_cart, $smartphone);

                        if (! $is_same_distributor) {
                            throw new Exception($this->trans->get('You Cannot Add Product From Different Distributor'));
                        }
                    }

                    $incomingAddons = collect($addons)
                        ->where('smartphone_id', $smartphone->id)
                        ->values();

                    $existingCartItems = $this->cart
                        ->where('customer_id', $customer->id)
                        ->where('smartphone_id', $smartphone->id)
                        ->with('smartphoneAddonItems')
                        ->get();

                    // Not Needed RN Because We are Now Not Restricting Items When Not Exists in the Inventory
                    // $alreadyInCartQty = $existingCartItems->sum('quantity');
                    // $requiredQty = $alreadyInCartQty + $cart_smartphone['quantity'];

                    // if ($smartphone->inventory_items_count < $requiredQty) {
                    //     $first_part_message = $this->trans->get('You already have');
                    //     $second_part_message = $alreadyInCartQty;
                    //     $third_part_message = $this->trans->get('items of this product in your cart. Adding more quantity exceeds available stock.');
                    //     throw new Exception(
                    //         $first_part_message.' '.$second_part_message.' '.$third_part_message
                    //     );
                    // }

                    $matchedCartItem = null;

                    foreach ($existingCartItems as $cartItem) {

                        // Case: both have NO addons
                        if ($incomingAddons->isEmpty() && $cartItem->smartphoneAddonItems->isEmpty()) {
                            $matchedCartItem = $cartItem;
                            break;
                        }

                        // Case: Addons Exists
                        if (
                            $incomingAddons->isNotEmpty() &&
                            $cartItem->smartphoneAddonItems->isNotEmpty() &&
                            $this->addonsMatch($cartItem->smartphoneAddonItems, $incomingAddons)
                        ) {
                            $matchedCartItem = $cartItem;
                            break;
                        }
                    }

                    // If Found -> Update
                    if ($matchedCartItem) {

                        $totalQty = $matchedCartItem->quantity + $cart_smartphone['quantity'];

                        // Smartphone quantity +
                        $matchedCartItem->update([
                            'quantity' => $totalQty,
                        ]);

                        // Addon quantity + (ONLY for same cart item)
                        foreach ($incomingAddons as $addon) {
                            $this->smartphone_cart_addon
                                ->where('cart_item_id', $matchedCartItem->id)
                                ->where('addon_id', $addon['id'])
                                ->increment('quantity', $addon['quantity']);
                        }

                        continue;
                    }

                    $cartItem = $this->cart->create([
                        'type' => 'smartphone',
                        'color_id' => $cart_smartphone['color_id'],
                        'color_name' => $cart_smartphone['color_name'],
                        'capacity' => $cart_smartphone['capacity'],
                        'customer_id' => $customer->id,
                        'quantity' => $cart_smartphone['quantity'],
                        'smartphone_id' => $smartphone->id,
                        'total_price' => $cart_smartphone['price'],
                        'unit_price' => $cart_smartphone['unit_price'],
                    ]);

                    foreach ($incomingAddons as $addon) {
                        $this->smartphone_cart_addon->create([
                            'cart_item_id' => $cartItem->id,
                            'addon_id' => $addon['id'],
                            'name' => $addon['name'],
                            'smartphone_id' => $cartItem->smartphone_id,
                            'customer_id' => $customer->id,
                            'quantity' => $addon['quantity'],
                            'total_price' => $addon['price'],
                            'unit_price' => $addon['unit_price'],
                        ]);
                    }

                }

            }

            DB::commit();

            return [
                'status' => true,
                'message' => $this->trans->get('Added Succesfully To Cart').
                 ' <a href="'.route('website.carts.index').'" class="font-semibold underline">'.$this->trans->get('Go To Cart').'</a>',
            ];
        } catch (Exception $e) {
            DB::rollBack();

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
                throw new Exception($this->trans->get('Please Login First'));
            }

            if (! $user->hasRole('Customer')) {
                throw new Exception($this->trans->get('Only Customers Can Remove items In Cart'));
            }

            $customer = $user->customer;

            if (empty($customer)) {
                throw new Exception($this->trans->get('Only Customers Can Remove items From Cart'));
            }

            $item_type = $request->input('type');
            $item_id = $request->integer('item_id');
            $page = $request->input('page');

            if ($item_type === 'smartphone') {

                if ($page === 'cart') {
                    $item = $this->cart->where('customer_id', $customer->id)->where('id', $item_id)->with(['smartphone', 'smartphoneAddonItems'])->first();
                    if (empty($item)) {
                        throw new Exception($this->trans->get('Something Went Wrong While Removing Product From Cart'));
                    }

                    DB::transaction(function () use ($item) {
                        if ($item->smartphone) {
                            $item->smartphoneAddonItems()
                                ->delete();
                        }
                        $deleted = $item->delete();
                        if (! $deleted) {
                            throw new Exception($this->trans->get('Something Went Wrong While Removing Product From Cart'));
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
                        'message' => $this->trans->get('Removed Succesfully From Cart'),
                        'total_summary' => $total_summary,
                    ];
                }

                // BUY NOW SESSION LOGIC
                $sessionKey = 'single_product_checkout_'.$user->id;
                $sessionData = session()->get($sessionKey);
                $temp_id = $request->input('temp_id');

                if (empty($sessionData)) {
                    throw new Exception($this->trans->get('Invalid Buy Now Session'));
                }

                if (empty($temp_id)) {
                    throw new Exception($this->trans->get('Invalid Item Identifier'));
                }

                $cartItems = $sessionData['cart_items'] ?? collect();
                $addonItems = $sessionData['addon_items'] ?? collect();

                $updatedCartItems = $cartItems
                    ->reject(fn ($item) => isset($item->temp_id) && $item->temp_id === $temp_id)
                    ->values();

                $updatedAddonItems = $addonItems
                    ->reject(fn ($addon) => isset($addon->parent_temp_id) && $addon->parent_temp_id === $temp_id)
                    ->values();

                if ($updatedCartItems->isEmpty()) {
                    session()->forget($sessionKey);

                    return [
                        'status' => true,
                        'message' => $this->trans->get('All items removed. Session cleared.'),
                        'total_summary' => [],
                    ];
                }

                // Recalculate totals
                $total_summary = $this->price_calculator->calculate($updatedCartItems, $updatedAddonItems);

                // Save updated collections to session
                session()->put($sessionKey, [
                    ...$sessionData,
                    'cart_items' => $updatedCartItems,
                    'addon_items' => $updatedAddonItems,
                    'total_summary' => $total_summary,
                    'updated_at' => now(),
                ]);

                return [
                    'status' => true,
                    'message' => $this->trans->get('Product Removed Successfully'),
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
                throw new Exception($this->trans->get('Please Login First'));
            }

            if (! $user->hasRole('Customer')) {
                throw new Exception($this->trans->get('Only Customers Can Update items From Cart'));
            }

            $customer = $user->customer;

            if (empty($customer)) {
                throw new Exception($this->trans->get('Only Customers Can Remove items From Cart'));
            }

            $page = $request->input('page');
            $item_type = $request->input('type');
            $item_id = $request->integer('item_id');
            $quantity = $request->integer('quantity');

            $cart_item = null;
            if ($page === 'cart') {
                $cart_item = $this->cart
                    ->where('customer_id', $customer->id)
                    ->where('id', $item_id)
                    ->with(['smartphone', 'smartphone.selling_info', 'smartphone.selling_info.shipping_fee', 'smartphone.selling_info.import_tax'])
                    ->get();
            } else {

                $sessionKey = 'single_product_checkout_'.$user->id;
                $sessionData = session()->get($sessionKey);
                $temp_id = $request->input('temp_id');

                if (empty($sessionData) || empty($sessionData['cart_items'])) {
                    throw new Exception($this->trans->get('Invalid Buy Now Session'));
                }

                /** @var \Illuminate\Support\Collection $cartItems */
                $cartItems = $sessionData['cart_items'];

                // dd($cartItems->toArray());

                /** @var \App\Models\CartItem $cartItem */
                $cartItem = $cartItems->firstWhere(function ($item) use ($temp_id) {
                    return isset($item->temp_id) && $item->temp_id === $temp_id;
                });

                if (! $cartItem) {
                    throw new Exception($this->trans->get('Product not found in Buy Now session'));
                }

                $cartItem->quantity = $quantity;
                $cartItem->total_price = bcmul(
                    $cartItem->unit_price,
                    $quantity,
                    2
                );

                $total_summary = $this->price_calculator->calculate(
                    $cartItems,
                    $sessionData['addon_items'] ?? collect()
                );

                session()->put($sessionKey, [
                    ...$sessionData,
                    'cart_items' => $cartItems,
                    'total_summary' => $total_summary,
                ]);

                return [
                    'status' => true,
                    'message' => $this->trans->get('Product Updated Succesfully'),
                    'total_summary' => $total_summary,
                ];
            }

            if ($cart_item->isEmpty()) {
                throw new Exception($this->trans->get('Wrong Product Selected Please Select Valid Product'));
            }

            if ($item_type === 'smartphone') {

                $smartphone = $this->smartphone->where('id', $cart_item->first()->smartphone_id)->first();

                if (empty($smartphone)) {
                    throw new Exception($this->trans->get('Wrong Product Selected Please Select Valid Product'));
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
                    'message' => $this->trans->get('Product Updated Succesfully From Cart'),
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
                throw new Exception($this->trans->get('Please Login First'));
            }

            if (! $user->hasRole('Customer')) {
                throw new Exception($this->trans->get('Only Customers Can Update items From Cart'));
            }

            $customer = $user->customer;

            if (empty($customer)) {
                throw new Exception($this->trans->get('Only Customers Can Remove items From Cart'));
            }

            $item_id = $request->integer('item_id');
            $quantity = $request->integer('quantity');

            $page = $request->input('page');

            $cart_item = null;

            if ($page === 'cart') {
                $cart_item = $this->smartphone_cart_addon->where('customer_id', $customer->id)->where('id', $item_id)->first();
            } else {

                $sessionKey = 'single_product_checkout_'.$user->id;
                $sessionData = $request->session()->get($sessionKey);
                $temp_id = $request->input('temp_id');

                if (empty($sessionData) || empty($sessionData['addon_items'])) {
                    throw new Exception('Invalid Buy Now Session');
                }

                /** @var \Illuminate\Support\Collection $addonItems */
                $addonItems = $sessionData['addon_items'];

                /** @var \App\Models\SmartphoneCartAddon $addonItem */
                $addonItem = $addonItems->firstWhere(function ($addon) use ($temp_id) {
                    return isset($addon->temp_id) && $addon->temp_id === $temp_id;
                });

                // dd($addonItem);
                if (! $addonItem) {
                    throw new Exception('Addon not found in session');
                }

                // Update the found addon
                $addonItem->quantity = $quantity;
                $addonItem->total_price = bcmul(
                    $addonItem->unit_price,
                    $quantity,
                    2
                );

                $updatedAddonItems = $addonItems->map(function ($addon) use ($addonItem, $temp_id) {
                    if (isset($addon->temp_id) && $addon->temp_id === $temp_id) {
                        return $addonItem;
                    }

                    return $addon;
                });

                // Also update the addon in parent cart item's relation
                $cartItems = $sessionData['cart_items'];
                $updatedCartItems = $cartItems->map(function ($cartItem) use ($addonItem, $temp_id) {
                    // Check if this cart item has the addon
                    if (isset($addonItem->parent_temp_id) && isset($cartItem->temp_id) && $cartItem->temp_id === $addonItem->parent_temp_id) {
                        if ($cartItem->relationLoaded('smartphoneAddonItems')) {
                            $updatedAddons = $cartItem->smartphoneAddonItems->map(function ($addon) use ($addonItem, $temp_id) {
                                if (isset($addon->temp_id) && $addon->temp_id === $temp_id) {
                                    return $addonItem;
                                }

                                return $addon;
                            });
                            $cartItem->setRelation('smartphoneAddonItems', $updatedAddons);
                        }
                    }

                    return $cartItem;
                });

                // Recalculate totals
                $total_summary = $this->price_calculator->calculate(
                    $updatedCartItems,
                    $updatedAddonItems
                );

                session()->put($sessionKey, [
                    ...$sessionData,
                    'addon_items' => $addonItems,
                    'total_summary' => $total_summary,
                ]);

                return [
                    'status' => true,
                    'message' => 'Addon Updated Successfully',
                    'total_summary' => $total_summary,
                ];
            }
            if (empty($cart_item)) {
                throw new Exception($this->trans->get('Wrong Product Selected Please Select Valid Product'));
            }

            $smartphone = $this->smartphone->where('id', $cart_item->smartphone_id)->first();

            if (empty($smartphone)) {
                throw new Exception($this->trans->get('Wrong Product Selected Please Select Valid Product'));
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
                'message' => $this->trans->get('Updated Succesfully'),
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
                throw new Exception($this->trans->get('Please Login First'));
            }

            if (! $user->hasRole('Customer')) {
                throw new Exception($this->trans->get('Only Customers Can Remove items In Cart'));
            }

            $customer = $user->customer;

            if (empty($customer)) {
                throw new Exception($this->trans->get('Only Customers Can Remove items From Cart'));
            }

            $item_id = $request->integer('item_id');
            $page = $request->input('page');

            if ($page === 'cart') {
                $item = $this->smartphone_cart_addon->where('customer_id', $customer->id)->where('id', $item_id)->first();
                if (empty($item)) {
                    throw new Exception($this->trans->get('Something Went Wrong While Removing Addon From Cart'));
                }

                $deleted = $item->delete();
                if (! $deleted) {
                    throw new Exception($this->trans->get('Something Went Wrong While Removing Addon From Cart'));
                }

                $all_cart_items = $this->cart->where('customer_id', $customer->id)->with(['smartphone', 'smartphone.selling_info', 'smartphone.selling_info.shipping_fee', 'smartphone.selling_info.import_tax'])->get();

                $addon_cart_items = $this->smartphone_cart_addon
                    ->where('customer_id', $customer->id)
                    ->whereIn('smartphone_id', $all_cart_items->pluck('smartphone_id')->toArray())
                    ->get();

                $total_summary = $this->price_calculator->calculate($all_cart_items, $addon_cart_items);

                return [
                    'status' => true,
                    'message' => $this->trans->get('Removed Succesfully'),
                    'total_summary' => $total_summary,
                ];
            }

            // BUY NOW SESSION LOGIC
            $sessionKey = 'single_product_checkout_'.$user->id;
            $sessionData = session()->get($sessionKey);
            $temp_id = $request->input('temp_id');

            if (empty($sessionData) || empty($sessionData['addon_items'])) {
                throw new Exception('Invalid Buy Now Session');
            }

            if (empty($temp_id)) {
                throw new Exception('Invalid Addon Identifier');
            }

            $addonItems = $sessionData['addon_items'];
            $cartItems = $sessionData['cart_items'];

            $addonToRemove = $addonItems->firstWhere(function ($addon) use ($temp_id) {
                return isset($addon->temp_id) && $addon->temp_id === $temp_id;
            });

            if (! $addonToRemove) {
                throw new Exception('Addon not found in session');
            }

            $parentTempId = $addonToRemove->parent_temp_id ?? null;

            $updatedAddonItems = $addonItems
                ->reject(fn ($addon) => isset($addon->temp_id) && $addon->temp_id === $temp_id)
                ->values();

            $updatedCartItems = $cartItems->map(function ($cartItem) use ($temp_id, $parentTempId) {
                if ($parentTempId && isset($cartItem->temp_id) && $cartItem->temp_id === $parentTempId) {
                    if ($cartItem->relationLoaded('smartphoneAddonItems')) {
                        $updatedAddons = $cartItem->smartphoneAddonItems
                            ->reject(fn ($addon) => isset($addon->temp_id) && $addon->temp_id === $temp_id)
                            ->values();
                        $cartItem->setRelation('smartphoneAddonItems', $updatedAddons);
                    }
                }

                return $cartItem;
            });

            // Recalculate totals
            $total_summary = $this->price_calculator->calculate(
                $updatedCartItems,
                $updatedAddonItems
            );

            // Save updated collections to session
            session()->put($sessionKey, [
                ...$sessionData,
                'cart_items' => $updatedCartItems,
                'addon_items' => $updatedAddonItems,
                'total_summary' => $total_summary,
                'updated_at' => now(),
            ]);

            return [
                'status' => true,
                'message' => 'Addon Removed Successfully',
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
                    'message' => $this->trans->get('Please Enter Coupon Code'),
                ];
            }

            $user = $request->user();

            if (empty($user)) {
                return [
                    'status' => false,
                    'message' => $this->trans->get('Please Login First'),
                ];
            }

            $customer = $user->customer;

            if (empty($customer)) {
                return [
                    'status' => false,
                    'message' => $this->trans->get('Only Customers Can Perform This Action'),
                ];
            }

            $buy_now = (bool) $request->has('buy_now');
            $sessionKey = 'single_product_checkout_'.$user->id;
            $sessionData = session()->get($sessionKey);

            $cart = collect();
            $smartphone_addon_cart_item = collect();

            if ($buy_now && ! blank($sessionData)) {
                $cart = collect($sessionData['cart_items']);
                $smartphone_addon_cart_item = collect($sessionData['addon_items']);
            } else {
                $cart = $this->cart->where('customer_id', $customer->id)
                    ->with(['smartphone', 'smartphone.selling_info', 'smartphone.selling_info.shipping_fee', 'smartphone.selling_info.import_tax'])
                    ->get();
                $smartphone_addon_cart_item = $this->smartphone_cart_addon->where('customer_id', $customer->id)->get();
            }

            if ($cart->isEmpty()) {
                return [
                    'status' => false,
                    'message' => $this->trans->get('Cart Is Empty'),
                ];
            }

            $collaborator = $this->collaborator->where('referral_code', $code)->first();
            if (empty($collaborator)) {
                return [
                    'status' => false,
                    'message' => $this->trans->get('Invalid Coupon Code'),
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
                'message' => $this->trans->get('Referal Removed Successfully'),
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

    public function singleProductCheckoutSessionStore(Request $request)
    {
        try {
            $user = $request->user();

            if (empty($user)) {
                throw new Exception($this->trans->get('Please Login First'));
            }

            if (! $user->hasRole('Customer')) {
                throw new Exception($this->trans->get('Only Customers Can Add items In Cart'));
            }

            $customer = $user->customer;

            if (empty($customer)) {
                throw new Exception($this->trans->get('Only Customers Can Add items To Cart And Purchase'));
            }

            session()->forget('single_product_checkout_'.$user->id);

            $smartphonesData = [];

            if ($request->has('smartphones')) {
                $rawData = $request->input('smartphones');

                foreach ($rawData as $key => $value) {
                    if (is_numeric($key)) {
                        $smartphonesData[] = $value;
                    }
                }
            } elseif ($request->has('smartphone')) {
                $smartphonesData[] = $request->input('smartphone');
            } else {
                throw new Exception($this->trans->get('No product data received'));
            }

            if (empty($smartphonesData)) {
                throw new Exception($this->trans->get('No products to checkout'));
            }

            $allCartItems = collect();
            $allAddonItems = collect();

            foreach ($smartphonesData as $data) {

                if (empty($data['smartphone_id']) || empty($data['color_id'])) {
                    continue;
                }

                $addons = json_decode($data['addons'], true) ?? [];

                $smartphoneModel = $this->smartphone->with([
                    'selling_info',
                    'selling_info.shipping_fee',
                    'selling_info.import_tax',
                    'addons',
                    'model_name',
                    'capacity',
                ])->findOrFail($data['smartphone_id']);

                if ($smartphoneModel->is_sold_out) {
                    throw new Exception($this->trans->get('This product is currently sold out'));
                }

                $tempId = uniqid('cart_', true);

                $cartItem = new CartItem([
                    'customer_id' => $customer->id,
                    'smartphone_id' => $smartphoneModel->id,
                    'type' => 'smartphone',
                    'quantity' => $data['quantity'] ?? 1,
                    'color_id' => $data['color_id'],
                    'color_name' => $data['color_name'] ?? '',
                    'capacity' => $data['capacity'] ?? '',
                    'unit_price' => $data['unit_price'] ?? $smartphoneModel->selling_info->total_price,
                    'total_price' => bcmul(
                        $data['unit_price'] ?? $smartphoneModel->selling_info->total_price,
                        $data['quantity'] ?? 1,
                        2
                    ),
                ]);

                $cartItem->temp_id = $tempId;

                $cartItem->setRelation('smartphone', $smartphoneModel);

                $colorModel = $this->color->findOrFail($data['color_id']);
                $cartItem->setRelation('color', $colorModel);

                $addonItems = collect();

                foreach ($addons as $addon) {
                    $addonModel = $this->addon->findOrFail($addon['id']);

                    $addonTempId = uniqid('addon_', true);

                    $addonItem = new SmartphoneCartAddon([
                        'addon_id' => $addonModel->id,
                        'name' => $addonModel->name ?? $addon['name'],
                        'customer_id' => $customer->id,
                        'smartphone_id' => $smartphoneModel->id,
                        'quantity' => $addon['quantity'] ?? 1,
                        'unit_price' => $addon['unit_price'] ?? $addonModel->price,
                        'total_price' => bcmul(
                            $addon['unit_price'] ?? $addonModel->price,
                            $addon['quantity'] ?? 1,
                            2
                        ),
                    ]);

                    $addonItem->temp_id = $addonTempId;
                    $addonItem->parent_temp_id = $tempId;

                    $addonItem->setRelation('addon', $addonModel);
                    $addonItems->push($addonItem);
                }

                $cartItem->setRelation('smartphoneAddonItems', $addonItems);

                $allCartItems->push($cartItem);
                $allAddonItems = $allAddonItems->merge($addonItems);
            }

            $total_summary = $this->price_calculator->calculate(
                $allCartItems,
                $allAddonItems
            );

            // Store in session
            session()->put('single_product_checkout_'.$user->id, [
                'cart_items' => $allCartItems,
                'addon_items' => $allAddonItems,
                'total_summary' => $total_summary,
                'created_at' => now(),
            ]);

            return [
                'status' => true,
                'message' => $this->trans->get('Session Created Successfully You will be Redirected To Checkout Shortly..!'),
                'cart_count' => $allCartItems->count(),
                'addon_count' => $allAddonItems->count(),
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    private function addonsMatch($existing, $incoming)
    {
        if ($existing->count() !== $incoming->count()) {
            return false;
        }

        $existingIds = $existing->pluck('addon_id')->sort()->values()->toArray();
        $incomingIds = $incoming->pluck('id')->sort()->values()->toArray();

        return $existingIds === $incomingIds;
    }
}
