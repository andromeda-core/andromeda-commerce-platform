<?php

namespace App\Repositories\ReturnPolicy\Interface;

interface IReturnPolicyRepository
{
    public function getReturnPolicy(?string $slug = null);
}
