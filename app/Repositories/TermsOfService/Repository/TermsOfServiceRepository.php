<?php

namespace App\Repositories\TermsOfService\Repository;

use App\Models\TermsOfService;
use App\Repositories\TermsOfService\Interface\ITermsOfServiceRepository;

class TermsOfServiceRepository implements ITermsOfServiceRepository
{
    public function __construct(
        private TermsOfService $terms_of_service
    ) {}

    public function getTermsOfService()
    {
        $lang = app()->getLocale();

        if (empty($lang)) {
            return null;
        }

        return $this->terms_of_service
            ->where('is_active', true)
            ->whereHas('language', fn ($q) => $q->where('code', $lang))
            ->first();
    }
}
