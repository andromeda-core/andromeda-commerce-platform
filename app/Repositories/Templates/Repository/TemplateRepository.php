<?php

namespace App\Repositories\Templates\Repository;

use App\Models\Template;
use App\Repositories\Templates\Interface\ITemplateRepository;
use App\Services\TemplateTranslationService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class TemplateRepository implements ITemplateRepository
{
    public function __construct(
        private Template $template,
        private TemplateTranslationService $templateTranslationService
    ) {}

    public function getAllTemplates(Request $request)
    {
        $templates = $this->template
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $query->where('title', 'like', '%'.$request->input('search').'%');
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $templates;
    }

    public function getSingleTemplate(string $id)
    {
        return $this->template->find($id);
    }

    public function getSingleFormatedTemplateForEdit(string $id)
    {
        $template = $this->template->with('templateTranslations')->find($id);

        if (empty($template)) {
            return null;
        }

        // Group the isolated template_translations into the repeater shape:
        // [{ language_id, fields: { content: '...' } }] (mirrors the Smartphone edit round-trip).
        $existingTranslations = $template->templateTranslations
            ->groupBy('language_id')
            ->map(function ($rows, $languageId) {
                $fields = [];
                foreach ($rows as $row) {
                    $fields[$row->field] = $row->value;
                }

                return [
                    'language_id' => (int) $languageId,
                    'fields' => $fields,
                ];
            })
            ->values();

        return [
            'template' => $template,
            'existingTranslations' => $existingTranslations,
        ];
    }

    public function storeTemplate(Request $request)
    {
        $validated_req = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'min:20'],
            'status' => ['sometimes', 'boolean'],
        ]);

        // Light, non-breaking validation for optional manual content translations.
        // Validated separately so the `translations` key never leaks into create() under strict mode.
        $translationsValidator = Validator::make($request->all(), [
            'translations' => ['sometimes', 'array'],
            'translations.*.language_id' => ['required_with:translations', 'integer', 'exists:languages,id'],
            'translations.*.fields' => ['sometimes', 'array'],
        ]);

        if ($translationsValidator->fails()) {
            throw ValidationException::withMessages([
                'translation_error' => $translationsValidator->errors()->first(),
            ]);
        }

        try {
            $template = $this->template->create($validated_req);

            if (empty($template)) {
                throw new Exception('Something Went Wrong While Creating Template');
            }

            // Isolated translations sync (writes ONLY to template_translations).
            $this->templateTranslationService->syncTranslations(
                $template,
                (array) ($request->input('translations') ?? []),
                true
            );

            return [
                'status' => true,
                'message' => 'Template Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateTemplate(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'min:20'],
            'status' => ['sometimes', 'boolean'],
        ]);

        $translationsValidator = Validator::make($request->all(), [
            'translations' => ['sometimes', 'array'],
            'translations.*.language_id' => ['required_with:translations', 'integer', 'exists:languages,id'],
            'translations.*.fields' => ['sometimes', 'array'],
        ]);

        if ($translationsValidator->fails()) {
            throw ValidationException::withMessages([
                'translation_error' => $translationsValidator->errors()->first(),
            ]);
        }

        try {
            $template = $this->template->find($id);

            if (empty($template)) {
                throw new Exception('Template Not Found');
            }

            $updated = $template->update($validated_req);

            if (! $updated) {
                throw new Exception('Something Went Wrong While Updating Template');
            }

            $this->templateTranslationService->syncTranslations(
                $template,
                (array) ($request->input('translations') ?? []),
                true
            );

            return [
                'status' => true,
                'message' => 'Template Updated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyTemplate(string $id)
    {
        try {
            $template = $this->template->find($id);

            if (empty($template)) {
                throw new Exception('Template Not Found');
            }

            // template_translations rows are removed automatically via cascadeOnDelete().
            $deleted = $template->delete();

            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Template');
            }

            return [
                'status' => true,
                'message' => 'Template Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyTemplateBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');
            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Template');
            }

            $templates = $this->template->whereIn('id', $ids)->get();
            if ($templates->isEmpty()) {
                throw new Exception('Given Template Ids Are incorrect');
            }

            foreach ($templates as $template) {
                $response = $this->destroyTemplate($template->id);
                if ($response['status'] === false) {
                    throw new Exception($response['message']);
                }
            }

            return [
                'status' => true,
                'message' => 'Templates Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
