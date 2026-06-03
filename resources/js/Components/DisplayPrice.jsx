import { useTranslation } from '@/Hooks/useTranslation';
import { usePage } from '@inertiajs/react';

/**
 * DisplayPrice
 *
 * Converts a USD base amount to the visitor's active display currency using
 * the `displayCurrency` Inertia shared prop (resolved by CurrencyResolverService).
 *
 * DISPLAY-ONLY — must never be used in cart, checkout, orders, commissions,
 * rewards, or any financial calculation. Always use raw USD values for
 * business logic; this component is for rendering only.
 *
 * @param {number|string}   usdAmount          Base price in USD (as stored in the database).
 * @param {boolean}         showEstimatedLabel  Show "Estimated" hint when not the USD fallback. (default: true)
 * @param {boolean}         showBaseUsd         Also render the USD base amount below converted price. (default: false)
 * @param {boolean}         showCode            Prepend the currency code before the symbol ("USD $1,000" vs "$1,000"). (default: false)
 * @param {'sm'|'md'|'lg'}  size               Typography scale. (default: 'md')
 * @param {string}          className           Extra Tailwind classes for the outer wrapper. (default: '')
 * @param {boolean}         paymentDisplay      Show USD prominently with an approximate local conversion and a "payment in USD" note. The approx line and note hide when the display currency equals the active currency. (default: false)
 */
export default function DisplayPrice({
    usdAmount,
    showEstimatedLabel = false,
    showBaseUsd = false,
    showCode = false,
    size = 'md',
    className = '',
    paymentDisplay = true,
}) {
    const { displayCurrency } = usePage().props;

    const { __ } = useTranslation();

    // ── Guard: invalid / zero / missing amount ────────────────────────────────
    // null, undefined, NaN, and 0 all render a dash — no price to show.
    const parsedUsd = parseFloat(usdAmount);
    if (usdAmount == null || isNaN(parsedUsd) || parsedUsd === 0) {
        return <span className={className}>—</span>;
    }

    // ── Guard: displayCurrency missing from shared props (purely defensive) ───
    // Should never happen because HandleInertiaRequests always shares it, but
    // if the component is ever used outside the website layout, degrade safely.
    if (!displayCurrency) {
        const raw = parsedUsd.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        });
        return <span className={className}>{showCode ? `USD $ ${raw}` : `$ ${raw}`}</span>;
    }

    // ── Conversion ────────────────────────────────────────────────────────────
    // Default rate to 1 so a missing/zero rate always shows the raw USD value.
    const rate = parseFloat(displayCurrency.exchange_rate || 1);
    const symbol = displayCurrency.symbol || '$';
    const code = displayCurrency.code || 'USD';
    const isFallback = !!displayCurrency.is_fallback;

    const converted = parsedUsd * rate;
    const formatted = converted.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });

    // ── Typography scale ──────────────────────────────────────────────────────
    const priceClass =
        size === 'sm'
            ? 'text-sm font-semibold'
            : size === 'lg'
              ? 'text-lg font-bold'
              : 'text-base font-bold'; // 'md' default

    const labelClass = size === 'sm' ? 'text-[10px]' : 'text-xs';

    // ── Conditional rendering flags ───────────────────────────────────────────
    // "Estimated" label: only when actively converting (non-fallback) AND caller
    // has opted in. Never shown for the USD fallback — no conversion is happening.
    const showEstimated = showEstimatedLabel && !isFallback;

    // USD base line: only when the display currency differs from USD AND caller
    // has opted in. If already showing USD there is nothing to compare against.
    const showUsdBase = showBaseUsd && code !== 'USD';

    const usdFormatted = parsedUsd.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });

    // ── Payment-style display (opt-in, additive) ──────────────────────────────
    // USD shown prominently (payment is always processed in USD), with an
    // approximate local conversion and a note. The approx line and note hide
    // when there is no real conversion (display currency == active currency):
    // detected dynamically via `isFallback` or a rate of 1, so it follows the
    // globally active currency without hardcoding any currency code.
    // When `paymentDisplay` is false (default), this branch is skipped and the
    // component renders exactly as before.
    if (paymentDisplay) {
        const noConversion = isFallback || rate === 1;
        const usdPaymentFormatted = parsedUsd.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        return (
            <div className={`flex flex-col gap-0 ${className}`.trim()}>
                {/* USD base — the actual amount charged */}
                <span className={priceClass}>{`$ ${usdPaymentFormatted}`}</span>

                {/* Approximate local conversion — hidden when display == active currency */}
                {!noConversion && (
                    <span className={`${labelClass}`}>
                        {`${__('Approx')}.${symbol} ${formatted}`}
                    </span>
                )}

                {/* Payment currency note — hidden when display == active currency */}
                {!noConversion && (
                    <span className={`${labelClass}`}>
                        {__('Final payment will be processed in USD.')}
                    </span>
                )}
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className={`flex flex-col gap-0 ${className}`.trim()}>
            {/* Converted price */}
            <span
                className={`${priceClass ? `${priceClass} ` : 'text-main-text-light dark:text-main-text-dark'} `}
            >
                {showCode ? `${code} ${symbol} ${' '} ${formatted}` : `${symbol} ${formatted}`}
            </span>

            {/* "Estimated" hint — shown when a real conversion took place */}
            {showEstimated && (
                <span className={`${labelClass} text-sub-text-light dark:text-sub-text-dark`}>
                    {__('Estimated')}
                </span>
            )}

            {/* Original USD amount — shown when display currency ≠ USD */}
            {showUsdBase && (
                <span className={`${labelClass} text-sub-text-light dark:text-sub-text-dark`}>
                    ≈ ${usdFormatted} USD
                </span>
            )}
        </div>
    );
}
