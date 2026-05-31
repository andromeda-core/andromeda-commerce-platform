import { create } from 'zustand';

/**
 * Global store controlling whether feed modal unmount cleanup
 * should reset the browser URL to '/'.
 *
 * Default: true (preserves existing behavior).
 *
 * Components that navigate away from a feed modal (e.g., sidebar
 * back button) should call setShouldCleanupBrowserHistory(false)
 * BEFORE triggering navigation. This prevents the feed cleanup
 * useEffect from overwriting the URL the user is navigating to.
 *
 * The cleanup useEffect resets this flag back to true after running,
 * so the next feed mount has default behavior.
 */
export const useFeedCleanupStore = create((set) => ({
    shouldCleanupBrowserHistory: true,

    setShouldCleanupBrowserHistory: (value) =>
        set({ shouldCleanupBrowserHistory: Boolean(value) }),
}));
