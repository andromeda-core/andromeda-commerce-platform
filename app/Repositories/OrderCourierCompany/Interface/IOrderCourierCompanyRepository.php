<?php

namespace App\Repositories\OrderCourierCompany\Interface;

use Illuminate\Http\Request;

interface IOrderCourierCompanyRepository
{
    public function getAll(Request $request);
    public function create();
    public function store(Request $request);
    public function edit(string $id);
    public function update(Request $request, string $id);
    public function destroy(string $id);
    public function destroyBySelection(Request $request);
    public function toggleStatus(string $id);
    public function getAllWithoutPagination();
}
