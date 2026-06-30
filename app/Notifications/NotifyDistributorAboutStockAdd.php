<?php

namespace App\Notifications;

use App\Models\Inventory;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NotifyDistributorAboutStockAdd extends Notification implements ShouldQueue
{
    use Queueable;

    private int $inventoryId;

    public function __construct(Inventory $inventory)
    {
        $this->inventoryId = $inventory->id;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $inventory = Inventory::find($this->inventoryId);

        // Handle case where inventory no longer exists
        if (! $inventory) {
            return (new MailMessage)
                ->subject('Stock Update')
                ->line('This stock entry is no longer available.');
        }

        $smartphone = $inventory->smartphone;
        $category = $smartphone?->category;
        $distributor = $category?->distributor?->user;
        $modelName = $smartphone?->model_name?->name ?? 'N/A';

        $imei1 = $inventory->imei1 ?? 'N/A';
        $imei2 = $inventory->imei2 ?? 'N/A';
        $serialNo = $inventory->serial_no ?? 'N/A';
        $eid = $inventory->eid ?? 'N/A';
        $batchName = $inventory->batch->batch_name ?? 'N/A';

        $distributorName = $distributor?->name ?? 'Distributor';

        return (new MailMessage)
            ->subject('New Stock Registered Against Your Distribution')
            ->greeting('Hello '.$distributorName.',')
            ->line('A new inventory item has been registered in the system under your assigned product category.')
            ->line('Please find the stock details below:')
            ->line('**Product:** '.$modelName)
            ->line('**Batch Name:** '.$batchName)
            ->line('**IMEI 1:** '.$imei1)
            ->line('**IMEI 2:** '.$imei2)
            ->line('**Serial Number:** '.$serialNo)
            ->line('**EID:** '.$eid)
            ->action('View Dashboard', route('dashboard'))
            ->line('Please review this stock entry in case any verification is required.')
            ->line('Thank you.');
    }
}
