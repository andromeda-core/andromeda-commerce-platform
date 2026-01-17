<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;

class TranslationExport implements FromArray, WithHeadings
{
    public function __construct(
        protected array $data
    ) {}

    public function array(): array
    {
        return $this->data;
    }

    public function headings(): array
    {
        return [
            'language_code',
            'translation_key',
            'translation_value',
        ];
    }
}
