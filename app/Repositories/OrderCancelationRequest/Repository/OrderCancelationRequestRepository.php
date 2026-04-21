<?php

namespace App\Repositories\OrderCancelationRequest\Repository;

use App\Helpers\Trans;
use App\Jobs\Meta\OrderCanceledRequestApprovedAndOrderCanceledJob;
use App\Jobs\Meta\OrderCanceledRequestRejectedJob;
use App\Jobs\Meta\OrderCancellationRequestSubmittedJob;
use App\Jobs\NotifyAdminOrderCancelationRequestCreated;
use App\Models\Customer;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\OrderCancelationRequest;
use App\Models\SpecialCountry;
use App\Notifications\OrderCancelationRequestWithdrawnNotification;
use App\Notifications\OrderCanceledRequestApprovedAndOrderCanceled;
use App\Notifications\OrderCanceledRequestRejected;
use App\Notifications\OrderCancellationRequestSubmitted;
use App\Repositories\OrderCancelationRequest\Interface\IOrderCancelationRequestRepository;
use App\Services\AttributionRewardService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class OrderCancelationRequestRepository implements IOrderCancelationRequestRepository
{
    public function __construct(
        private OrderCancelationRequest $order_cancelation_request,
        private Order $order,
        private Trans $trans,
        private Inventory $inventory,
        private Customer $customer,
        private SpecialCountry $special_country
    ) {}

    public function getAllRequests(Request $request)
    {
        $order_cancelation_requests = $this->order_cancelation_request
            ->when(! empty($request->input('status')), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->with(['customer.user', 'order'])
            ->latest()
            ->paginate(10);

        return $order_cancelation_requests;
    }

    public function getSingleRequest(?string $id = null)
    {
        return $this->order_cancelation_request->with(['order', 'customer.user'])->find($id);
    }

    public function storeRequest(Request $request)
    {
        $validated_req = $request->validate([
            'order_no' => ['required', 'exists:orders,order_no'],
            'reason' => ['required', 'string', 'min:30', 'max:1000'],
        ]);

        try {
            $user = $request?->user();

            if (empty($user)) {
                throw new Exception($this->trans->get('User not found'));
            }

            $customer = $user->customer;

            if (empty($customer)) {
                throw new Exception($this->trans->get('Customer not found'));
            }

            $order = $this->order->with(['cancelationRequest', 'customer.user'])->where('order_no', $validated_req['order_no'])->where('customer_id', $customer->id)->first();

            if (empty($order)) {
                throw new Exception($this->trans->get('Order not found'));
            }

            if (! in_array($order->status, ['pending', 'awaiting_payment'])) {
                throw new Exception($this->trans->get('You Are Not Allowed To Cancel This Order'));
            }

            if ($order->cancelationRequest()->exists()) {
                throw new Exception($this->trans->get('You Already Have A Request For This Order'));
            }

            unset($validated_req['order_no']);
            $cancelationRequest = $this->order_cancelation_request->create([
                ...$validated_req,
                'customer_id' => $customer->id,
                'order_id' => $order->id,
                'requested_at' => now(),
            ]);

            if (empty($cancelationRequest)) {
                throw new Exception($this->trans->get('Something went wrong While Creating Your Request'));
            }

            $user->notify(new OrderCancellationRequestSubmitted($order));

            NotifyAdminOrderCancelationRequestCreated::dispatch($order, $cancelationRequest);

            $meta_setting = Cache::get('meta_setting');
            $user_meta_contacts = $order->customer->user->metaContacts;
            $order_user = $order->customer->user;
            $is_eligible = $this->special_country->where('country_id', $order->customer->country_id)->exists();

            if ($is_eligible && $user_meta_contacts->isNotEmpty() && ! empty($meta_setting)) {
                dispatch(new OrderCancellationRequestSubmittedJob($user_meta_contacts, $order, $meta_setting, $order_user))->onQueue('meta');
            }

            return [
                'status' => true,
                'message' => $this->trans->get('Request Created Successfully'),
            ];
        } catch (Exception $th) {
            return [
                'status' => false,
                'message' => $th->getMessage(),
            ];
        }
    }

    public function updateRequest(Request $request, ?string $id = null)
    {
        $validated_req = $request->validate([
            'note' => ['nullable', 'string', 'max:100000'],
            'status' => ['required', 'in:approved,rejected'],
        ], [
            'status.in' => 'Status Must Be Changed To Approved Or Rejected.',
        ]);

        DB::beginTransaction();
        try {

            if (empty($id)) {
                throw new Exception('Request Not Found');
            }

            $cancelation_request = $this->getSingleRequest($id);

            if (empty($cancelation_request)) {
                throw new Exception('Request Not Found');
            }

            $customer = $this->customer->with(['user'])->find($cancelation_request->customer_id);

            if (empty($customer)) {
                throw new Exception('Customer Not Found');
            }

            $order = $this->order->with(['cancelationRequest', 'orderItems'])->where('order_no', $request->order_no)->first();

            // if (empty($order)) {
            //     throw new Exception('Order Not Found');
            // }

            // if (in_array($cancelation_request->status, ['approved', 'rejected'])) {
            //     throw new Exception('This request is already finalized and cannot be updated.');
            // }

            // if (! in_array($order->status, ['pending', 'awaiting_payment'])) {
            //     throw new Exception('The Order Is Not In Pending Or Awaiting Payment Status So You Are Not Allowed To Cancel It');
            // }

            $meta_setting = Cache::get('meta_setting');
            $user_meta_contacts = $order->customer->user->metaContacts;
            $order_user = $order->customer->user;
            $is_eligible = $this->special_country->where('country_id', $order->customer->country_id)->exists();

            if ($validated_req['status'] === 'approved') {
                $validated_req['approved_at'] = now();


                if (! empty($order->points_used)) {
                    $customer->user->reward_points()->create([
                        'points' => $order->points_used,
                        'expires_at' => now()->addYears(5),
                    ]);
                }

                $order->update([
                    'status' => 'canceled',
                ]);

                $order->payment()->update([
                    'status' => 'canceled',
                    'canceled_at' => now(),
                ]);


                if ($order->attributionReward) {
                    app(AttributionRewardService::class)->reverseReward($order);
                }




                foreach ($order->orderItems as $item) {

                    $inventoryItemsIds = $item->inventory_item_ids;
                    if (empty($inventoryItemsIds)) {
                        continue;
                    }

                    foreach ($inventoryItemsIds as $inventoryItemId) {
                        $inventoryItem = $this->inventory->find($inventoryItemId);
                        if (! empty($inventoryItem) && $inventoryItem->status === 'on_hold') {
                            $inventoryItem->update([
                                'status' => 'in_stock',
                            ]);
                        }
                    }
                }

                $customer->user->notify(new OrderCanceledRequestApprovedAndOrderCanceled($order));

                if ($is_eligible && $user_meta_contacts->isNotEmpty() && ! empty($meta_setting)) {
                    dispatch(new OrderCanceledRequestApprovedAndOrderCanceledJob($user_meta_contacts, $order, $meta_setting, $order_user))->onQueue('meta');
                }
            }

            if ($validated_req['status'] === 'rejected') {
                $validated_req['rejected_at'] = now();
                $customer->user->notify(new OrderCanceledRequestRejected($order));

                if ($is_eligible && $user_meta_contacts->isNotEmpty() && ! empty($meta_setting)) {
                    dispatch(new OrderCanceledRequestRejectedJob($user_meta_contacts, $order, $meta_setting, $order_user))->onQueue('meta');
                }
            }

            $updated = $cancelation_request->update($validated_req);

            if (! $updated) {
                throw new Exception('Request Not Updated');
            }

            DB::commit();

            return [
                'status' => true,
                'message' => 'Request Updated Successfully',
            ];
        } catch (Exception $th) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $th->getMessage(),
            ];
        }
    }

    public function canRequest(Request $request, ?string $order_no = null)
    {
        try {
            if (empty($order_no)) {
                return false;
            }

            $user = $request->user();

            if (empty($user)) {
                return false;
            }

            $customer = $user->customer;

            if (empty($customer)) {
                return false;
            }

            $order = $this->order->with(['cancelationRequest'])->where('order_no', $order_no)->where('customer_id', $customer->id)->first();

            if (empty($order)) {
                return false;
            }

            if (! in_array($order->status, ['pending', 'awaiting_payment'])) {
                return false;
            }

            if ($order->cancelationRequest()->exists()) {
                return false;
            }

            return true;
        } catch (Exception $e) {
            return false;
        }
    }

    public function withdrwalRequest(Request $request)
    {
        DB::beginTransaction();
        try {
            $request->validate([
                'order_no' => ['required', 'exists:orders,order_no'],
            ], [
                'order_no.required' => $this->trans->get('Order No Is Required'),
                'order_no.exists' => $this->trans->get('Order Not Found'),
            ]);

            $user = $request->user();

            if (empty($user)) {
                throw new Exception($this->trans->get('User Not Found'));
            }

            $customer = $user->customer;

            if (empty($customer)) {
                throw new Exception($this->trans->get('Customer Not Found'));
            }

            $order = $this->order->with(['cancelationRequest'])->where('order_no', $request->order_no)->where('customer_id', $customer->id)->first();

            if (empty($order)) {
                throw new Exception($this->trans->get('Order Not Found'));
            }

            if ($order->cancelationRequest()->doesntExist()) {
                throw new Exception($this->trans->get('Order cancelation request not found'));
            }

            if ($order->cancelationRequest->status !== 'requested') {
                throw new Exception($this->trans->get('Only Unprocessed Cancelation Request Can Be Withdrawn'));
            }

            $deleted = $order->cancelationRequest()->delete();

            if (! $deleted) {
                throw new Exception($this->trans->get('Order cancelation request not withdrawn'));
            }

            DB::commit();

            $user->notify(new OrderCancelationRequestWithdrawnNotification($order));

            return [
                'status' => true,
                'message' => $this->trans->get('Order cancelation request withdrawn successfully'),
            ];
        } catch (Exception $th) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $th->getMessage(),
            ];
        }
    }
}
