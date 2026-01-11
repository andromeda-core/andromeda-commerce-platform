<?php

namespace App\Repositories\ReturnPolicy\Repository;

use App\Models\ReturnPolicy;
use App\Repositories\ReturnPolicy\Interface\IReturnPolicyRepository;

class ReturnPolicyRepository implements IReturnPolicyRepository
{
    public function __construct(
        private ReturnPolicy $return_policy
    ) {}

    public function getReturnPolicy(?string $slug = null)
    {
        $lang = app()->getLocale();

        if (empty($slug) && empty($lang)) {
            return null;
        }

        return $this->return_policy
            ->where('slug', $slug)
            ->where('is_active', true)
            ->whereHas('language', fn ($q) => $q->where('code', $lang))
            ->first();
    }
}
