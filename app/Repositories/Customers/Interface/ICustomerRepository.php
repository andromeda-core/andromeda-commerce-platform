<?php

namespace App\Repositories\Customers\Interface;

use Illuminate\Http\Request;

interface ICustomerRepository
{
    public function getAllCustomers(Request $request);

    public function getSingleCustomer(string $id);

    public function storeCustomer(Request $request);

    public function updateCustomer(Request $request, string $id);

    public function destroyCustomer(string $id);

    public function destroyCustomerBySelection(Request $request);

    public function getCountries();

    public function updateCustomerProfile(Request $request, string $id);

    public function changeCustomerPassword(Request $request, string $id);
}
