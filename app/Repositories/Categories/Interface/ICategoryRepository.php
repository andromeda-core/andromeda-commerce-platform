<?php

namespace App\Repositories\Categories\Interface;

use Illuminate\Http\Request;

interface ICategoryRepository
{
    public function getAllCategories(Request $request);

    public function getSingleCategory(string $id);

    public function storeCategory(Request $request);

    public function updateCategory(Request $request, string $id);

    public function destroyCategory(string $id);

    public function destroyCategoryBySelection(Request $request);

    public function getDistributors();

    public function getAllCategoryNames();
}
