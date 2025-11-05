<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Repositories\Cart\Interface\ICartRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function __construct(
        private ICartRepository $cart
    ) {}

    public function index(Request $request)
    {
        $data = $this->cart->getCartItems($request);
        $cart_items = $data['cart_items'];

        $refferalSessionData = session()->get('referal_data');

        return Inertia::render('Website/Checkout/index', compact('cart_items', 'refferalSessionData'));
    }
}
