<?php

namespace App\Repositories\UnsettledAccounts\Repository;

use App\Models\UnsettledAccount;
use App\Models\UnsettledAccountNotificationLog;
use App\Models\UnsettledAccountNotificationSetting;
use App\Notifications\SendUnsettledAccountNotification;
use App\Repositories\UnsettledAccounts\Interface\IUnsettledAccountsRepository;
use Exception;
use Illuminate\Http\Request;
use Str;

class UnsettledAccountsRepository implements IUnsettledAccountsRepository
{
    public function __construct(
        private UnsettledAccount $unsettled_account,
        private UnsettledAccountNotificationSetting $unsettled_account_notification_setting,
        private UnsettledAccountNotificationLog $unsettled_account_notification_log
    ) {}

    public function getAllUnsettledAccounts(Request $request)
    {
        return $this->unsettled_account
            ->with(['user', 'resolvedBy', 'order'])
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $query->whereHas('user', function ($query) use ($request) {
                    $query->where('name', 'like', '%'.$request->input('search').'%')
                        ->orWhere('email', 'like', '%'.$request->input('search').'%')
                        ->orWhere('phone', 'like', '%'.$request->input('search').'%');
                })
                    ->orWhereHas('order', function ($query) use ($request) {
                        $query->where('order_no', $request->input('search'));
                    })
                    ->orWhereJsonContains('meta->order_nos', $request->input('search'));
            })
            ->when(! empty($request->input('status')), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }

    public function updateUnsettledAccount(Request $request, ?string $id = null)
    {
        try {
            if (empty($id)) {
                throw new Exception('Unsettled Account Id Not Found');
            }
            $unsettled_account = $this->unsettled_account
                ->where('id', $id)
                ->first();

            if (empty($unsettled_account)) {
                throw new Exception('Unsettled Account Not Found');
            }

            if ($unsettled_account->status === 'resolved') {
                throw new Exception('Unsettled Account Already Resolved');
            }

            $updated = $unsettled_account->update([
                'resolved_by' => $request->user()->id,
                'status' => 'resolved',
            ]);

            if (! $updated) {
                throw new Exception('Something Went Wrong While Updating Unsettled Account');
            }

            return ['status' => true, 'message' => 'Unsettled Account Updated Successfully'];

        } catch (Exception $e) {
            return ['status' => false, 'message' => $e->getMessage()];
        }
    }

    public function updateUnsettledAccountNote(Request $request, ?string $id = null)
    {
        try {
            $request->validate([
                'note' => ['required', 'string', 'max:1000'],
            ]);
            $unsettled_account = $this->unsettled_account
                ->where('id', $id)
                ->first();

            if (empty($unsettled_account)) {
                throw new Exception('Unsettled Account Not Found');
            }

            $updated = $unsettled_account->update([
                'note' => $request->input('note'),
            ]);

            if (! $updated) {
                throw new Exception('Something Went Wrong While Updating Unsettled Account');
            }

            return ['status' => true, 'message' => 'Unsettled Account Note Added Successfully'];
        } catch (Exception $e) {
            return ['status' => false, 'message' => $e->getMessage()];
        }
    }

    public function sendUnsettledAccountMessage(Request $request, ?string $id = null)
    {
        try {
            $message = $request->input('message');

            if (Str::of($message)->stripTags()->trim()->isEmpty()) {
                throw new Exception('Message cannot be empty');
            }

            $plainMessage = trim(
                preg_replace(
                    '/\n{2,}/',
                    "\n\n",
                    html_entity_decode(
                        strip_tags(
                            str_replace(['</p>', '<br>', '<br/>', '<br />'], "\n", $message)
                        )
                    )
                )
            );

            $unsettled_account = $this->unsettled_account
                ->with(['user', 'order'])
                ->where('id', $id)
                ->first();

            if (empty($unsettled_account)) {
                throw new Exception('Unsettled Account Not Found');
            }

            $setting = $this->unsettled_account_notification_setting->where('reason', $unsettled_account->reason)
                ->where('is_active', true)
                ->first();

            if (empty($setting)) {
                throw new Exception('Unsettled Account Notification Setting Not Found Please Setup First');
            }

            $unsettled_account->user->notify(
                new SendUnsettledAccountNotification(
                    message: $plainMessage,
                    channel: $setting->channel,
                    actionUrl: ! empty($unsettled_account->order_id) ? route('website.orders.order-view', $unsettled_account->order->order_no) : route('website.orders.index')
                )
            );

            $this->unsettled_account_notification_log->create([
                'user_id' => $unsettled_account->user_id,
                'unsettled_account_id' => $unsettled_account->id,
                'channel' => $setting->channel,
                'message' => $plainMessage,
                'sent_by' => null,
                'is_system_sent' => true,
                'sent_at' => now(),
            ]);

            return ['status' => true, 'message' => 'Message Sent Successfully'];

        } catch (Exception $e) {
            return ['status' => false, 'message' => $e->getMessage()];
        }
    }
}
