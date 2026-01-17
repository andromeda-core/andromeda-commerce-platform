<?php

namespace App\Imports;

use App\Repositories\TranslationSystem\Translations\Repository\TranslationRepository;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class TranslationImport implements ToCollection, WithHeadingRow
{
    public function __construct(
        protected TranslationRepository $repository,
        protected int $languageId
    ) {}

    public function collection(Collection $rows)
    {
        $this->repository->processTranslationImportExcelRows(
            $this->languageId,
            $rows
        );
    }
}
