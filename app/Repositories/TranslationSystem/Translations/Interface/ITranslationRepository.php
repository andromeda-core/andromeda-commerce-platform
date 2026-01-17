<?php

namespace App\Repositories\TranslationSystem\Translations\Interface;

use Illuminate\Http\Request;

interface ITranslationRepository
{
    public function getAllTranslations(?string $language_code = null);

    public function saveTranslations(Request $request);

    public function getLanguageTranslations(Request $request);

    public function getAllKeysAndLanguageIDForExcelExport(?string $language_id = null);

    public function getExcelFileToImportTranslations(Request $request);
}
