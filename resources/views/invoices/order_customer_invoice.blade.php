@php
    $fmt = new \NumberFormatter('en_US', \NumberFormatter::DECIMAL);
    $fmt->setAttribute(\NumberFormatter::MIN_FRACTION_DIGITS, 0);
    $fmt->setAttribute(\NumberFormatter::MAX_FRACTION_DIGITS, 2);
@endphp

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Invoice - {{ $order->order_no }}</title>
</head>

<body style="margin:0; font-family:Arial, Helvetica, sans-serif; background:#f3f4f6;">

    <div style="
    max-width:1100px;
    margin:0 auto;
    background:#ffffff;
    min-height:100vh;
">

        <div style="
        background:#1f2937;
        color:#ffffff;
        padding:24px;
    ">
            <table width="100%">
                <tr>
                    <td valign="top">
                        <div
                            style="
                        width:56px;
                        height:56px;
                        margin-bottom:12px;

                    ">
                            @php
                                $logoPath = $generalSetting?->app_main_logo_dark
                                    ? $generalSetting->app_main_logo_dark
                                    : public_path('assets/images/Logo/256w.png');

                                try {
                                    if (filter_var($logoPath, FILTER_VALIDATE_URL)) {
                                        // If it's AWS URL, fetch and encode
        $logoData = @file_get_contents($logoPath);
    } else {
        // If it's local file
                                        $logoData = @file_get_contents($logoPath);
                                    }

                                    $logoBase64 = $logoData
                                        ? 'data:image/png;base64,' . base64_encode($logoData)
                                        : null;
                                } catch (\Exception $e) {
                                    $logoBase64 = null;
                                }
                            @endphp

                            @if ($logoBase64)
                                <img src="{{ $logoBase64 }}" width="56" height="56" style="display:block;">
                            @endif
                        </div>

                        <h1 style="margin:0; font-size:22px; font-weight:700; color:#ffffff;">
                            {{ $generalSetting->app_name }}
                        </h1>

                        <p style="margin:6px 0 0; font-size:14px; color:#ffffff;">
                            {{ $order->customer?->user?->email ?? 'N/A' }}<br>
                            {{ $order->customer?->user?->phone ?? 'N/A' }}
                        </p>
                    </td>

                    <td valign="top" align="right">
                        <h2 style="margin:0; font-size:26px; font-weight:700; color:#ffffff;">INVOICE</h2>

                        <p style="margin:12px 0 0; font-size:14px; color:#ffffff;">
                            Invoice No:<br>
                            <strong>#{{ $order->order_no }}</strong>
                        </p>

                        <p style="margin:6px 0 0; font-size:14px; color:#ffffff;">
                            Date: {{ $order->added_at }}<br>
                            Status: <strong>{{ strtoupper(str_replace('_', ' ', $order->status)) }}</strong>
                        </p>
                    </td>
                </tr>
            </table>
        </div>

        <div style="padding:24px; border-bottom:1px solid #e5e7eb;">
            <h3 style="margin:0 0 12px; font-size:18px; color:#374151;">
                Shipping Details
            </h3>

            <div
                style="
        background:#f9fafb;
        padding:16px;
        border-radius:8px;
        font-size:14px;
        color:#374151;
        line-height:1.5;
        word-break:break-word;
    ">
                {{-- Name --}}
                <strong>
                    {{ $order?->shipping_name ?: '' }}
                </strong>
                <br>

                {{-- Address line 1 + line 2 --}}
                {{ $order?->shipping_address_line1 ?: '' }}
                @php
                    $addressLine2 = $order?->shipping_address_line2;
                @endphp

                @if ($addressLine2)
                    , {{ $addressLine2 }}
                @endif
                <br>

                {{-- City --}}
                {{ $order?->shipping_city ?: '' }}
                <br>

                {{-- State --}}
                {{ $order?->shipping_state ?: '' }}
                <br>

                {{-- Postal Code --}}
                {{ $order?->shipping_postal_code ?: '' }}
                <br><br>

                {{ $order?->shipping_country ?: '' }}
                <br><br>

                {{-- Phone --}}
                {{ $order?->shipping_phone ?: '' }}
            </div>


            <div style="padding:24px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                    <thead>
                        <tr style="border-bottom:2px solid #d1d5db;">
                            <th align="left" style="padding:10px; font-size:14px;">Product</th>
                            <th align="left" style="padding:10px; font-size:14px;">Capacity</th>
                            <th align="right" style="padding:10px; font-size:14px;">Price</th>
                            <th align="center" style="padding:10px; font-size:14px;">Qty</th>
                            <th align="right" style="padding:10px; font-size:14px;">Total</th>
                        </tr>
                    </thead>

                    <tbody>
                        @foreach ($order->orderItems as $item)
                            @php
                                $addonsTotal = $item->smartphoneAddons->sum('total_price');
                                $itemGrandTotal = $item->sub_total + $addonsTotal;
                            @endphp

                            {{-- MAIN ROW --}}
                            <tr style="border-bottom:1px solid #e5e7eb;">
                                <td style="padding:14px; font-weight:600;">
                                    {{ $item->smartphone->model_name->name }}
                                </td>
                                <td style="padding:14px; color:#6b7280;">
                                    {{ $item->smartphone->capacity->name }}
                                </td>
                                <td align="right" style="padding:14px;">
                                    {{ $currency->symbol }}{{ $fmt->format((float) $item->unit_price) }}
                                </td>
                                <td align="center" style="padding:14px;">
                                    {{ $item->quantity }}
                                </td>
                                <td align="right" style="padding:14px; font-weight:700;">
                                    {{ $currency->symbol }}{{ $fmt->format((float) $itemGrandTotal) }}
                                </td>
                            </tr>

                            {{-- BREAKDOWN --}}
                            <tr style="background:#f9fafb;">
                                <td colspan="5" style="padding:14px; font-size:13px; color:#4b5563;">
                                    <table width="100%">
                                        <tr>
                                            <td>Product ({{ number_format($item->unit_price, 2) }} ×
                                                {{ $item->quantity }})
                                            </td>
                                            <td align="right">
                                                {{ $currency->symbol }}{{ $fmt->format((float) $item->unit_price * $item->quantity) }}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Shipping</td>
                                            <td align="right">
                                                {{ $currency->symbol }}{{ $fmt->format((float) $item->shipping_cost) }}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Import Tax</td>
                                            <td align="right">
                                                {{ $currency->symbol }}{{ $fmt->format((float) $item->import_cost) }}
                                            </td>
                                        </tr>

                                        @if ($item->smartphoneAddons->count())
                                            <tr>
                                                <td colspan="2">
                                                    <hr style="border:none;border-top:1px dashed #d1d5db;">
                                                </td>
                                            </tr>

                                            <tr>
                                                <td colspan="2" style="font-size:12px; font-weight:600;">Add-ons</td>
                                            </tr>

                                            @foreach ($item->smartphoneAddons as $addon)
                                                <tr>
                                                    <td>{{ $addon?->name ?? 'N/A' }} ×
                                                        {{ $addon?->quantity ?? 'N/A' }}
                                                    </td>
                                                    <td align="right">
                                                        {{ $currency->symbol }}{{ $fmt->format((float) $addon?->total_price) }}
                                                    </td>
                                                </tr>
                                            @endforeach

                                            <tr style="font-weight:600;">
                                                <td>Add-ons total</td>
                                                <td align="right">
                                                    {{ $currency->symbol }}{{ $fmt->format((float) $addonsTotal) }}
                                                </td>
                                            </tr>
                                        @endif
                                    </table>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>

                {{-- TOTAL --}}
                <div style="margin-top:24px; text-align:right;">
                    <strong style="font-size:18px;">
                        Total:
                        <span style="color:#2563eb;">
                            {{ $currency->symbol }}{{ $fmt->format((float) $order->full_amount) }}
                        </span>
                    </strong>
                </div>
            </div>


            <div style="padding:24px; text-align:center; border-top:1px solid #e5e7eb;">
                <img src="data:image/png;base64,{!! base64_encode(
                    QrCode::format('png')->size(120)->generate(route('orders.customer-order-invoice', $order->order_no)),
                ) !!}">
                <p style="font-size:12px; color:#6b7280; margin-top:8px;">
                    Scan To Verify Invoice
                </p>
            </div>

        </div>
</body>

</html>
