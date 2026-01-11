<?php

namespace App\Repositories\ShippingAddress\Interface;

use Illuminate\Http\Request;

interface IShippingAddressRepository
{
    public function getShippingAddresses(Request $request);

    public function getSingleShippingAddress(Request $request, string $id);

    public function storeShippingAddress(Request $request);

    public function updateShippingAddress(Request $request, string $id);

    public function toggleShippingAddress(Request $request, string $id);

    public function destroyShippingAddress(Request $request, string $id);

    public function storeShippingAddressFromProfile(Request $request);
}
