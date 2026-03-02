<?php

namespace App\Repositories\Notifications\Repository;

use App\Helpers\Trans;
use App\Repositories\Notifications\Interface\INotificationRepository;
use Exception;
use Illuminate\Http\Request;

class NotificationRepository implements INotificationRepository
{
    public function __construct(
        private Trans $trans
    ) {}

    public function getAllNotifications(Request $request)
    {
        $user = $request->user();
        if (empty($user)) {
            return [];
        }

        $filter = $request->get('filter', 'all');
        $query = $user->notifications()->orderBy('created_at', 'desc');

        if ($filter === 'unread') {
            $query->whereNull('read_at');
        } elseif ($filter === 'read') {
            $query->whereNotNull('read_at');
        }

        $notifications = $query->paginate(10)->withQueryString();

        dd([
            'user_id' => $request->user()->id,
            'count' => $request->user()->notifications()->count(),
            'latest' => $request->user()->notifications()->latest()->first(),
        ]);

        return [
            'totalCounts' => [
                'all' => $user->notifications()->count() ?? 0,
                'unread' => $user->unreadNotifications()->count() ?? 0,
                'read' => $user->notifications()->whereNotNull('read_at')->count() ?? 0,
            ],
            'currentFilter' => $filter,
            'notifications' => $notifications,

        ];
    }

    public function markNotificationAsSeen(Request $request)
    {
        try {
            $request->validate([
                'notification_id' => ['required', 'exists:notifications,id'],
            ], [
                'notification_id.required' => $this->trans->get('Notification is required'),
                'notification_id.exists' => $this->trans->get('Notification not found'),
            ]);

            $user = $request->user();
            if (empty($user)) {
                return ['status' => false, 'message' => $this->trans->get('User not found')];
            }

            $notification = $user->notifications()->where('id', $request->notification_id)->first();
            if (empty($notification)) {
                throw new Exception($this->trans->get('Notification not found'));
            }
            $notification->markAsRead();

            return ['status' => true, 'message' => $this->trans->get('Notification marked as seen successfully')];
        } catch (Exception $e) {
            return ['status' => false, 'message' => $e->getMessage()];
        }
    }

    public function destroyNotification(Request $request, ?string $id = null)
    {
        try {
            if (empty($id)) {
                throw new Exception($this->trans->get('Notification not found'));
            }

            $notification = $request->user()->notifications()->where('id', $id)->first();
            if (empty($notification)) {
                throw new Exception($this->trans->get('Notification not found'));
            }

            $notification->delete();

            return ['status' => true, 'message' => $this->trans->get('Notification deleted successfully')];

        } catch (Exception $e) {
            return ['status' => false, 'message' => $e->getMessage()];
        }
    }

    public function markAllNotificationsAsSeen(Request $request)
    {
        try {
            $user = $request->user();
            if (empty($user)) {
                throw new Exception($this->trans->get('User not found'));
            }

            $user->unreadNotifications->markAsRead();

            return ['status' => true, 'message' => $this->trans->get('All notifications marked as seen successfully')];
        } catch (Exception $e) {
            return ['status' => false, 'message' => $e->getMessage()];
        }
    }
}
