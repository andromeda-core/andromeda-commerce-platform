<?php

namespace App\Repositories\InternalProductImage\Repository;

use App\Jobs\InternalProductImageDestroyOnAWS;
use App\Jobs\InternalProductImageStoreOnAWS;
use App\Models\InternalProductImage;
use App\Models\InternalProductImageFolder;
use App\Repositories\InternalProductImage\Interface\IInternalProductImageRepository;
use Exception;
use Illuminate\Http\Request;

class InternalProductImageRepository implements IInternalProductImageRepository
{
    private const S3_PARENT_FOLDER = 'Internal-Product-Images';

    public function __construct(
        private InternalProductImage $model,
    ) {}

    public function getAllInternalProductImages(Request $request)
    {
        return $this->model
            ->with('uploadedBy')
            ->when(!empty($request->input('search')), function ($query) use ($request) {
                $query->where('original_name', 'like', '%' . $request->input('search') . '%');
            })
            ->when(!empty($request->input('folder')), function ($query) use ($request) {
                $query->where('folder', $request->input('folder'));
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();
    }

    public function getFolders()
    {
        return InternalProductImageFolder::orderBy('name')->pluck('name');
    }

    public function createFolder(Request $request): array
    {
        $request->validate([
            'folder_name' => [
                'required',
                'string',
                'regex:/^[a-zA-Z0-9-]+$/',
                'max:100',
                'unique:internal_product_image_folders,name',
            ],
        ]);

        try {
            $name = strtolower($request->input('folder_name'));

            InternalProductImageFolder::create([
                'name' => $name,
                'created_by' => auth()->id(),
            ]);

            return [
                'status' => true,
                'message' => 'Folder created successfully',
                'folders' => $this->getFolders()->toArray(),
                'new_folder' => $name,
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
                'folders' => $this->getFolders()->toArray(),
                'new_folder' => null,
            ];
        }
    }

    public function storeInternalProductImage(Request $request): array
    {
        $request->validate([
            'folder' => ['required', 'string', 'regex:/^[a-zA-Z0-9-]+$/'],
            'images' => ['required', 'array', 'min:1'],
            'images.*' => ['required', 'image', 'mimes:jpg,jpeg,png,gif,webp', 'max:10240'],
        ]);

        try {
            foreach ($request->file('images') as $image) {
                $originalName = $image->getClientOriginalName();
                $localPath = $image->store('temp-uploads', 'local');

                $record = $this->model->create([
                    'original_name' => $originalName,
                    'folder' => $request->input('folder'),
                    'upload_status' => 'pending',
                    'uploaded_by' => auth()->id(),
                ]);

                InternalProductImageStoreOnAWS::dispatch(
                    $localPath,
                    $record,
                    self::S3_PARENT_FOLDER . '/' . $request->input('folder') . '/'
                );
            }

            return [
                'status' => true,
                'message' => 'Images queued for upload successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyInternalProductImage(string $id): array
    {
        try {
            $record = $this->model->find($id);

            if (empty($record)) {
                throw new Exception('Image Not Found');
            }

            if (!empty($record->file_path)) {
                InternalProductImageDestroyOnAWS::dispatch($record->file_path);
            }

            $record->delete();

            return [
                'status' => true,
                'message' => 'Image Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyInternalProductImageBySelection(Request $request): array
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please Select At Least One Image To Delete');
            }

            foreach ($ids as $id) {
                $response = $this->destroyInternalProductImage($id);

                if ($response['status'] === false) {
                    throw new Exception($response['message']);
                }
            }

            return [
                'status' => true,
                'message' => 'Selected Images Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
