<?php

namespace App\Repositories\Notifications\Interface;

use Illuminate\Http\Request;

interface INotificationRepository
{
    public function getAllNotifications(Request $request);

    public function markNotificationAsSeen(Request $request);

    public function destroyNotification(Request $request, ?string $id = null);

    public function markAllNotificationsAsSeen(Request $request);
}
