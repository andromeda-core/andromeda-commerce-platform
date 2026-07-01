<?php

namespace App\Repositories\Templates\Interface;

use Illuminate\Http\Request;

interface ITemplateRepository
{
    public function getAllTemplates(Request $request);

    public function getSingleTemplate(string $id);

    public function getSingleFormatedTemplateForEdit(string $id);

    public function storeTemplate(Request $request);

    public function updateTemplate(Request $request, string $id);

    public function destroyTemplate(string $id);

    public function destroyTemplateBySelection(Request $request);
}
