<?php

namespace App\Jobs;

use App\Models\User;
use App\Notifications\NotifyAdminsAboutContactSubmission;
use App\Notifications\NotifyUserAboutContactSubmission;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Notification;

class ContactFormSubmissionJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private array $data
    ) {}

    public function handle(): void
    {
        $submiter_email = $this->data['email'];

        $admins = User::whereHas('roles', function ($query) {
            $query->where('name', 'Admin');
        })->get();

        if ($admins->isNotEmpty()) {
            $admins->each(function ($admin) {
                $admin->notify(new NotifyAdminsAboutContactSubmission($this->data));
            });

            Notification::route('mail', $submiter_email)
                ->notify(new NotifyUserAboutContactSubmission($this->data));

        }

    }
}
