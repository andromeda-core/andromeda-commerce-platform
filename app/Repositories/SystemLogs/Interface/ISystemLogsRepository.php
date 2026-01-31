<?php

namespace App\Repositories\SystemLogs\Interface;

use Illuminate\Http\Request;

interface ISystemLogsRepository
{
    public function getAllEmailAddressChangeLogs(Request $request);

    public function getAllShippingAddressChangeLogs(Request $request);

    public function getAllUnsettledAccountNotificationLogs(Request $request);
}
