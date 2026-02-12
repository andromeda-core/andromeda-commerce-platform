<?php

namespace App\Jobs;

use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Str;

class UploadFinalAttachmentsToAWS implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private array $files,
        private Order $order,
        private $final_attachments_dir = 'Orders/FinalAttachments/',
    ) {}

    public function handle(): void
    {
        $final_attachments = [];

        foreach ($this->files as $file) {
            $fullLocalPath = Storage::disk('local')->path($file['file_path']);
            $extension = pathinfo($file['file_path'], PATHINFO_EXTENSION);
            $new_name = time().uniqid().'-'.Str::random(10).'.'.$extension;
            Storage::disk('s3')->put($this->final_attachments_dir.$new_name, file_get_contents($fullLocalPath));
            Storage::disk('local')->delete($file['file_path']);

            $url = Storage::disk('s3')->url($this->final_attachments_dir.$new_name);

            $final_attachments[] = [
                'name' => $file['file'],
                'url' => $url,
            ];
        }

        if (! blank($final_attachments)) {
            $this->order->update(['final_attachments' => $final_attachments]);
        }
    }
}
