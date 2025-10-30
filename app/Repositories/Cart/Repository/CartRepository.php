<?php

namespace App\Repositories\Cart\Repository;

use App\Models\CartItem;
use App\Models\Smartphone;
use App\Repositories\Cart\Interface\ICartRepository;
use Exception;
use Illuminate\Http\Request;

class CartRepository implements ICartRepository
{
    public function __construct(
        private CartItem $cart,
        private Smartphone $smartphone
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

        $items = $this->cart->where('customer_id', $user->customer->id)->get();

        return [
            'status' => true,
            'cart_items' => $items,
            'cart_items_count' => $items->count(),
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

            $customer = $user->customer;

            if (empty($customer)) {
                throw new Exception('Only Customers Can Add items To Cart And Purchase');
            }

            $item_type = $request->input('type');
            $item_id = $request->integer('item_id');
            $quantity = $request->integer('quantity');
            $color_id = $request->integer('color');

            if ($item_type === 'smartphone') {
                $smartphone = $this->smartphone->where('id', $item_id)->with('selling_info')->first();

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
}
