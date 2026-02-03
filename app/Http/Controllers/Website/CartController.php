<?php

namespace App\Http\Controllers\Website;

use App\Helpers\Trans;
use App\Http\Controllers\Controller;
use App\Repositories\Cart\Interface\ICartRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    public function __construct(
        private ICartRepository $cart,
        private Trans $trans
    ) {}

    public function index(Request $request)
    {
        $data = $this->cart->getCartItems($request);
        $cart_items = $data['cart_items'];

        $addon_items = $data['addon_items'];
        $total_summary = $data['total_summary'];

        return Inertia::render('Website/Cart/index', compact('cart_items', 'addon_items', 'total_summary'));
    }

    public function getCartItems(Request $request)
    {

        if (! $request->ajax()) {
            return to_route('home');
        }

        if (empty($request->user())) {
            return response()->json([
                'status' => false,
                'message' => $this->trans->get('Please Login First'),
            ], 404);
        }

        $data = $this->cart->getCartItems($request);

        if ($data['status'] === false) {
            return response()->json([
                'status' => false,
                'message' => $data['message'],
            ], 404);
        }

        $cart_items = $data['cart_items'];

        return response()->json([
            'status' => true,
            'cart_items' => $cart_items,
        ]);

    }

    public function getItemsCount(Request $request)
    {
        if (! $request->ajax()) {
            return to_route('home');
        }

        if (empty($request->user())) {
            return response()->json([
                'status' => false,
                'message' => $this->trans->get('Please Login First'),
            ], 404);
        }

        $data = $this->cart->getCartItemsCount($request);

        if ($data['status'] === false) {
            return response()->json([
                'status' => false,
                'message' => $data['message'],
            ], 404);
        }
        $cart_items_count = $data['cart_items_count'];

        return response()->json([
            'status' => true,
            'cart_items_count' => $cart_items_count,
        ]);

    }

    public function addItem(Request $request)
    {

        $response = $this->cart->addItem($request);

        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);

    }

    public function removeItem(Request $request)
    {

        $response = $this->cart->removeItem($request);

        if ($request->ajax() && $request->wantsJson()) {
            if ($response['status'] === false) {
                return response()->json([
                    'status' => false,
                    'message' => $response['message'],
                    'total_summary' => [],
                ]);

            }

            return response()->json([
                'status' => true,
                'message' => $response['message'],
                'total_summary' => $response['total_summary'],
            ]);
        }

        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);

    }

    public function updateItem(Request $request)
    {

        $response = $this->cart->updateItem($request);

        if ($response['status'] === false) {
            return response()->json([
                'status' => false,
                'message' => $response['message'],
                'total_summary' => [],
            ]);
        }

        return response()->json([
            'status' => true,
            'message' => $response['message'],
            'total_summary' => $response['total_summary'],
        ]);
    }

    public function referalCode(Request $request)
    {
        $response = $this->cart->referalCode($request);

        if ($response['status'] === false) {
            return response()->json([
                'status' => false,
                'message' => $response['message'],
            ]);
        }

        return response()->json([
            'status' => true,
            'total_points' => $response['total_points'],
            'referal_code' => $response['referal_code'],
        ]);
    }

    public function removeReferal(Request $request)
    {
        $response = $this->cart->removeReferal($request);

        if ($response['status'] === false) {
            return response()->json([
                'status' => false,
                'message' => $response['message'],
            ]);
        }

        return response()->json([
            'status' => true,
            'message' => $response['message'],
        ]);
    }

    public function buyNow(Request $request)
    {

        $response = $this->cart->addItem($request);

        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return to_route('website.checkout.index');
    }

    public function updateSmartphoneAddonItem(Request $request)
    {
        $response = $this->cart->updateSmartphoneAddonItem($request);

        if ($response['status'] === false) {
            return response()->json([
                'status' => false,
                'message' => $response['message'],
                'total_summary' => [],
            ]);
        }

        return response()->json([
            'status' => true,
            'message' => $response['message'],
            'total_summary' => $response['total_summary'],
        ]);
    }

    public function removeSmartphoneAddonItem(Request $request)
    {

        $response = $this->cart->removeSmartphoneAddonItem($request);

        if ($request->ajax() && $request->wantsJson()) {
            if ($response['status'] === false) {
                return response()->json([
                    'status' => false,
                    'message' => $response['message'],
                    'total_summary' => [],
                ]);

            }

            return response()->json([
                'status' => true,
                'message' => $response['message'],
                'total_summary' => $response['total_summary'],
            ]);
        }

        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);

    }
}
