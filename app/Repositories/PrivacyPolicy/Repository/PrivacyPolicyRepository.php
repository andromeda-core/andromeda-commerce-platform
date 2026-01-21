<?php

namespace App\Repositories\PrivacyPolicy\Repository;

use App\Models\PrivacyPolicy;
use App\Repositories\PrivacyPolicy\Interface\IPrivacyPolicyRepository;

class PrivacyPolicyRepository implements IPrivacyPolicyRepository
{
    public function __construct(
        private PrivacyPolicy $privacy_policy
    ) {}

    public function getPrivacyPolicy()
    {
        $lang = app()->getLocale();

        if (empty($lang)) {
            return null;
        }

        return $this->privacy_policy
            ->where('is_active', true)
            ->whereHas('language', fn ($q) => $q->where('code', $lang))
            ->first();
    }
}
