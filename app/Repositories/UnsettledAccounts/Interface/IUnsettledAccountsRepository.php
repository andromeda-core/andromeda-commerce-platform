<?php

namespace App\Repositories\UnsettledAccounts\Interface;

use Illuminate\Http\Request;

interface IUnsettledAccountsRepository
{
    public function getAllUnsettledAccounts(Request $request);

    public function updateUnsettledAccount(Request $request, ?string $id = null);

    public function updateUnsettledAccountNote(Request $request, ?string $id = null);

    public function sendUnsettledAccountMessage(Request $request, ?string $id = null);
}
