<?php

namespace App\Repositories\Orders\Repository;

use App\Jobs\CourierInvoiceDestroyOnAWS;
use App\Jobs\CourierInvoiceStoreOnAWS;
use App\Jobs\NotifyPaymentProofHasBeenUploaded;
use App\Jobs\PayemntProofStoreOnAWS;
use App\Jobs\PaymentProofDestroyOnAWS;
use App\Models\CartItem;
use App\Models\Collaborator;
use App\Models\Customer;
use App\Models\Order;
use App\Models\PackageRecording;
use App\Models\RewardPoint;
use App\Models\RewardSetting;
use App\Models\Smartphone;
use App\Models\User;
use App\Notifications\NotifyCustomerAboutAwaitingPaymentOrderFromCrypto;
use App\Repositories\Orders\Interface\IOrderRepository;
use App\Services\NOWPaymentPaymentService;
use Cache;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Validator;

class OrderRepository implements IOrderRepository
{
    public function __construct(
        private Order $order,
        private Collaborator $collaborator,
        private Smartphone $smartphone,
        private Customer $customer,
        private RewardSetting $reward_setting,
        private CartItem $cart,
        private User $user,
        private RewardPoint $reward_point,
        private NOWPaymentPaymentService $now_payment_service,
        private PackageRecording $package_recording,
    ) {}

