<?php

namespace App\Http\Controllers\Website;

use App\Helpers\Trans;
use App\Http\Controllers\Controller;
use App\Repositories\Products\Interface\IProductsRepository;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(private IProductsRepository $product, private Trans $trans) {}

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
}
