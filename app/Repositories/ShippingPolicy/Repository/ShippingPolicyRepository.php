<?php

namespace App\Repositories\ShippingPolicy\Repository;

use App\Models\ShippingPolicy;
use App\Repositories\ShippingPolicy\Interface\IShippingPolicyRepository;

class ShippingPolicyRepository implements IShippingPolicyRepository
{
    public function __construct(
        private ShippingPolicy $shipping_policy
    ) {}

    public function getShippingPolicy(?string $slug = null)
    {
        $lang = app()->getLocale();


        if (empty($slug) && empty($lang)) {
            return null;
        }

        $shipping_policy =  $this->shipping_policy
            ->where('slug', $slug)
            ->where('is_active', true)
            ->whereHas('language', fn($q) => $q->where('code', $lang))
            ->first();


        if (!empty($shipping_policy)) {
            return $shipping_policy;
        }


        $shipping_policy =  $this->shipping_policy
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();


        return $shipping_policy;
    }
}