    public function getAllOrders(Request $request)
    {
        $orders = $this->order
            ->with(['collaborator', 'customer', 'customer.user'])
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $query->WhereHas('customer.user', function ($subQ) use ($request) {
                    $subQ->where('name', 'like', '%'.$request->input('search').'%')
                        ->orWhere('email', 'like', '%'.$request->input('search').'%')
                        ->orWhere('phone', 'like', '%'.$request->input('search').'%');
                });
            })
            ->when(! empty($request->input('status')), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $orders;
    }

    public function getSingleOrder(string $id)
    {
        $order = $this->order->with(
            [
                'collaborator',
                'customer',
                'customer.user',
                'customer.country',
                'orderPackageRecordings',
                'orderItems',
                'orderItems.smartphone',
                'orderItems.smartphone.model_name',
                'orderItems.smartphone.capacity',
                'orderItems.smartphone.selling_info',
                'orderItems.smartphone.category',
                'orderItems.smartphone.category.distributor',
                'orderItems.smartphone.category.distributor.user',
                'orderItems.color',
            ]
        )->find($id);

        return $order;
    }

    public function storeOrder(Request $request)
    {
        $validated_req = $request->validate([
            'customer_id' => ['required', 'exists:customers,id'],
            'smartphones' => ['required', 'array'],
            'referral_code' => ['nullable', 'exists:collaborators,referral_code'],
        ], [
            'customer_id.required' => 'The Customer Field Is Required.',
            'customer_id.exists' => 'The selected customer is invalid.',
            'referral_code.exists' => 'The Entered referral code is invalid.',
            'smartphones.required' => 'The Please Select Atleast One Smartphone For Creating Order.',
        ]);

        try {

            DB::beginTransaction();
            $validator = Validator::make($request->all(), [
                'smartphones.*.id' => ['required', 'exists:smartphones,id'],
                'smartphones.*.quantity' => ['required', 'integer', 'min:1'],
            ], [
                'smartphones.*.id.required' => 'The Smartphone Field Is Required.',
                'smartphones.*.id.exists' => 'The selected smartphone is invalid.',
                'smartphones.*.quantity.required' => 'The Quantity Field Is Required.',
                'smartphones.*.quantity.integer' => 'The Quantity Field Must Be Integer.',
                'smartphones.*.quantity.min' => 'The Quantity Field Must Be Atleast 1.',
            ]);

            if ($validator->fails()) {
                throw new Exception($validator->errors()->first());
            }

            $customer = $this->customer->find($validated_req['customer_id']);
            if (empty($customer)) {
                throw new Exception('Invalid Customer');
            }

            if (
                empty($customer->country) ||
                empty($customer->state) ||
                empty($customer->city) ||
                empty($customer->postal_code) ||
               (
                   empty($customer->address_line1) &&
                   empty($customer->address_line2)
               )
            ) {
                throw new Exception('Please Complete Customer Profile, Before Placing An Order ');
            }

            if (! empty($validated_req['referral_code'])) {

                if ($this->reward_setting->doesntExist()) {
                    throw new Exception('Reward Point Setting Not Setup Please Setup Reward Point Setting To Use Reward Points Feature');
                }

                $collaborator = $this->collaborator->where('referral_code', $validated_req['referral_code'])->first();
                if (empty($collaborator)) {
                    throw new Exception('Invalid Referral Code');
                }
                $validated_req['collaborator_id'] = $collaborator->id;
            }

            $ids = collect($validated_req['smartphones'])->pluck('id');

            $duplicates = $ids->duplicates();

            if ($duplicates->isNotEmpty()) {
                throw new Exception('Duplicate Smartphones Are Not Allowed');
            }

            $smartphones = $this->smartphone->with(['selling_info', 'inventory_items', 'model_name', 'category.distributor'])
                ->whereIn('id', $ids)
                ->get();

            if ($smartphones->isEmpty()) {
                throw new Exception('Selected Smartphones Are Invalid');
            }

            $smartphoneQuantities = collect($validated_req['smartphones'])
                ->mapWithKeys(fn ($item) => [$item['id'] => $item['quantity']]);

            $order_items = [];
            $amount = 0;

            $distributor_ids = $smartphones->pluck('category.distributor.id')->toArray();

            if (in_array(null, $distributor_ids, true)) {
                throw new Exception('One or more smartphones are missing a category. Please assign a category before placing an order.');
            }

            if (count(array_unique($distributor_ids)) !== 1) {
                throw new Exception('Order cannot be placed because the selected smartphones belong to different distributors. Please select products from the same distributor.');
            }

            foreach ($smartphones as $smartphone) {

                if ($smartphone->inventory_items->isEmpty()) {
                    throw new Exception(" {$smartphone->model_name->name} Smartphone Is Out Of Stock Please Check");
                }

                if ($smartphone->inventory_items()->where('status', 'in_stock')->doesntExist()) {
                    throw new Exception("{$smartphone->model_name->name} Smartphone Is Out Of Stock Please Check");
                }

                if ($smartphone->inventory_items()->where('status', 'in_stock')->count() < $smartphoneQuantities[$smartphone->id]) {
                    throw new Exception("{$smartphone->model_name->name} Smartphone Has Less Stock But You Have Selected More Quantity Please Check");
                }

                if (empty($smartphone->selling_info)) {
                    throw new Exception("{$smartphone->model_name->name} Smartphone Dont have Selling Price Please Check");
                }

                $quantity = $smartphoneQuantities[$smartphone->id];
                $unit_price = $smartphone->selling_info->total_price;
                $sub_total = $smartphone->selling_info->total_price * $quantity;
                $amount += $sub_total;

                $validated_req['amount'] = $amount;

                $order_items[] = [
                    'smartphone_id' => $smartphone->id,
                    'unit_price' => $unit_price,
                    'quantity' => $quantity,
                    'sub_total' => $sub_total,
                ];

                $inventoryItems = $smartphone->inventory_items()
                    ->where('status', 'in_stock')
                    ->lockForUpdate()
                    ->limit($quantity)
                    ->get();

                foreach ($inventoryItems as $inventoryItem) {
                    $inventoryItem->status = 'on_hold';
                    $inventoryItem->save();
                }

            }

            unset($validated_req['referral_code'], $validated_req['smartphones']);
            $created = $this->order->create($validated_req);

            if (empty($created)) {
                throw new Exception('Something Went Wrong While Creating Order');
            }

            foreach ($order_items as $item) {
                $item['order_id'] = $created->id;
            }

            $created->orderItems()->createMany($order_items);

            DB::commit();

            return [
                'status' => true,
                'message' => 'Order Created Successfully',
            ];

        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateOrder(Request $request, string $id)
    {
        $order = $this->getSingleOrder($id);

        if (empty($order)) {
            return [
                'status' => false,
                'message' => 'Order Not Found',
            ];
        }

        $validated_req = [];
        if ($order->status === 'pending') {
            $validated_req = $request->validate([
                'status' => ['required', Rule::in(['pending', 'paid'])],
                ...(empty($order->payment_proof) ? ['payment_proof' => ['required', 'image', 'max:5048']] : []),
            ], [
                'payment_proof.max' => 'Payment Proof Image Size Must be less than 5MB',
            ]);
            unset($validated_req['payment_proof']);
        }

        if ($order->status === 'paid') {
            $validated_req = $request->validate([
                'status' => ['required', Rule::in(['paid', 'shipped'])],
                'courier_company' => ['required', 'string', 'max:255'],
                'tracking_no' => ['required', 'string', 'max:255'],
                'shipping_date' => ['required', 'date'],
                'is_cash_collected' => ['required', 'boolean'],
                ...(empty($order->courier_invoice) ? ['courier_invoice' => ['required', 'mimes:pdf', 'max:5048']] : []),
            ], [
                'courier_invoice.max' => 'Courier Invoice PDF Size Must be less than 5MB',
                'is_cash_collected.required' => 'Cash Collected Field Is Required',
                'is_cash_collected.boolean' => 'Cash Collected Field Should Be Yes Or No',
            ]);

            unset($validated_req['courier_invoice']);
        }

        if ($order->status === 'shipped') {
            $validated_req = $request->validate([
                'status' => ['required', Rule::in(['shipped', 'arrived_locally'])],
                'is_cash_collected' => ['required', 'boolean'],
            ], [
                'is_cash_collected.required' => 'Cash Collected Field Is Required',
                'is_cash_collected.boolean' => 'Cash Collected Field Should Be Yes Or No',
            ]);
        }

        if ($order->status === 'arrived_locally') {
            $validated_req = $request->validate([
                'status' => ['required', Rule::in(['arrived_locally', 'delivered'])],
                'is_cash_collected' => ['required', 'boolean'],
            ], [
                'is_cash_collected.required' => 'Cash Collected Field Is Required',
                'is_cash_collected.boolean' => 'Cash Collected Field Should Be Yes Or No',
            ]);
        }

        try {
            DB::beginTransaction();

            if ($order->status === 'pending') {
                $smartphone_ids = $order->orderItems()->pluck('smartphone_id')->toArray();

                $smartphones = $this->smartphone->with(['inventory_items'])->whereIn('id', $smartphone_ids)->get();

                foreach ($smartphones as $smartphone) {

                    $quantity = $order->orderItems()->where('smartphone_id', $smartphone->id)->pluck('quantity')->implode(' ');
                    $inventoryItems = $smartphone->inventory_items()
                        ->where('status', 'on_hold')
                        ->lockForUpdate()
                        ->limit($quantity)
                        ->get();

                    foreach ($inventoryItems as $inventoryItem) {
                        $inventoryItem->status = 'sold';
                        $inventoryItem->save();
                    }
                }
            }

            if (isset($validated_req['status']) && $validated_req['status'] === 'pending' && $order->status === 'pending') {
                throw new Exception('The Status Should Be Changed To Paid Before Proceesing');
            }

            if (isset($validated_req['status']) && $validated_req['status'] === 'paid' && $order->status === 'paid') {
                throw new Exception('The Status Should Be Changed To Shipped Before Proceesing');
            }

            if (isset($validated_req['status']) && $validated_req['status'] === 'shipped' && $order->status === 'shipped') {
                throw new Exception('The Status Should Be Changed To Arrived Locally Before Proceesing');
            }

            if (isset($validated_req['status']) && $validated_req['status'] === 'arrived_locally' && $order->status === 'arrived_locally') {
                throw new Exception('The Status Should Be Changed To Delivered Before Proceesing');
            }

            $oldStatus = $order->status;
            $updated = $order->update($validated_req);

            if (! $updated) {
                throw new Exception('Something Went Wrong While Updating Order');
            }

            DB::commit();

            if ($request->hasFile('payment_proof') && empty($order->payment_proof) && $oldStatus === 'pending') {
                $file = $request->file('payment_proof');
                $new_name = time().uniqid().'.'.$file->getClientOriginalExtension();
                $temp_path = $file->storeAs('temp/uploads', $new_name, 'local');

                dispatch(new PayemntProofStoreOnAWS($temp_path, $order));
            }

            if ($request->hasFile('courier_invoice') && empty($order->courier_invoice) && $oldStatus === 'paid') {
                $file = $request->file('courier_invoice');
                $new_name = time().uniqid().'.'.$file->getClientOriginalExtension();
                $temp_path = $file->storeAs('temp/uploads', $new_name, 'local');

                dispatch(new CourierInvoiceStoreOnAWS($temp_path, $order));
            }

            return [
                'status' => true,
                'message' => 'Order Updated Successfully',
            ];
        } catch (Exception $e) {

            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyOrder(string $id)
    {
        try {
            DB::beginTransaction();
            $order = $this->getSingleOrder($id);

            if (empty($order)) {
                throw new Exception('Order Not Found');
            }

            if ($order->status === 'pending' || $order->status === 'awaiting_payment' || $order->status === 'expired' || $order->status === 'failed') {
                foreach ($order->orderItems as $item) {
                    $quantity = $item->quantity;

                    $inventoryItems = $item->smartphone->inventory_items()
                        ->where('status', 'on_hold')
                        ->limit($quantity)
                        ->get();

                    foreach ($inventoryItems as $inventoryItem) {
                        $inventoryItem->update(['status' => 'in_stock']);
                    }
                }

            }

            if (! empty($order->payment_proof)) {
                dispatch(new PaymentProofDestroyOnAWS($order->payment_proof));
            }

            if (! empty($order->courier_invoice)) {
                dispatch(new CourierInvoiceDestroyOnAWS($order->courier_invoice));
            }

            $deleted = $order->delete();

            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Order');
            }

            DB::commit();

            return [
                'status' => true,
                'message' => 'Order Deleted Successfully',
            ];
        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyOrderBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Something Went Wrong While Deleting Order');
            }

            foreach ($ids as $id) {
                $response = $this->destroyOrder($id);
                if ($response['status'] === false) {
                    throw new Exception($response['message']);
                }
            }

            return [
                'status' => true,
                'message' => 'Selected Orders Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateCashCollectedStatus(string $id)
    {
        try {
            $order = $this->order->find($id);

            if (empty($order)) {
                throw new Exception('Order Not Found');
            }

            if ($order->status === 'pending') {
                throw new Exception('This Status Cannot Be Changed Until The Order Status Is Changed To Paid');
            }

            $updated = $order->update([
                'is_cash_collected' => ! $order->is_cash_collected,
            ]);

            if (! $updated) {
                throw new Exception('Something Went Wrong While Updating Order Cash Collected Status');
            }

            return [
                'status' => true,
                'message' => 'Order Cash Collected Status Updated Successfully',
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getSmartphones()
    {
        return $this->smartphone
            ->with(['model_name', 'selling_info', 'capacity'])
            ->latest()
            ->get()
            ->map(function ($smartphone) {

                $smartphone->name = $smartphone->model_name->name;

                return $smartphone;
            });
    }

    public function getCustomers()
    {
        return $this->customer
            ->with('user')
            ->whereHas('user', function ($query) {
                $query->where('is_active', true);
            })
            ->latest()
            ->get()
            ->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'name' => $customer->user->name,
                ];
            });
    }

    public function customerOrderInvoiceByOrderNo(Request $request, string $order_no)
    {

        try {
            $order = $this->order
                ->with(
                    [
                        'collaborator',
                        'customer',
                        'customer.user',
                        'orderItems',
                        'orderItems.smartphone',
                        'orderItems.smartphone.model_name',
                        'orderItems.smartphone.capacity',
                        'orderItems.smartphone.selling_info',
                        'orderItems.smartphone.category',
                    ]
                )
                ->where('order_no', $order_no)
                ->first();

            if (empty($order)) {

                throw new Exception('Invoice Not Found');
            }

            if ($order->status == 'pending') {
                throw new Exception('Cannot View Invoice Before Payment');
            }

            if ($request->user()->id !== $order->customer->user_id) {

                if (! $request->user()->hasRole('Admin')) {
                    throw new Exception('Invoice Not Found');
                }
            }

            return [
                'status' => true,
                'message' => 'Invoice Found',
                'order' => $order,
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function ShippingOrderInvoice(Request $request, string $order_no)
    {
        try {
            $order = $this->order
                ->with(
                    [
                        'collaborator',
                        'customer',
                        'customer.user',
                        'orderItems',
                        'orderItems.smartphone',
                        'orderItems.smartphone.model_name',
                        'orderItems.smartphone.capacity',
                        'orderItems.smartphone.selling_info',
                        'orderItems.smartphone.category',
                    ]
                )
                ->where('order_no', $order_no)
                ->first();

            if (empty($order)) {
                throw new Exception('Invoice Not Found');
            }

            if (! $request->user()->hasRole('Admin')) {
                throw new Exception('You Are Not Allowed To View This Invoice');
            }

            return [
                'status' => true,
                'message' => 'Invoice Found',
                'order' => $order,
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function placeOrderFromWebsite(Request $request)
    {
        DB::beginTransaction();
        try {
            $payment_method = $request->input('payment_method');
            if (empty($payment_method)) {
                return response()->json(['message' => 'Please Select A Payment Method'], 400);
            }

            $referal_code = $request->input('referal_code');
            $refferalSessionData = $request->session()->get('referal_data');

            $user = $request->user();

            if (empty($user)) {
                throw new Exception('Please Login First');
            }

            $customer = $user->customer;

            if (empty($customer)) {
                throw new Exception('Only Customers Can Place Order');
            }

            $cart_items = $this->cart->where('customer_id', $customer->id)->get();
            if ($cart_items->isEmpty()) {
                throw new Exception('Cart Is Empty');
            }

            $collaborator = $this->collaborator->where('referral_code', ! empty($refferalSessionData) ? $refferalSessionData['referal_code'] : $referal_code)->first();
            if (empty($collaborator) && (! empty($referal_code) || ! empty($refferalSessionData))) {
                throw new Exception('Invalid Referal Code');
            }

            $smartphone_ids = [];
            $smartphone_quantities = [];
            $smartphone_color_ids = [];
            $order_items = [];
            $inventoryItems = [];
            $amount = 0;

            foreach ($cart_items as $item) {
                if ($item->type === 'smartphone') {
                    $smartphone_ids[] = $item->smartphone_id;
                    $smartphone_quantities[$item->smartphone_id] = $item->quantity;
                    $smartphone_color_ids[$item->smartphone_id] = $item->color_id;

                }
            }

            $smartphones = $this->smartphone->with(['selling_info', 'inventory_items', 'model_name', 'category.distributor'])
                ->whereIn('id', $smartphone_ids)
                ->get();

            if ((count($smartphone_ids) !== $smartphones->count()) || $smartphones->isEmpty()) {
                throw new Exception('Invalid Cart Items');
            }

            foreach ($smartphones as $smartphone) {
                if ($smartphone->inventory_items->isEmpty()) {
                    throw new Exception(" {$smartphone->model_name->name} Smartphone Is Out Of Stock Please Check");
                }

                if ($smartphone->inventory_items()->where('status', 'in_stock')->doesntExist()) {
                    throw new Exception("{$smartphone->model_name->name} Smartphone Is Out Of Stock Please Check");
                }

                if ($smartphone->inventory_items()->where('status', 'in_stock')->count() < $smartphone_quantities[$smartphone->id]) {
                    throw new Exception("{$smartphone->model_name->name} Smartphone Has Less Stock But You Have Selected More Quantity Please Check");
                }

                if (empty($smartphone->selling_info)) {
                    throw new Exception("{$smartphone->model_name->name} Smartphone Dont have Selling Price Please Check");
                }

                $quantity = $smartphone_quantities[$smartphone->id];
                $unit_price = $smartphone->selling_info->total_price;
                $sub_total = $smartphone->selling_info->total_price * $quantity;
                $amount += $sub_total;

                $order_items[] = [
                    'smartphone_id' => $smartphone->id,
                    'unit_price' => $unit_price,
                    'quantity' => $quantity,
                    'sub_total' => $sub_total,
                    'color_id' => $smartphone_color_ids[$smartphone->id],
                ];

                $backend_inventoryItems = $smartphone->inventory_items()
                    ->where('status', 'in_stock')
                    ->lockForUpdate()
                    ->limit($quantity)
                    ->get();

                foreach ($backend_inventoryItems as $inventoryItem) {
                    $inventoryItem->status = 'on_hold';
                    $inventoryItem->save();
                }

                $inventoryItems[] = $backend_inventoryItems
                    ->groupBy('smartphone_id')->toArray();

            }

            $order_data = [
                'customer_id' => $customer->id,
                'collaborator_id' => $collaborator ? $collaborator->id : null,
                'amount' => $amount,
                'payment_method' => $payment_method,
            ];

            if ($payment_method === 'bank_transfer') {
                $order = $this->createOrderFromWebsite($order_data, $order_items);

                if ($order['status'] === false) {
                    throw new Exception($order['message']);
                }

                $this->clearCartExistingItems($customer->id);
                DB::commit();

                return [
                    'status' => true,
                    'message' => 'Order Placed Successfully',
                    'order' => $order['order'],
                    'type' => 'bank',
                    'redirect_uri' => route('website.orders.order-view', ['order_no' => $order['order']->order_no]),
                ];

            } elseif ($payment_method === 'crypto') {
                $order = $this->createOrderFromWebsite($order_data, $order_items, 'awaiting_payment');

                $response = $this->now_payment_service->createPaymentSession($order);

                if ($response['status'] === false) {
                    throw new Exception($response['message']);
                }

                $this->clearCartExistingItems($customer->id);
                DB::commit();

                return [
                    'status' => true,
                    'message' => $response['message'],
                    'type' => 'crypto',
                    'redirect_uri' => $response['payment_url'],
                ];

            } elseif ($payment_method === 'points') {
                $response = $this->payWithPoints($user->id, $amount);

                if ($response['status'] === false) {
                    throw new Exception($response['message']);
                }

                $order = $this->createOrderFromWebsite($order_data, $order_items, 'paid');

                if ($order['status'] === false) {
                    throw new Exception($order['message']);
                }

                $this->clearCartExistingItems($customer->id);
                DB::commit();

                return [
                    'status' => true,
                    'message' => 'Order Placed Successfully',
                    'order' => $order['order'],
                    'type' => 'points',
                    'redirect_uri' => route('website.orders.order-view', ['order_no' => $order['order']->order_no]),
                ];

            }

            throw new Exception('Invalid Payment Method');
        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }

    }

    private function createOrderFromWebsite($order_data, $order_items, ?string $status = null)
    {
        try {
            $order = $this->order->create([
                'customer_id' => $order_data['customer_id'],
                'collaborator_id' => $order_data['collaborator_id'],
                'amount' => $order_data['amount'],
                ...(! empty($status) ? ['status' => $status] : []),
                'payment_method' => $order_data['payment_method'],

            ]);

            if (empty($order)) {

                throw new Exception('Something Went Wrong While Placing An Order');
            }

            $order->orderItems()->createMany($order_items);

            return [
                'status' => true,
                'message' => 'Order Placed Successfully',
                'order' => $order,
            ];
        } catch (Exception $e) {

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    private function clearCartExistingItems(string $customer_id)
    {
        return $this->cart->where('customer_id', $customer_id)->delete();
    }

    private function payWithPoints(string $user_id, float $amount)
    {
        try {
            $user = $this->user->with(['reward_points' => function ($q) {
                $q->orderBy('expires_at', 'asc');
            }])->find($user_id);

            if (empty($user)) {
                throw new Exception('User Not Found');
            }

            $total_points = (int) $user->points;

            if ($total_points < $amount) {
                throw new Exception('You Dont Have Enough Points To Pay');
            }

            $remaining = $amount;

            foreach ($user->reward_points as $reward) {
                if ($remaining <= 0) {
                    break;
                }

                if ($reward->points >= $remaining) {

                    $reward->points -= $remaining;
                    $reward->save();
                    $remaining = 0;
                } else {

                    $remaining -= $reward->points;
                    $reward->points = 0;
                    $reward->save();
                }
            }

            return [
                'status' => true,
                'message' => 'Paid With Points',
            ];
        } catch (Exception $e) {

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getCustomerOrders(Request $request)
    {
        $user = $request->user();
        if (empty($user)) {
            return [
                'status' => false,
                'message' => 'Please Login First',
            ];
        }

        if (! $user->hasRole('Customer')) {
            return [
                'status' => true,
                'orders' => [],
                'next_page_url' => null,

            ];
        }

        $customer = $user->customer;

        $orders = $this->order
            ->with(['orderItems', 'orderItems.smartphone'])
            ->withCount('orderItems')
            ->where('customer_id', $customer->id)
            ->latest()
            ->paginate(10);

        $orders->setCollection(
            $orders->getCollection()->transform(function ($order) {
                $order->order_placed_date = $order->created_at->format('M d, Y');

                return $order;
            })
        );

        return [
            'status' => true,
            'orders' => $orders->items(),
            'next_page_url' => $orders->nextPageUrl(),
        ];
    }

    public function getCustomerSingleOrder(string $order_no)
    {
        $order = $this->order->with(
            [
                'collaborator',
                'customer',
                'customer.user',
                'customer.country',
                'orderPackageRecordings',
                'orderItems',
                'orderItems.smartphone',
                'orderItems.smartphone.model_name',
                'orderItems.smartphone.capacity',
                'orderItems.smartphone.selling_info',
                'orderItems.smartphone.category',
                'orderItems.smartphone.category.distributor',
                'orderItems.smartphone.category.distributor.user',
                'orderItems.color',
            ]
        )->where('order_no', $order_no)
            ->first();

        if (! empty($order)) {
            $order->order_placed_date = $order->created_at->format('M d, Y');
        }

        return $order;
    }

    public function uploadPaymentProof(Request $request)
    {

        $request->validate([
            'payment_proof' => ['required', 'image', 'max:5048'],
        ]);

        $order_id = $request->input('order_id');
        $order_no = $request->input('order_no');

        $order = $this->order->where('order_no', $order_no)->where('id', $order_id)->first();

        if (empty($order)) {
            return [
                'status' => false,
                'message' => 'Order Not Found',
            ];
        }

        if (! $request->hasFile('payment_proof')) {
            return [
                'status' => false,
                'message' => 'Payment Proof Not Found',
            ];
        }

        if ($request->hasFile('payment_proof') && empty($order->payment_proof) && $order->status === 'pending') {
            $file = $request->file('payment_proof');
            $new_name = time().uniqid().'.'.$file->getClientOriginalExtension();
            $temp_path = $file->storeAs('temp/uploads', $new_name, 'local');

            dispatch_sync(new PayemntProofStoreOnAWS($temp_path, $order));
            dispatch(new NotifyPaymentProofHasBeenUploaded($order));

            return [
                'status' => true,
                'message' => 'Payment Proof Uploaded Successfully',
            ];
        }

        return [
            'status' => false,
            'message' => 'Something Went Wrong While Uploading Payment Proof',
        ];

    }

    // Not Needed  Becasue Instead Of Using IPN Now I am Using Background Job For Checking Status
    // public function cryptoPaymentIPN(Request $request)
    // {

    //     //
    // }

    public function cryptoPaymentSuccess(Request $request)
    {
        $order = $this->order->where('order_no', $request->order_no)->first();

        if (empty($order)) {
            return [
                'status' => false,
                'message' => 'Order Not Found',
            ];
        }

        if ($order->status === 'awaiting_payment') {

            $order->status = 'blockchain_confirmation_pending';
            $order->np_id = $request->NP_id;
            $order->save();

            $currency = Cache::get('currency');

            $user = $order->customer->user;

            $user->notify(new NotifyCustomerAboutAwaitingPaymentOrderFromCrypto($order, $currency));
        }

        return [
            'status' => true,
        ];

    }

    public function markPackagingVideoViewed(Request $request)
    {

        $package_video_id = $request->input('package_video_id');

        if (empty($package_video_id)) {
            return [
                'status' => false,
                'message' => 'Packaging Video Not Found',
            ];
        }

        $package_video = $this->package_recording->find($package_video_id);

        if (empty($package_video)) {
            return [
                'status' => false,
                'message' => 'Packaging Video Not Found',
            ];
        }

        $package_video->is_opened = true;
        $package_video->save();

        return [
            'status' => true,
            'message' => 'Packaging Video Viewed Successfully',
        ];
    }
}
