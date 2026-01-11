<?php

namespace App\Repositories\TranslationSystem\Language\Repository;

use App\Models\Language;
use App\Models\Translation;
use App\Repositories\TranslationSystem\Language\Interface\ILanguageRepository;
use App\Repositories\TranslationSystem\Translations\Interface\ITranslationRepository;
use Exception;
use Illuminate\Http\Request;

class LanguageRepository implements ILanguageRepository
{
    public function __construct(
        private Language $language,
        private Translation $translation,
        private ITranslationRepository $translation_repo
    ) {}

    public function getAllLanguages()
    {
        $languages = $this->language->latest()->paginate(10);

        return $languages;
    }

    public function getLanguageByCode(string $code) {}

    public function getSingleLanguageById(string $id)
    {
        $language = $this->language->find($id);

        return $language;

    }

    public function storeLanguage(Request $request)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:255'],
        ]);

        try {
            $language = $this->language->create($validated_req);

            if (empty($language)) {
                throw new Exception('Something went wrong While Creating Language');
            }

            return [
                'status' => true,
                'message' => 'Language Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }

    }

    public function updateLanguage(Request $request, string $id)
    {
        if (empty($id)) {
            return [
                'status' => false,
                'message' => 'Something went wrong While Updating Language',
            ];
        }

        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:255'],
        ]);

        try {
            $language = $this->getSingleLanguageById($id);

            if (empty($language)) {
                throw new Exception('Language Not Found');
            }

            $updated = $language->update($validated_req);

            if (! $updated) {
                throw new Exception('Something went wrong While Updating Language');
            }

            return [
                'status' => true,
                'message' => 'Language Updated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyLanguage(string $id)
    {
        try {
            $language = $this->getSingleLanguageById($id);

            if (empty($language)) {
                throw new Exception('Language Not Found');
            }

            $deleted = $language->delete();

            if (! $deleted) {
                throw new Exception('Something went wrong While Deleting Language');
            }

            return [
                'status' => true,
                'message' => 'Language Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyLanguageBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Something Went Wrong While Deleting User');
            }

            $deleted = $this->language->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Something Went Wrong While Deleting Language');
            }

            return [
                'status' => true,
                'message' => 'Language Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getAllLanguagesWithTranslationsWithoutPagination(Request $request)
    {

        $languages = $this->language->latest()->select('id', 'name', 'code')->get();

        $translations = $this->translation_repo->getLanguageTranslations($request);

        return [
            'languages' => $languages,
            'translations' => $translations,
        ];
    }

    public function getAllLanguagesWithoutPagination()
    {
        $languages = $this->language->latest()->select('id', 'name', 'code')->get();

        return $languages;

    }

    public function setLanguageLocale(Request $request)
    {
        // if User Not Authenticated We will use Cookie Just
        if (! $request->user()) {
            return [
                'status' => true,
                'message' => 'Language Locale Set Successfully',
            ];
        }

        try {
            $request->user()->update([
                'language_id' => $request->language_id,
                'language_locale' => $request->language_locale,
            ]);

            return [
                'status' => true,
                'message' => 'Language Locale Set Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
