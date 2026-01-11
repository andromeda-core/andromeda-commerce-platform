<?php

namespace App\Repositories\TranslationSystem\TranslationKey\Interface;

use Illuminate\Http\Request;

interface ITranslationKeyRepository
{
    public function getAllTranslationKeys();

    public function getSingleTranslationKey(string $id);

    public function storeTranslationKey(Request $request);

    public function updateTranslationKey(Request $request, string $id);

    public function destroyTranslationKey(string $id);

    public function destroyTranslationKeysBySelection(Request $request);

    public function getAllTranslationKeysWithoutPagination();
}
