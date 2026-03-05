<?php

namespace App\Jobs;

use App\Models\OrderRefund;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Str;

class OrderRefundProofUploadOnAWS implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private OrderRefund $order_refund,
        private array $files,
        private string $evidence_dir = 'OrderRefundProof/Evidence/',
        private string $return_packaging_dir = 'OrderRefundProof/ReturnPackaging/',
    ) {}

    public function handle(): void
    {
        if (! blank($this->files)) {

            $fullLocalPathDefectEvidenceVideo = Storage::disk('local')->path($this->files['defect_evidence_video']);
            $fullLocalPathReturnPackageVideo = Storage::disk('local')->path($this->files['return_Packaging_video']);

            $evidence_video_extension = pathinfo($this->files['defect_evidence_video'], PATHINFO_EXTENSION);
            $return_package_video_extension = pathinfo($this->files['return_Packaging_video'], PATHINFO_EXTENSION);

            $new_name_defect_evidence_video = time().uniqid().'-'.Str::random(10).'.'.$evidence_video_extension;
            $new_name_return_package_video = time().uniqid().'-'.Str::random(10).'.'.$return_package_video_extension;

            Storage::disk('s3')->put($this->evidence_dir.$new_name_defect_evidence_video, file_get_contents($fullLocalPathDefectEvidenceVideo), [
                'CacheControl' => 'public, max-age=31536000',
                'ContentType' => mime_content_type($fullLocalPathDefectEvidenceVideo),
            ]);

            Storage::disk('s3')->put($this->return_packaging_dir.$new_name_return_package_video, file_get_contents($fullLocalPathReturnPackageVideo), [
                'CacheControl' => 'public, max-age=31536000',
                'ContentType' => mime_content_type($fullLocalPathReturnPackageVideo),
            ]);

            Storage::disk('local')->delete($this->files['defect_evidence_video']);
            Storage::disk('local')->delete($this->files['return_Packaging_video']);

            $evidence_url = Storage::disk('s3')->url($this->evidence_dir.$new_name_defect_evidence_video);
            $return_package_url = Storage::disk('s3')->url($this->return_packaging_dir.$new_name_return_package_video);

            $this->order_refund->update([
                'defect_evidence_video' => $evidence_url,
                'return_packaging_video' => $return_package_url,
            ]);

        }
    }
}
