<?php

namespace App\Repositories\ShippingPolicy\Interface;

interface IShippingPolicyRepository
{
    public function getShippingPolicy(?string $slug = null);
}
