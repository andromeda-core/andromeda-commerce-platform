<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Repositories\Products\Interface\IProductsRepository;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(private IProductsRepository $product) {}

    public function getSingleSmartphone(Request $request, ?string $slug = null)
    {

        if (empty($slug)) {
            return response()->json([
                'status' => false,
                'message' => 'Slug Not Found',
            ], 404);
        }

        $data = $this->product->getSingleSmartphone($request, $slug);
        if ($data['status'] === false) {
            return response()->json([
                'status' => false,
                'message' => $data['message'],
            ], 404);
        }

        if ($data['smartphone'] === null) {
            return response()->json([
                'status' => false,
                'message' => 'Smartphone Not Found',
            ], 404);
        }

        return response()->json([
            'status' => true,
            'smartphone' => $data['smartphone'],
        ], 200);

    }
}
