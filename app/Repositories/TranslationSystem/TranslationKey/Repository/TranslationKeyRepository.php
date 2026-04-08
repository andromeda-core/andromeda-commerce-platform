<?php

namespace App\Repositories\TranslationSystem\TranslationKey\Repository;

use App\Models\TranslationKey;
use App\Repositories\TranslationSystem\TranslationKey\Interface\ITranslationKeyRepository;
use Exception;
use Illuminate\Http\Request;

class TranslationKeyRepository implements ITranslationKeyRepository
{
    public function __construct(
        private TranslationKey $translation_key
    ) {}

    public function getAllTranslationKeys(Request $request)
    {
        $search = $request->string('search')->trim();
        $translation_keys = $this->translation_key
            ->when($search, fn ($q) => $q->where('key', 'like', "%{$search}%"))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $translation_keys;
    }

    public function getSingleTranslationKey(string $id)
    {
        $translation_key = $this->translation_key->find($id);

        return $translation_key;
    }

    public function storeTranslationKey(Request $request)
    {
        $validated_req = $request->validate([
            'key' => ['required', 'string', 'unique:translation_keys,key'],
        ]);

        try {
            $created = $this->translation_key->create($validated_req);

            if (empty($created)) {
                throw new Exception('Something Went Wrong While Creating Translation Key');
            }

            return [
                'status' => true,
                'message' => 'Translation Key Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateTranslationKey(Request $request, string $id)
    {
        $translation_key = $this->getSingleTranslationKey($id);

        if (empty($translation_key)) {
            return [
                'status' => false,
                'message' => 'Translation Key Not Found',
            ];
        }

        $validated_req = $request->validate([
            'key' => ['required', 'string', 'unique:translation_keys,key,'.$translation_key->id],
        ]);

        try {
            $updated = $translation_key->update($validated_req);

            if (! $updated) {
                throw new Exception('Something Went Wrong While Updating Translation Key');
            }

            return [
                'status' => true,
                'message' => 'Translation Key Updated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyTranslationKey(string $id)
    {
        $translation_key = $this->getSingleTranslationKey($id);

        try {
            if (empty($translation_key)) {
                throw new Exception('Translation Key Not Found');
            }

            $deleted = $translation_key->delete();

            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Translation Key');
            }

            return [
                'status' => true,
                'message' => 'Translation Key Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyTranslationKeysBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Something Went Wrong While Deleting Translation Key');
            }

            $deleted = $this->translation_key->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Something Went Wrong While Deleting Translation Key');
            }

            return [
                'status' => true,
                'message' => 'Translation Key Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getAllTranslationKeysWithoutPagination()
    {
        $translation_keys = $this->translation_key->latest()->get();

        return $translation_keys;
    }
}
