<?php

namespace App\Repositories\Commissions\CollaboratorCommissions\Interface;

use Illuminate\Http\Request;

interface ICollaboratorCommissionRepository
{
    public function getAllCollaboratorCommissions(Request $request);

    public function getSingleCollaboratorCommission(string $id);

    public function updateCollaboratorCommission(Request $request, string $id);

    public function destroyCollaboratorCommission(string $id);

    public function destroyCollaboratorCommissionBySelection(Request $request);
}
