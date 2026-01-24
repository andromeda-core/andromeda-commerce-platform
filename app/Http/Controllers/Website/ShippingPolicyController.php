<?php

namespace App\Http\Controllers\Website;

use App\Helpers\Trans;
use App\Http\Controllers\Controller;
use App\Repositories\ShippingPolicy\Interface\IShippingPolicyRepository;
use Inertia\Inertia;

class ShippingPolicyController extends Controller
{
    public function __construct(
        private IShippingPolicyRepository $shipping_policy
    ) {}

    public function __invoke(?string $slug = null, ?string $smartphone_slug = null)
    {
        $shipping_policy = $this->shipping_policy->getShippingPolicy($slug);

        if (empty($smartphone_slug)) {
            return to_route('home')->with('error', Trans::get('Wrong Smartphone Selected'));
        }

        if (empty($shipping_policy)) {
            return to_route('home')->with('error', Trans::get('Shipping Policy Not Found'));
        }

        return Inertia::render('Website/ShippingPolicy/index', compact('shipping_policy', 'smartphone_slug'));
    }
}
