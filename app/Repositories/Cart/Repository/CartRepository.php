<?php

namespace App\Repositories\Cart\Repository;

use App\Models\CartItem;
use App\Models\Collaborator;
use App\Models\RewardSetting;
use App\Models\Smartphone;
use App\Repositories\Cart\Interface\ICartRepository;
use Exception;
use Illuminate\Http\Request;

class CartRepository implements ICartRepository
{
    public function __construct(
        private CartItem $cart,
        private Smartphone $smartphone,
        private Collaborator $collaborator,
        private RewardSetting $reward_setting
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
                'cart_items_count' => 0,
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
                    'smartphone' => function ($query) {
                        $query->withCount([
                            'inventory_items as inventory_items_count' => function ($q) {
                                $q->where('status', 'in_stock');
                            },
                        ]);
                    },
                ])

            ->get();

        return [
            'status' => true,
            'cart_items' => $items,

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

            $item_type = $request->input('type');
            $item_id = $request->integer('item_id');
            $quantity = $request->integer('quantity');
            $color_id = $request->integer('color');

            $already_items_in_cart = $this->cart->where('customer_id', $customer->id)->get();

            if ($item_type === 'smartphone') {
                $smartphone = $this->smartphone->where('id', $item_id)
                    ->with(['selling_info', 'category.distributor.user'])
                    ->first();

                if ($already_items_in_cart->isNotEmpty()) {
                    $is_same_distributor = $this->checkIsSameDistributor($already_items_in_cart, $smartphone);

                    if (! $is_same_distributor) {
                        throw new Exception('You Cannot Add Product From Different Distributor');
                    }
                }

                if (empty($smartphone)) {
                    throw new Exception('Wrong Product Selected Please Select Valid Product');
                }

                $total_price = $smartphone->selling_info->total_price;
                $unit_price = $smartphone->selling_info->selling_price;

                $exists = $this->cart->where('customer_id', $customer->id)->where('smartphone_id', $item_id)->first();
                if ($exists) {
                    throw new Exception('Product Aleady Exists In Cart');
                }

                $created = $this->cart->create([
                    'type' => $item_type,
                    'color_id' => $color_id,
                    'customer_id' => $customer->id,
                    'quantity' => $quantity,
                    'smartphone_id' => $smartphone->id,
                    'total_price' => $total_price,
                    'unit_price' => $unit_price,
                ]);

                if (empty($created)) {
                    throw new Exception('Something Went Wrong While Adding Product');
                }

                return [
                    'status' => true,
                    'message' => 'Product Added Succesfully To Cart',
                ];

            }
        } catch (Exception $e) {
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

                $item = $this->cart->where('customer_id', $customer->id)->where('smartphone_id', $item_id)->first();
                if (empty($item)) {
                    throw new Exception('Something Went Wrong While Removing Product From Cart');
                }

                $deleted = $item->delete();
                if (! $deleted) {
                    throw new Exception('Something Went Wrong While Removing Product From Cart');
                }

                return [
                    'status' => true,
                    'message' => 'Product Removed Succesfully From Cart',
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

            $cart_item = $this->cart->where('customer_id', $customer->id)->where('id', $item_id)->first();

            if (empty($cart_item)) {
                throw new Exception('Wrong Product Selected Please Select Valid Product');
            }

            if ($item_type === 'smartphone') {

                $smartphone = $this->smartphone->where('id', $cart_item->smartphone_id)->first();

                if (empty($smartphone)) {
                    throw new Exception('Wrong Product Selected Please Select Valid Product');
                }

                $cart_item->update([
                    'quantity' => $quantity,
                    'total_price' => $cart_item->unit_price * $quantity,

                ]);

                return [
                    'status' => true,
                    'message' => 'Product Updated Succesfully From Cart',
                ];
            }

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

            $cart = $this->cart->where('customer_id', $customer->id)->get();
            if ($cart->isEmpty()) {
                return [
                    'status' => false,
                    'message' => 'Cart Is Empty',
                ];
            }

            $collaborator = $this->collaborator->where('referral_code', $code)->first();

            if (empty($collaborator)) {
                return [
                    'status' => false,
                    'message' => 'Invalid Coupon Code',
                ];
            }

            $reward_rate = 0;
            $total_points = 0;

            if (empty($collaborator->point_accumulation_rate)) {
                $reward_rate = $this->reward_setting->first()->reward_rate ?? 0;
                $total_points = $cart->sum('total_price') * $reward_rate / 100;
            } else {
                $reward_rate = $collaborator->point_accumulation_rate ?? 0;
                $total_points = $cart->sum('total_price') * $reward_rate / 100;
            }

            session()->put('referal_data', [
                'collaborator_id' => $collaborator->id,
                'total_points' => $total_points,
                'reward_rate' => $reward_rate,
                'referal_code' => $collaborator->referral_code,
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
}
