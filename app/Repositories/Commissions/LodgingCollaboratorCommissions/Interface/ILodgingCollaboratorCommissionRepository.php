<?php

namespace App\Repositories\Commissions\LodgingCollaboratorCommissions\Interface;

use Illuminate\Http\Request;

interface ILodgingCollaboratorCommissionRepository
{
    public function getAllLodgingCollaboratorCommissions(Request $request);

    public function getSingleLodgingCollaboratorCommission(string $id);

    public function updateLodgingCollaboratorCommission(Request $request, string $id);

    public function destroyLodgingCollaboratorCommission(string $id);

    public function destroyLodgingCollaboratorCommissionBySelection(Request $request);
}
