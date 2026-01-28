<?php

namespace App\Repositories\OrderAddressChangeRequest\Repository;

use App\Models\OrderAddressChangeRequest;
use App\Repositories\OrderAddressChangeRequest\Interface\IOrderAddressChangeRequestRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderAddressChangeRequestRepository implements IOrderAddressChangeRequestRepository
{
    public function __construct(
        private OrderAddressChangeRequest $order_address_change_request,
    ) {}

    public function getAllOrderAddressChangeRequests(Request $request)
    {
        $order_address_change_requests = $this->order_address_change_request
            ->when(! empty($request->input('status')), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->with(['customer.user', 'order'])
            ->latest()
            ->paginate(10);

        return $order_address_change_requests;
    }

    public function getSingleOrderAddressChangeRequest(string $id)
    {
        $order_address_change_request = $this->order_address_change_request
            ->with(['order', 'customer.user'])
            ->find($id);

        return $order_address_change_request;
    }

    public function updateOrderAddressChangeRequest(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'status' => ['required', 'in:approved,rejected'],
            'note' => ['nullable', 'string', 'max:1000'],
        ], [
            'status.in' => 'Status Must Be Changed To Approved Or Rejected.',
        ]);

        DB::beginTransaction();

        try {
            $order_address_change_request = $this->order_address_change_request
                ->with(['order'])
                ->find($id);

            if (empty($order_address_change_request)) {
                throw new Exception('Order Address Change Request Not Found');
            }

            if (in_array($order_address_change_request->status, ['approved', 'rejected'])) {
                throw new Exception('This request is already finalized and cannot be updated.');
            }

            if (in_array($order_address_change_request?->order?->status, ['shipped', 'arrived_locally', 'delivered'])) {
                throw new Exception('Order Already Shipped And Cannot Be Updated');
            }

            if ($validated_req['status'] == 'approved') {
                $order_address_change_request->order->updateQuietly([
                    'shipping_name' => $order_address_change_request->shipping_name,
                    'shipping_phone' => $order_address_change_request->shipping_phone,
                    'shipping_address_line1' => $order_address_change_request->shipping_address_line1,
                    'shipping_address_line2' => $order_address_change_request->shipping_address_line2,
                    'shipping_city' => $order_address_change_request->shipping_city,
                    'shipping_state' => $order_address_change_request->shipping_state,
                    'shipping_country' => $order_address_change_request->shipping_country,
                    'shipping_postal_code' => $order_address_change_request->shipping_postal_code,

                ]);
            }

            $order_address_change_request->update([
                'status' => $validated_req['status'],
                'note' => $validated_req['note'],
                'approved_at' => $validated_req['status'] == 'approved' ? now() : null,
                'rejected_at' => $validated_req['status'] == 'rejected' ? now() : null,
            ]);

            DB::commit();

            return [
                'status' => true,
                'message' => 'Order address change request updated successfully',
            ];
        } catch (Exception $e) {
            DB::rollback();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
