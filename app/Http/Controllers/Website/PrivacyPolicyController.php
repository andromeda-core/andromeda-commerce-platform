<?php

namespace App\Http\Controllers\Website;

use App\Helpers\Trans;
use App\Http\Controllers\Controller;
use App\Repositories\PrivacyPolicy\Interface\IPrivacyPolicyRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PrivacyPolicyController extends Controller
{
    public function __construct(
        private IPrivacyPolicyRepository $privacy_policy,
        private Trans $trans
    ) {}

    public function __invoke(Request $request)
    {

        $privacy_policy = $this->privacy_policy->getPrivacyPolicy();

        if (empty($privacy_policy)) {
            return to_route('home')->with('info', $this->trans->get('Privacy Policy Not Found'));
        }

        return Inertia::render('Website/PrivacyPolicy/index', compact('privacy_policy'));
    }
}
