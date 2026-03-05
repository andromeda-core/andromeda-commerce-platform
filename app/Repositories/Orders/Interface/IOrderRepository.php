<?php

namespace App\Repositories\Orders\Interface;

use Illuminate\Http\Request;

interface IOrderRepository
{
    public function getAllOrders(Request $request);

    public function getSingleOrder(string $id);

    public function getSingleOrderByNo(string $order_no);

    // public function storeOrder(Request $request);

    public function updateOrder(Request $request, string $id);

    public function assignSupplier(Request $request);

    public function destroyOrder(string $id);

    public function destroyOrderBySelection(Request $request);

    public function updateCashCollectedStatus(string $id);

    public function getSmartphones();

    public function getCustomers();

    public function customerOrderInvoiceByOrderNo(Request $request, string $order_no);

    public function ShippingOrderInvoice(Request $request, string $order_no);

    public function placeOrderFromWebsite(Request $request);

    public function getCustomerOrders(Request $request);

    public function getCustomerSingleOrder(Request $request, string $order_no);

    public function uploadPaymentProof(Request $request);

    public function cryptoPaymentSuccess(Request $request);

    // Not Needed  Becasue Instead Of Using IPN Now I am Using Background Job For Checking Status
    // public function cryptoPaymentIPN(Request $request);

    public function markPackagingVideoViewed(Request $request);

    public function refundOrderDoesntExists(Request $request, string $order_no);

    public function refundRequestStore(Request $request, string $order_no);

    public function orderAddressChangeRequestDoesntExists(Request $request, string $order_no);

    public function ShippingAddressChangeRequestStore(Request $request, string $order_no);

    public function payNow(Request $request);

    public function AddressChangeRequestWithdrawl(Request $request);

    public function RefundRequestWithdrawl(Request $request);

    public function reOrder(Request $request);

    public function supplierAssignedOrders(Request $request);

    public function fulfillOrderStockDetails(Request $request, ?string $id = null);

    public function fulfillOrderStock(Request $request);

    public function orderCancelationByAdmin(Request $request);

    public function orderProductIMEIVerification(Request $request);
}
