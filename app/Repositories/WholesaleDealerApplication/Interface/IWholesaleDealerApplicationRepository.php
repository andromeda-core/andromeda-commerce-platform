<?php

namespace App\Repositories\WholesaleDealerApplication\Interface;

use Illuminate\Http\Request;

interface IWholesaleDealerApplicationRepository
{
    /**
     * Persist a new wholesale dealer application, fire the applicant + admin
     * notifications, and return the stored model.
     */
    public function store(array $data);

    /**
     * Paginated, searchable list for the admin dashboard.
     */
    public function paginateForDashboard(Request $request);

    /**
     * Fetch a single application by its public_id (dashboard detail page).
     */
    public function findByPublicId(?string $public_id = null);
}
