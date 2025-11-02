<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Repositories\Customers\Interface\ICustomerRepository;
use App\Repositories\Users\Interface\IUserRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function __construct(
        private IUserRepository $user,
        private ICustomerRepository $customer,
    ) {}

    public function index(Request $request)
    {

        $user = $this->user->getSingleCustomer(Auth::id());

        $countries = $this->customer->getCountries();

        if (empty($user)) {
            return to_route('login');
        }

        return Inertia::render('Website/Profile/index', compact('user', 'countries'));
    }

    public function update(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'User ID Not Found');
        }

        $response = $this->customer->updateCustomerProfile($request, $id);

        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);

    }

    public function changePassword(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'User ID Not Found');
        }

        $response = $this->customer->changeCustomerPassword($request, $id);

        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);
    }
}
