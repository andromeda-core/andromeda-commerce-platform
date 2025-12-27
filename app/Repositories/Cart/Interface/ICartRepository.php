<?php

namespace App\Repositories\Cart\Interface;

use Illuminate\Http\Request;

interface ICartRepository
{
    public function getCartItems(Request $request);

    public function getCartItemsCount(Request $request);

    public function addItem(Request $request);

    public function removeItem(Request $request);

    public function updateItem(Request $request);

    public function referalCode(Request $request);

    public function removeReferal(Request $request);

    public function updateCartRefferalSession(?array $session_data, $cart_items);
}
