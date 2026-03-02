<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Repositories\Notifications\Interface\INotificationRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function __construct(
        private INotificationRepository $notification
    ) {}

    public function index(Request $request)
    {
        return response('HIT NEW CODE ✅', 200);
        if (empty($request->user())) {
            return to_route('login');
        }

        $data = $this->notification->getAllNotifications($request);
        dd($data);

        return Inertia::render('Website/Notifications/index', [
            'notifications' => $data['notifications'],
            'currentFilter' => $data['currentFilter'],
            'totalCounts' => $data['totalCounts'],
        ]);
    }

    public function markNotificationAsSeen(Request $request)
    {
        $response = $this->notification->markNotificationAsSeen($request);
        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);
    }

    public function destroyNotification(Request $request, ?string $id = null)
    {
        if (empty($id)) {
            return back()->with('error', 'Something Went Wrong While Deleting Notification');
        }

        $response = $this->notification->destroyNotification($request, $id);
        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);
    }

    public function markAllNotificationsAsSeen(Request $request)
    {
        $response = $this->notification->markAllNotificationsAsSeen($request);
        if ($response['status'] === false) {
            return back()->with('error', $response['message']);
        }

        return back()->with('success', $response['message']);
    }
}
