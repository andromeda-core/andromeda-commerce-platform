<?php

namespace App\Repositories\OrderRefund\Repository;

use App\Models\OrderRefund;
use App\Repositories\OrderRefund\Interface\IOrderRefundRepository;
use Exception;
use Illuminate\Http\Request;

class OrderRefundRepository implements IOrderRefundRepository
{
    public function __construct(
        private OrderRefund $order_refund,
    ) {}

    public function getAllOrderRefunds(Request $request)
    {
        $order_refunds = $this->order_refund->with(['order', 'customer', 'customer.user'])
            ->when(! empty($request->input('refund_status')), function ($query) use ($request) {
                $query->where('refund_status', $request->input('refund_status'));
            })
            ->latest()
            ->paginate(10);

        return $order_refunds;
    }

    public function getSingleOrderRefund(string $id)
    {
        $order_refund = $this->order_refund->with(['order', 'customer', 'customer.user'])->find($id);

        return $order_refund;
    }

    public function updateOrderRefund(Request $request, string $id)
    {

        $validated = $request->validate([
            'refund_status' => ['required', 'in:approved,rejected,completed'],
            'refund_method' => ['nullable', 'in:points,bank_transfer,crypto'],
            'refund_reference' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string', 'max:1000'],
        ], [
            'refund_status.in' => 'Refund status Must be Changed To Approved, Rejected Or Completed.',
        ]);

        try {
            $orderRefund = $this->order_refund->findOrFail($id);

            if ($orderRefund->refund_status === 'completed') {
                throw new Exception('Completed refunds cannot be modified.');
            }

            if ($orderRefund->refund_status === 'withdrawn') {
                throw new Exception('Withdrawn refunds cannot be modified.');
            }

            if ($validated['refund_status'] === 'completed') {

                if ($validated['refund_method'] === 'crypto' && empty($validated['refund_reference'])) {
                    throw new Exception('Refund transaction hash is required for crypto refunds.');
                }

                if ($validated['refund_method'] === 'points') {
                    $validated['refund_reference'] = null;
                }
            }

            $timestamps = match ($validated['refund_status']) {
                'approved' => ['approved_at' => now()],
                'rejected' => ['rejected_at' => now()],
                'completed' => ['completed_at' => now()],
            };

            $orderRefund->update([
                'refund_status' => $validated['refund_status'],
                'refund_method' => $validated['refund_method'] ?? $orderRefund->refund_method,
                'refund_reference' => $validated['refund_reference'] ?? $orderRefund->refund_reference,
                'note' => $validated['note'] ?? $orderRefund->note,
                ...$timestamps,
            ]);

            return [
                'status' => true,
                'message' => 'Order refund updated successfully.',
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
