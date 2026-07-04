<?php

namespace App\Repositories\AdBanners\Interface;

use Illuminate\Http\Request;

interface IAdBannerRepository
{
    public function getAllAdBanners(Request $request);

    public function getAllAdBannerNames();

    public function getSingleAdBanner(string $id);

    public function storeAdBanner(Request $request);

    public function updateAdBanner(Request $request, string $id);

    public function destroyAdBanner(string $id);

    public function destroyAdBannerBySelection(Request $request);

    public function getAdBannerPreview(string $public_id): array;
}
