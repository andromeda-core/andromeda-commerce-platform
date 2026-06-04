<?php

namespace App\Services;

use Illuminate\Support\Collection;

class CartPriceCalculator
{
    public function calculate(Collection $cart, Collection $addons, ?int $destinationCountryId = null): array
    {
        $cartSubtotal = 0.00;
        $addonsSubtotal = 0.00;
        $shippingTotal = 0.00;
        $importTaxTotal = 0.00;

        // Calculating Total From Cart
        $cartSubtotal = $cart->sum(function ($item) {

            return (float) $item->unit_price * $item->quantity;
        });



        if ($addons->isNotEmpty()) {
            $addonsSubtotal += $addons->sum(function ($addon) {
                return (float) $addon->unit_price * $addon->quantity;
            });
        }

        // Calculating Total From Cart For Taxes and Additional COSTS
        foreach ($cart as $item) {

            $shipping_fee = $item->smartphone->selling_info->resolveShippingFee($destinationCountryId);
            if (! empty($shipping_fee)) {
                $shippingTotal += (float)
                    $this->calculateShippingCost($shipping_fee, $item->smartphone) * $item->quantity;
            }

            $import_tax = $item->smartphone->selling_info->resolveImportTax($destinationCountryId);
            if (! empty($import_tax)) {
                $importTaxTotal +=
                   (float) $this->calculateImportCost($import_tax, $item->smartphone);
            }
        }
        $grandTotal = $cartSubtotal + $addonsSubtotal + $shippingTotal + $importTaxTotal;

        return [
            'items_total' => number_format($cartSubtotal + $addonsSubtotal, 2, '.', ''),
            'cart_subtotal' => number_format($cartSubtotal, 2, '.', ''),
            'addons_subtotal' => number_format($addonsSubtotal, 2, '.', ''),
            'shipping_fee' => number_format($shippingTotal, 2, '.', ''),
            'import_tax' => number_format($importTaxTotal, 2, '.', ''),
            'total' => number_format($grandTotal, 2, '.', ''),
        ];
    }

    private function calculateShippingCost($shipping_fee, $smartphone)
    {
        if (empty($shipping_fee)) {
            return 0;
        }

        $value_type = $shipping_fee->value_type;
        $default_value = $shipping_fee->default_value;

        if ($value_type === 'fixed') {
            return (float) $default_value;
        }

        return ((float) $smartphone->selling_info->total_price * (float) $default_value) / 100;
    }

    private function calculateImportCost($import_tax, $smartphone)
    {
        if (empty($import_tax)) {
            return 0;
        }

        $value_type = $import_tax->value_type;
        $default_value = $import_tax->default_value;

        if ($value_type === 'fixed') {
            return (float) $default_value;
        }

        return ((float) $smartphone->selling_info->total_price * (float) $default_value) / 100;
    }
}
