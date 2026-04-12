<?php

namespace App\Repositories\Collaborators\Interface;

use Illuminate\Http\Request;

interface ICollaboratorRepository
{
    public function getAllCollaborators(Request $request);

    public function getSingleCollaborator(string $id);

    public function storeCollaborator(Request $request);

    public function updateCollaborator(Request $request, string $id);

    public function destroyCollaborator(string $id);

    public function destroyCollaboratorBySelection(Request $request);
}
