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
