<?php

namespace App\Repositories\TranslationSystem\Language\Interface;

use Illuminate\Http\Request;

interface ILanguageRepository
{
    public function getAllLanguages();

    public function getLanguageByCode(string $code);

    public function getSingleLanguageById(string $id);

    public function storeLanguage(Request $request);

    public function updateLanguage(Request $request, string $id);

    public function destroyLanguage(string $id);

    public function destroyLanguageBySelection(Request $request);

    public function getAllLanguagesWithTranslationsWithoutPagination(Request $request);

    public function getAllLanguagesWithoutPagination();

    public function setLanguageLocale(Request $request);
}
