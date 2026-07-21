<?php

namespace App\Repositories\WholesaleDealerApplication\Repository;

use App\Models\WholesaleDealerApplication;
use App\Notifications\NotifyAdminsAboutWholesaleDealerApplication;
use App\Notifications\NotifyApplicantAboutWholesaleDealerApplication;
use App\Repositories\WholesaleDealerApplication\Interface\IWholesaleDealerApplicationRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class WholesaleDealerApplicationRepository implements IWholesaleDealerApplicationRepository
{
    // Fixed admin recipient — same deliverable address the Collaborator flow uses.
    private const ADMIN_RECIPIENT = 'verification@andromeda.blue';

    public function __construct(
        private WholesaleDealerApplication $wholesale_dealer_application
    ) {}

    public function store(array $data)
    {
        $application = $this->wholesale_dealer_application->create($data);


        // Notifications are best-effort: a mail failure must not discard a saved lead.
        try {
            // Admin alert -> fixed verification@andromeda.blue mailbox.
            Notification::route('mail', self::ADMIN_RECIPIENT)
                ->notify(new NotifyAdminsAboutWholesaleDealerApplication($application));

            // Applicant acknowledgement -> submitted business email.
            if (! empty($application->business_email)) {
                Notification::route('mail', $application->business_email)
                    ->notify(new NotifyApplicantAboutWholesaleDealerApplication($application));
            }
        } catch (\Throwable $e) {
            Log::error('Wholesale dealer application notifications failed', [
                'application_id' => $application->application_id,
                'error' => $e->getMessage(),
            ]);
        }

        return $application;
    }

    public function paginateForDashboard(Request $request)
    {
        return $this->wholesale_dealer_application
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $query->where(function ($query) use ($request) {
                    $search = $request->input('search');
                    $query->where('company_store_name', 'like', '%' . $search . '%')
                        ->orWhere('legal_business_name', 'like', '%' . $search . '%')
                        ->orWhere('business_email', 'like', '%' . $search . '%')
                        ->orWhere('contact_person', 'like', '%' . $search . '%')
                        ->orWhere('application_id', 'like', '%' . $search . '%');
                });
            })
            ->when(! empty($request->input('status')), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }

    public function findByPublicId(?string $public_id = null)
    {
        if (empty($public_id)) {
            return null;
        }

        return $this->wholesale_dealer_application
            ->where('public_id', $public_id)
            ->first();
    }
}
