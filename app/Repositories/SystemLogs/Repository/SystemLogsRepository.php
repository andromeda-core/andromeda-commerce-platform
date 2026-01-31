<?php

namespace App\Repositories\SystemLogs\Repository;

use App\Models\EmailChangeLog;
use App\Models\ShippingAddressChangeLog;
use App\Models\UnsettledAccountNotificationLog;
use App\Repositories\SystemLogs\Interface\ISystemLogsRepository;
use Illuminate\Http\Request;

class SystemLogsRepository implements ISystemLogsRepository
{
    public function __construct(
        private EmailChangeLog $email_change_log,
        private ShippingAddressChangeLog $shipping_address_change_log,
        private UnsettledAccountNotificationLog $unsettled_account_notification_log
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

    public function getAllUnsettledAccountNotificationLogs(Request $request)
    {
        return $this->unsettled_account_notification_log
            ->with(['user', 'sent_by', 'unsettledAccount.order'])
            ->when($request->filled('search'), function ($mainQuery) use ($request) {

                $search = $request->input('search');

                $mainQuery->where(function ($query) use ($search) {

                    $query->whereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    })
                        ->orWhereHas('sent_by', function ($query) use ($search) {
                            $query->where('name', 'like', '%'.$search.'%')
                                ->orWhere('email', 'like', '%'.$search.'%');
                        })
                        ->orWhereHas('unsettledAccount', function ($q) use ($search) {

                            $q->whereHas('order', function ($orderQuery) use ($search) {
                                $orderQuery->where('order_no', $search);
                            })
                                ->orWhereJsonContains('meta->order_nos', $search);
                        });
                });
            })
            ->latest()
            ->paginate(10);
    }
}
