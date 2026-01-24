<?php

namespace App\Http\Controllers\Website;

use App\Helpers\Trans;
use App\Http\Controllers\Controller;
use App\Repositories\TermsOfService\Interface\ITermsOfServiceRepository;
use Inertia\Inertia;

class TermsOfServiceController extends Controller
{
    public function __construct(
        private ITermsOfServiceRepository $terms_of_service
    ) {}

    public function __invoke()
    {
        $terms_of_service = $this->terms_of_service->getTermsOfService();

        if (empty($terms_of_service)) {
            return to_route('home')->with('info', Trans::get('Terms Of Service Not Found'));
        }

        return Inertia::render('Website/TermsOfService/index', compact('terms_of_service'));
    }
}
