<?php

namespace App\Repositories\AdBanners\Repository;

use App\Jobs\AdBannerImageStoreOnAWS;
use App\Jobs\AdBannerVideoStoreOnAWS;
use App\Jobs\InternalProductVideoDestroyOnAWS;
use App\Models\AdBanner;
use App\Repositories\AdBanners\Interface\IAdBannerRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;
use Str;

class AdBannerRepository implements IAdBannerRepository
{
    public function __construct(
        private AdBanner $model,
    ) {}

    public function getAllAdBanners(Request $request)
    {
        return $this->model
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $query->where('name', 'like', '%'.$request->input('search').'%');
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }

    public function getSingleAdBanner(string $id)
    {
        return $this->model->find($id);
    }

    // Lightweight list for the Posts editor's "Add Ad Banner" picker (mirrors
    // CategoryRepository::getAllCategoryNames()). Only fully-uploaded banners are offered,
    // so a post author can never embed one that is still processing or failed.
    public function getAllAdBannerNames()
    {
        return $this->model
            ->where('upload_status', 'completed')
            ->select('id', 'public_id', 'name', 'media_type')
            ->orderBy('name')
            ->get();
    }

    public function storeAdBanner(Request $request)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'media_type' => ['required', 'string', 'in:image,video'],
            'redirect_url' => ['required', 'url', 'max:2048'],
            // Video-specific rule mirrors InternalProductVideoRepository: mp4/webm/mov/avi up to 1GB.
            'media' => $request->input('media_type') === 'video'
                ? ['required', 'file', 'mimetypes:video/mp4,video/webm,video/quicktime,video/x-msvideo', 'mimes:mp4,webm,mov,avi', 'max:1048576']
                : ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ], [
            'name.required' => 'Ad banner name is required',
            'media_type.required' => 'Media type is required',
            'media_type.in' => 'Media type must be image or video',
            'redirect_url.required' => 'Redirect URL is required',
            'redirect_url.url' => 'Redirect URL must be a valid URL',
            'media.required' => 'Please upload the banner media',
        ]);

        try {
            $created = $this->model->create([
                'name' => $validated_req['name'],
                'media_type' => $validated_req['media_type'],
                'redirect_url' => $validated_req['redirect_url'],
                'upload_status' => 'pending',
                'uploaded_by' => auth()->id(),
            ]);

            if (empty($created)) {
                throw new Exception('Something Went Wrong While Creating Ad Banner');
            }

            if ($request->hasFile('media')) {
                $file = $request->file('media');
                $created->update(['original_name' => $file->getClientOriginalName()]);

                if ($validated_req['media_type'] === 'image') {
                    $this->queueImageUpload($file, $created);
                } else {
                    $this->queueVideoUpload($file, $created);
                }
            }

            return [
                'status' => true,
                'message' => 'Ad Banner Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateAdBanner(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'media_type' => ['required', 'string', 'in:image,video'],
            'redirect_url' => ['required', 'url', 'max:2048'],
            'media' => $request->hasFile('media')
                ? ($request->input('media_type') === 'video'
                    ? ['file', 'mimetypes:video/mp4,video/webm,video/quicktime,video/x-msvideo', 'mimes:mp4,webm,mov,avi', 'max:1048576']
                    : ['file', 'mimes:jpg,jpeg,png,webp', 'max:5120'])
                : ['nullable'],
        ], [
            'name.required' => 'Ad banner name is required',
            'media_type.required' => 'Media type is required',
            'media_type.in' => 'Media type must be image or video',
            'redirect_url.required' => 'Redirect URL is required',
            'redirect_url.url' => 'Redirect URL must be a valid URL',
        ]);

        try {
            $adBanner = $this->model->find($id);

            if (empty($adBanner)) {
                throw new Exception('Ad Banner Not Found');
            }

            $updated = $adBanner->update([
                'name' => $validated_req['name'],
                'media_type' => $validated_req['media_type'],
                'redirect_url' => $validated_req['redirect_url'],
            ]);

            if (! $updated) {
                throw new Exception('Something Went Wrong While Updating Ad Banner');
            }

            if ($request->hasFile('media')) {
                // Replacing existing media: remove the old S3 file via the existing generic
                // destroy job (reused as-is, never forked — same job Internal Product Videos uses).
                if (! empty($adBanner->file_path)) {
                    InternalProductVideoDestroyOnAWS::dispatch($adBanner->file_path);
                }

                $file = $request->file('media');
                $adBanner->update([
                    'original_name' => $file->getClientOriginalName(),
                    'upload_status' => 'pending',
                ]);

                if ($validated_req['media_type'] === 'image') {
                    $this->queueImageUpload($file, $adBanner);
                } else {
                    $this->queueVideoUpload($file, $adBanner);
                }
            }

            return [
                'status' => true,
                'message' => 'Ad Banner Updated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyAdBanner(string $id)
    {
        try {
            $adBanner = $this->model->find($id);

            if (empty($adBanner)) {
                throw new Exception('Ad Banner Not Found');
            }

            // Safety net: do not delete while the S3 upload Job is still running (pending),
            // mirrors InternalProductVideoRepository::destroyInternalProductVideo exactly.
            if ($adBanner->upload_status === 'pending') {
                throw new Exception('Please wait until the upload finishes');
            }

            if (! empty($adBanner->file_path)) {
                InternalProductVideoDestroyOnAWS::dispatch($adBanner->file_path);
            }

            $deleted = $adBanner->delete();

            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Ad Banner');
            }

            return [
                'status' => true,
                'message' => 'Ad Banner Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyAdBannerBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please Select At Least One Ad Banner To Delete');
            }

            $adBanners = $this->model->whereIn('id', $ids)->get();

            if ($adBanners->isEmpty()) {
                throw new Exception('Given Ad Banner Ids Are Incorrect');
            }

            foreach ($adBanners as $adBanner) {
                $response = $this->destroyAdBanner($adBanner->id);
                if ($response['status'] === false) {
                    throw new Exception($response['message']);
                }
            }

            return [
                'status' => true,
                'message' => 'Selected Ad Banners Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getAdBannerPreview(string $public_id): array
    {
        $adBanner = $this->model->where('public_id', $public_id)->first();

        if (! $adBanner || $adBanner->upload_status !== 'completed') {
            return [
                'exists' => false,
                'public_id' => $public_id,
            ];
        }

        return [
            'exists' => true,
            'public_id' => $adBanner->public_id,
            'name' => $adBanner->name,
            'media_type' => $adBanner->media_type,
            'file_url' => $adBanner->file_url,
            'redirect_url' => $adBanner->redirect_url,
        ];
    }

    // Mirrors CategoryRepository::storeCategory's thumbnail flow exactly: resize/webp-encode
    // synchronously, write to temp disk, then queue the (new, dedicated) S3 job.
    private function queueImageUpload($file, AdBanner $adBanner): void
    {
        $new_name = time().uniqid().'-'.Str::random(10).'.webp';

        $resizedImage = ImageManager::imagick()
            ->read($file)
            ->scaleDown(1800)
            ->encode(new WebpEncoder(quality: 70));

        $tempPath = 'temp/uploads/'.$new_name;
        Storage::disk('local')->put($tempPath, (string) $resizedImage);

        dispatch(new AdBannerImageStoreOnAWS($tempPath, $adBanner));
    }

    // Mirrors InternalProductVideoRepository::storeInternalProductVideo's queued flow exactly.
    private function queueVideoUpload($file, AdBanner $adBanner): void
    {
        $localPath = $file->store('temp-uploads', 'local');

        dispatch(new AdBannerVideoStoreOnAWS($localPath, $adBanner));
    }
}
