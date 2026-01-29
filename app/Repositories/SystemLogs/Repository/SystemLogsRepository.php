<?php

namespace App\Repositories\SystemLogs\Repository;

use App\Models\EmailChangeLog;
use App\Models\ShippingAddressChangeLog;
use App\Repositories\SystemLogs\Interface\ISystemLogsRepository;
use Illuminate\Http\Request;

class SystemLogsRepository implements ISystemLogsRepository
{
    public function __construct(
        private EmailChangeLog $email_change_log,
        private ShippingAddressChangeLog $shipping_address_change_log
    ) {}

    public function getAllEmailAddressChangeLogs(Request $request)
    {

        return $this->email_change_log
            ->with('user')
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $query->whereHas('user', function ($query) use ($request) {
                    $query->where(function ($query) use ($request) {
                        $query->where('name', 'like', '%'.$request->input('search').'%')
                            ->orWhere('email', 'like', '%'.$request->input('search').'%')
                            ->orWhere('phone', 'like', '%'.$request->input('search').'%');

                    });
                });
            })
            ->latest()
            ->paginate(10);
    }

    public function getAllShippingAddressChangeLogs(Request $request)
    {
        return $this->shipping_address_change_log
            ->with('user')
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $query->whereHas('user', function ($query) use ($request) {
                    $query->where(function ($query) use ($request) {
                        $query->where('name', 'like', '%'.$request->input('search').'%')
                            ->orWhere('email', 'like', '%'.$request->input('search').'%')
                            ->orWhere('phone', 'like', '%'.$request->input('search').'%');

                    });
                });
            })
            ->latest()
            ->paginate(10);
    }
}
