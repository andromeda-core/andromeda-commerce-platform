<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Repositories\AdBanners\Interface\IAdBannerRepository;
use Illuminate\Http\JsonResponse;

/**
 * Public (no auth, no permission gate) — needed so the ad-banner embed marker can hydrate
 * on posts visible to guests. Deliberately separate from Dashboard\AdBannerController
 * (which lives inside the auth-gated dashboard route group and is fully permission-gated).
 * Mirrors ProductController::getProductPreview's placement/contract exactly.
 */
class AdBannerController extends Controller
{
    public function __construct(
        private IAdBannerRepository $adBanner
    ) {}

    public function preview(string $public_id): JsonResponse
    {
        $preview = $this->adBanner->getAdBannerPreview($public_id);

        return response()->json($preview);
    }
}
