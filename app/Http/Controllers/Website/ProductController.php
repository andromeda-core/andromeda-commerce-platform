<?php

namespace App\Http\Controllers\Website;

use App\Helpers\Trans;
use App\Http\Controllers\Controller;
use App\Repositories\Lodging\Interface\ILodgingProductRepository;
use App\Repositories\Products\Interface\IProductsRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        private IProductsRepository $product,
        private Trans $trans,
        private ILodgingProductRepository $lodging,
    ) {}

    public function getSingleSmartphone(
        Request $request,
        ?string $public_id = null,
        ?string $slug = null
    ) {


        $identifier = $public_id ?? $slug;

        if (empty($identifier)) {
            return response()->json([
                'status' => false,
                'message' => $this->trans->get('Identifier Not Found'),
            ], 404);
        }

        $data = $this->product->getSingleSmartphone($request, $identifier);
        if ($data['status'] === false) {
            return response()->json([
                'status' => false,
                'message' => $data['message'],
            ], 404);
        }

        if ($data['smartphone'] === null) {
            return response()->json([
                'status' => false,
                'message' => $this->trans->get('Smartphone Not Found'),
            ], 404);
        }

        return response()->json([
            'status' => true,
            'smartphone' => $data['smartphone'],
        ], 200);
    }

    public function getProductPreview(string $public_id): JsonResponse
    {
        $preview = $this->product->getProductPreview($public_id);

        return response()->json($preview);
    }

    /**
     * Stage 3.2 — single lodging property for the client-side feed fetch (direct_lodging deep-link).
     * Public (no auth); read-only. Mirrors getSingleSmartphone's response contract.
     */
    public function getSingleLodgingForFeed(
        Request $request,
        ?string $public_id = null,
        ?string $slug = null
    ) {
        $data = $this->lodging->getSingleLodgingForFeed($public_id, $slug);

        if (empty($data)) {
            return response()->json([
                'status'  => false,
                'message' => $this->trans->get('Lodging property not found'),
            ], 404);
        }

        return response()->json([
            'status'  => true,
            'lodging' => $data,
        ], 200);
    }
}
