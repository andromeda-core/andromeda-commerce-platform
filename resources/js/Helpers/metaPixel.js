// Structured event_id per client instruction: not a raw DB id. Shape:
// {eventType}_{referenceId}_{timestamp}. referenceId should be a stable, non-sensitive reference
// (order_no, reservation number, post public_id, etc.), passed in by the caller. Falls back to a
// random suffix if no reference is available (e.g. PageView, Search have no natural reference).
export const buildEventId = (eventType, referenceId) => {
    const ref = referenceId ?? Math.random().toString(36).slice(2, 10);
    return `${eventType}_${ref}_${Date.now()}`;
};

const isPixelReady = () => typeof window !== 'undefined' && typeof window.fbq === 'function';

export const trackPixelEvent = (eventName, params = {}, eventId) => {
    if (!isPixelReady()) return;
    const finalEventId = eventId ?? buildEventId(eventName);
    window.fbq('track', eventName, params, { eventID: finalEventId });
};

// Dedup guard: Inertia's 'finish' can fire without an actual URL change in some edge cases
// (e.g. partial reloads). Only fire PageView when the URL actually differs from the last fire.
let lastPageViewUrl = null;
export const trackPixelPageView = () => {
    if (!isPixelReady()) return;
    const currentUrl = window.location.href;
    if (currentUrl === lastPageViewUrl) return;
    lastPageViewUrl = currentUrl;
    window.fbq('track', 'PageView');
};

// Order statuses reachable only after the order was genuinely paid at some point. Used to gate
// Purchase firing broadly (not just the exact 'paid' status) so orders viewed after they've
// progressed further (shipped/delivered/refunded) still correctly count as a completed purchase.
// Deliberately excludes every pre-payment/payment-failed state, PLUS two exceptions found by
// reading the actual transition code (not assumed): 'canceled' is excluded because it is reachable
// BOTH before payment (customer cancelation request, only allowed while pending/awaiting_payment)
// AND after payment (admin can directly cancel a 'paid' order via orderCancelationByAdmin, which
// explicitly reverses the attribution reward for that case) — genuinely ambiguous, so left out per
// the accuracy-over-completeness rule. 'refund_rejected' is excluded because, despite being a valid
// DB enum value, no code path ever actually assigns it to Order.status (OrderRefund's status-sync
// hook maps a rejected refund back to previous_status, never to the literal 'refund_rejected').
export const PAID_OR_LATER_ORDER_STATUSES = [
    'paid',
    'shipped',
    'arrived_locally',
    'delivered',
    'refund_requested',
    'refund_approved',
    'refund_completed',
];

export const isPaidOrLaterOrderStatus = (status) => PAID_OR_LATER_ORDER_STATUSES.includes(status);

// Reservation statuses reachable only after the reservation was genuinely confirmed. Mirrors
// isPaidOrLaterOrderStatus for the lodging Schedule event. COMPLETED is included even though no
// current code path sets it yet (post-stay completion isn't built) because it can only logically
// follow CONFIRMED. CANCELLED is deliberately excluded: no code path sets it today either, and
// unlike COMPLETED its future before/after-CONFIRMED reachability is unresolved (mirrors the
// order-side 'canceled' ambiguity), so it defaults to excluded rather than guessed.
export const CONFIRMED_OR_LATER_RESERVATION_STATUSES = ['CONFIRMED', 'COMPLETED'];

export const isConfirmedOrLaterReservationStatus = (status) =>
    CONFIRMED_OR_LATER_RESERVATION_STATUSES.includes(status);
