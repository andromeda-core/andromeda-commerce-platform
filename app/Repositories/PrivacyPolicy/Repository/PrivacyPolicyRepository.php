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

        $privacy_policy =  $this->privacy_policy
            ->where('is_active', true)
            ->whereHas('language', fn($q) => $q->where('code', $lang))
            ->first();

        if (!empty($privacy_policy)) {
            return $privacy_policy;
        }

        $privacy_policy = $this->privacy_policy
            ->where('is_active', true)
            ->first();

        return $privacy_policy;
    }
}
