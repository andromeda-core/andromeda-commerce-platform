<?php

namespace App\Repositories\ProductLink\Repository;

use App\Models\ProductLink;
use App\Repositories\ProductLink\Interface\IProductLinkRepository;
use Exception;
use Illuminate\Http\Request;

class ProductLinkRepository implements IProductLinkRepository
{

    public function __construct(
        private ProductLink $productLink
    ) {}

    public function getAllProductLinks(Request $request)
    {
        return $this->productLink->with(['smartphone', 'user', 'post'])->latest()->paginate(10);
    }
    public function getSingleProductLink(string $id)
    {
        return $this->productLink->with(['smartphone', 'user', 'post'])->find($id);
    }
    public function storeProductLink(Request $request)
    {
        $validated_req = $request->validate([
            'smartphone_id' => 'required|exists:smartphones,id',
            'user_id' => 'required|exists:users,id',
            'post_id' => 'nullable|exists:posts,id',
        ]);


        $existing = $this->productLink
            ->where('smartphone_id', $validated_req['smartphone_id'])
            ->where('user_id', $validated_req['user_id'])
            ->where('status', 'active')
            ->first();

        if ($existing) {
            $existing->update(['status' => 'revoked']);
        }

        try {
            $created = $this->productLink->create($validated_req);

            if (empty($created)) {
                throw new Exception('Failed to create product link');
            }

            return [
                'status' => true,
                'message' => 'Product link created successfully',
            ];
        } catch (\Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    public function updateProductLink(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'smartphone_id' => 'required|exists:smartphones,id',
            'user_id' => 'required|exists:users,id',
            'post_id' => 'nullable|exists:posts,id',
            'status' => 'in:active,paused,revoked',
        ]);

        try {

            $existing = $this->productLink
                ->where('smartphone_id', $validated_req['smartphone_id'])
                ->where('user_id', $validated_req['user_id'])
                ->where('status', 'active')
                ->where('id', '!=', $id)
                ->first();

            if ($existing) {
                $existing->update(['status' => 'revoked']);
            }

            $product_link = $this->productLink->find($id);

            if (empty($product_link)) {
                throw new Exception('Product link not found');
            }




            $product_link->update($validated_req);

            $updated = $product_link->update($validated_req);

            if (!$updated) {
                throw new Exception('Failed to update product link');
            }

            return [
                'status' => true,
                'message' => 'Product link updated successfully',
            ];
        } catch (\Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    public function destroyProductLink(string $id)
    {
        try {
            $product_link = $this->productLink->find($id);

            if (empty($product_link)) {
                throw new Exception('Product link not found');
            }

            $deleted = $product_link->delete();

            if (!$deleted) {
                throw new Exception('Failed to delete product link');
            }

            return [
                'status' => true,
                'message' => 'Product link deleted successfully',
            ];
        } catch (\Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage()
            ];
        }
    }


    public function destroyProductLinkBySelection(Request $request)
    {
        try {

            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception("Please Select Atleast One Product Link");
            }

            $deleted = $this->productLink->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Failed to delete product links');
            }

            return [
                'status' => true,
                'message' => 'Product links deleted successfully',
            ];
        } catch (\Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}
