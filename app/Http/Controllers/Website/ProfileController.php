<?php

namespace App\Http\Controllers\Website;

use App\Helpers\Trans;
use App\Http\Controllers\Controller;
use App\Repositories\Customers\Interface\ICustomerRepository;
use App\Repositories\Settings\Interface\ISettingRepository;
use App\Repositories\Users\Interface\IUserRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function __construct(
        private IUserRepository $user,
        private ICustomerRepository $customer,
        private ISettingRepository $setting,
        private Trans $trans,
    ) {}

    public function index(Request $request)
    {

        $user = $this->user->getSingleCustomer(Auth::id());

        $countries = $this->setting->getCountries();

        if (empty($user)) {
            return to_route('login');
        }

        return Inertia::render('Website/Profile/index', compact('user', 'countries'));
    }

    public function update(Request $request, ?string $id = null)
    {

        if (empty($id)) {
            return back()->with('error', $this->trans->get('User ID Not Found'));
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
            return back()->with('error', $this->trans->get('User ID Not Found'));
        }

        $response = $this->customer->changeCustomerPassword($request, $id);

        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);
    }

    public function uploadProfilePicture(Request $request)
    {

        $response = $this->user->uploadProfilePicture($request);

        if ($response['status'] === false) {
            return response()->json(['status' => false, 'message' => $response['message']], 400);
        }

        return response()->json(['status' => true, 'message' => $response['message'], 'profile' => $response['profile']], 200);
    }

    public function activateDormantAccountIndex()
    {
        return Inertia::render('Website/Profile/ActivateDormantAccount');
    }

    public function activateDormantAccountActive(Request $request)
    {
        $activated = $this->user->activateDormantAccount($request);

        if ($activated['status'] === false) {
            return response()->json(['status' => false, 'message' => $activated['message']], 400);
        }

        return response()->json(['status' => true, 'message' => $activated['message']], 200);
    }

    public function activateDeactiveAccountIndex()
    {
        return Inertia::render('Website/Profile/ActivateDeactiveAccount');
    }

    public function activateDeactiveAccountActive(Request $request)
    {
        $activated = $this->user->activateDeactiveAccount($request);

        if ($activated['status'] === false) {
            return response()->json(['status' => false, 'message' => $activated['message']], 400);
        }

        return response()->json(['status' => true, 'message' => $activated['message']], 200);
    }

    public function suspendAccountIndex()
    {
        return Inertia::render('Website/Profile/SuspendAccount');
    }

    public function emailChangeVerify(Request $request, ?string $token = null)
    {
        if (empty($token)) {
            return to_route('home');
        }

        $response = $this->customer->emailChangeVerify($request, $token);

        if ($response['status'] === false) {
            return to_route('home')->with('error', $response['message']);
        }

        return to_route('home')->with('success', $response['message']);
    }
}
