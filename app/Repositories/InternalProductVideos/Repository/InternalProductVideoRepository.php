<?php

namespace App\Repositories\InternalProductVideos\Repository;

use App\Jobs\InternalProductVideoDestroyOnAWS;
use App\Jobs\InternalProductVideoStoreOnAWS;
use App\Models\InternalProductVideo;
use App\Models\InternalProductVideoFolder;
use App\Repositories\InternalProductVideos\Interface\IInternalProductVideoRepository;
use Exception;
use Illuminate\Http\Request;

class InternalProductVideoRepository implements IInternalProductVideoRepository
{
    private const S3_PARENT_FOLDER = 'Internal-Product-Videos';

    public function __construct(
        private InternalProductVideo $model,
    ) {}

    public function getAllInternalProductVideos(Request $request)
    {
        return $this->model
            ->with('uploadedBy')
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $query->where('original_name', 'like', '%'.$request->input('search').'%');
            })
            ->when(! empty($request->input('folder')), function ($query) use ($request) {
                $query->where('folder', $request->input('folder'));
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }

    public function getFolders()
    {
        return InternalProductVideoFolder::orderBy('name')->pluck('name');
    }

    public function createFolder(Request $request): array
    {
        $request->validate([
            'folder_name' => [
                'required',
                'string',
                'regex:/^[a-zA-Z0-9-]+$/',
                'max:100',
                'unique:internal_product_video_folders,name',
            ],
        ]);

        try {
            $name = strtolower($request->input('folder_name'));

            InternalProductVideoFolder::create([
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

    public function storeInternalProductVideo(Request $request): array
    {
        $request->validate([
            'folder' => ['required', 'string', 'regex:/^[a-zA-Z0-9-]+$/'],
            'videos' => ['required', 'array', 'min:1'],
            // Video-specific rule: allow mp4/webm/mov/avi up to 1GB (max is in KB -> 1048576 = 1GB).
            // The infra already accepts 1GB single-POST uploads (see Smartphone module), so no chunked upload.
            'videos.*' => ['required', 'file', 'mimetypes:video/mp4,video/webm,video/quicktime,video/x-msvideo', 'mimes:mp4,webm,mov,avi', 'max:1048576'],
        ]);

        try {
            foreach ($request->file('videos') as $video) {
                $originalName = $video->getClientOriginalName();
                $localPath = $video->store('temp-uploads', 'local');

                $record = $this->model->create([
                    'original_name' => $originalName,
                    'folder' => $request->input('folder'),
                    'upload_status' => 'pending',
                    'uploaded_by' => auth()->id(),
                ]);

                InternalProductVideoStoreOnAWS::dispatch(
                    $localPath,
                    $record,
                    self::S3_PARENT_FOLDER.'/'.$request->input('folder').'/'
                );
            }

            return [
                'status' => true,
                'message' => 'Videos queued for upload successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyInternalProductVideo(string $id): array
    {
        try {
            $record = $this->model->find($id);

            if (empty($record)) {
                throw new Exception('Video Not Found');
            }

            // Safety net: do not delete while the S3 upload Job is still running (pending). Otherwise the
            // queued upload can complete afterwards and leave an orphaned file on S3 with no DB row. This
            // also guards destroyInternalProductVideoBySelection, which delegates to this method.
            if ($record->upload_status === 'pending') {
                throw new Exception('Please wait until the upload finishes');
            }

            if (! empty($record->file_path)) {
                InternalProductVideoDestroyOnAWS::dispatch($record->file_path);
            }

            $record->delete();

            return [
                'status' => true,
                'message' => 'Video Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyInternalProductVideoBySelection(Request $request): array
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please Select At Least One Video To Delete');
            }

            foreach ($ids as $id) {
                $response = $this->destroyInternalProductVideo($id);

                if ($response['status'] === false) {
                    throw new Exception($response['message']);
                }
            }

            return [
                'status' => true,
                'message' => 'Selected Videos Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
