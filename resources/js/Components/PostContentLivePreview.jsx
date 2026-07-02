import React, { useRef, useState } from 'react';
import RawHtmlContentFrame from '@/Components/RawHtmlContentFrame';
import useProductCardHydration from '@/Hooks/useProductCardHydration';

/**
 * The actual rendered body of the live preview.
 *
 * Isolated into its own component so it only MOUNTS when the panel is expanded. Because
 * useProductCardHydration only re-scans on a `contentKey` change, mounting fresh on expand
 * is what guarantees the product-card portal scan runs (useEffect always runs on mount),
 * while keeping the RawHtmlContentFrame + useProductCardHydration wiring exactly as before.
 */
function PostContentLivePreviewBody({ content }) {
    const previewRef = useRef(null);

    // Keyed on content itself so it re-scans on every change (RawHtmlContentFrame re-applies
    // its inline dangerouslySetInnerHTML on every content change, so the portal targets need
    // re-finding). The hook's own 50ms debounce prevents refetching on every keystroke.
    const productCardPortals = useProductCardHydration(previewRef, content);

    return (
        <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-white/5">
            <RawHtmlContentFrame
                ref={previewRef}
                content={content}
                className="prose max-w-none whitespace-pre-line break-words text-gray-800 dark:prose-invert dark:text-white/80"
                interactive
            />
            {productCardPortals}
        </div>
    );
}

/**
 * True in-context live preview of a post's body for the Posts editor.
 *
 * Renders the FULL content (text + product card(s), in their exact positions) through the
 * SAME pipeline the live site uses for post bodies:
 *   <RawHtmlContentFrame ref> + useProductCardHydration(ref, contentKey) + {portals}
 * exactly as DesktopFeed.jsx / Dashboard/Posts/show.jsx wire it. Works identically for an
 * existing post's content (on edit page load) and freshly pasted content (updates live).
 *
 * Collapsible for convenience: default collapsed, so the preview body is NOT mounted (and no
 * hydration/portal work runs) until the user expands it.
 *
 * Read-only: consumes ONLY the `content` prop, never calls setData, zero interaction with
 * translations or AI-translation.
 */
export default function PostContentLivePreview({ content }) {
    const [expanded, setExpanded] = useState(false);

    const hasContent = typeof content === 'string' && content.trim() !== '';
    if (!hasContent) return null;

    return (
        <div className="mt-2">
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex w-full items-center justify-between text-sm font-medium text-main-text-light dark:text-main-text-dark"
            >
                <span>Live Preview</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`size-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            </button>

            {expanded && <PostContentLivePreviewBody content={content} />}
        </div>
    );
}
