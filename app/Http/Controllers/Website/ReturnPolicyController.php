<?php

namespace App\Http\Controllers\Website;

use App\Helpers\Trans;
use App\Http\Controllers\Controller;
use App\Repositories\ReturnPolicy\Interface\IReturnPolicyRepository;
use Inertia\Inertia;

class ReturnPolicyController extends Controller
{
    public function __construct(private IReturnPolicyRepository $return_policy, private Trans $trans) {}

    public function __invoke(?string $slug = null, ?string $smartphone_slug = null)
    {
        $return_policy = $this->return_policy->getReturnPolicy($slug);

        if (empty($smartphone_slug)) {
            return to_route('home')->with('error', $this->trans->get('Wrong Smartphone Selected'));
        }

        if (empty($return_policy)) {
            return to_route('home')->with('error', $this->trans->get('Return Policy Not Found'));
        }

        return Inertia::render('Website/ReturnPolicy/index', compact('return_policy', 'smartphone_slug'));
    }
}
