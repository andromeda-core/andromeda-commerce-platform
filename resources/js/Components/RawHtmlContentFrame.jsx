import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import useDarkMode from '@/Hooks/useDarkMode';

/**
 * Shared trusted raw-HTML renderer — the SAME isolated, theme-aware, auto-height
 * iframe mechanism used for smartphone product descriptions
 * (SmartphoneContentAccordion imports `HtmlFrame` + `containsHtml` from here, so
 * smartphone and posts render through one shared code path).
 *
 * The default export, <RawHtmlContentFrame>, adds hybrid routing for POSTS:
 *
 *   - content with embedded product cards  -> rendered INLINE (dangerouslySetInnerHTML)
 *     so the parent surface's useProductCardHydration can hydrate the cards via
 *     React portals. Portals cannot reach into a sandboxed iframe, so such
 *     content must never go into the frame.
 *   - other raw/code-based HTML            -> rendered in the isolated iframe
 *     (HtmlFrame), exactly like a smartphone description.
 *   - plain text                           -> rendered inline (preserves the
 *     existing look of older plain-text posts).
 *
 * Trusted-author feature: the HTML is rendered unsanitized, identical to the
 * existing smartphone/post content surfaces. Only feed it content authored
 * through the trusted dashboard.
 */

// Does the string contain any HTML tag?
export const containsHtml = (str) => {
    if (typeof str !== 'string' || !str.trim()) return false;
    return /<\/?[a-z!][\s\S]*?>/i.test(str);
};

// Does the content embed interactive product cards? Such content must render
// INLINE (in the React document) so the parent surface can hydrate the cards
// via portals — they cannot live inside the isolated iframe.
export const hasProductCards = (str) =>
    typeof str === 'string' && /data-type\s*=\s*["']product-card["']/i.test(str);

// Fallback text color based on dark/light mode
const getTextColor = (dark) => (dark ? '#e5e7eb' : '#111111');

// Theme-aware + responsive CSS injected into the iframe
const buildFrameCss = (textColor) => `
    html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: transparent !important;
        scrollbar-width: none;        /* Firefox */
        -ms-overflow-style: none;     /* IE / old Edge */
    }
    html::-webkit-scrollbar,
    body::-webkit-scrollbar {
        display: none;                /* Chrome / Safari / WebKit */
        width: 0;
        height: 0;
    }
    body {
        color: ${textColor};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        word-wrap: break-word;
        overflow-wrap: break-word;
        overflow-x: hidden;
        -webkit-text-size-adjust: 100%;
        text-align: center;
        padding: 12px !important;
    }
    body, p, h1, h2, h3, h4, h5, h6, span, div, li, td, blockquote, section, article {
        text-align: center !important;
    }
    * { box-sizing: border-box; max-width: 100%; }
    video, iframe, table, canvas, svg { max-width: 100% !important; height: auto; }
    /* Center + make responsive every description image by default.
       Author HTML lives inside this isolated iframe, so this is the only
       place a rule can actually reach the images. !important is limited to
       the centering props (display / margins / float) so it overrides
       inline styles + float utilities while staying scoped to the iframe. */
    img {
        display: block !important;
        max-width: 100% !important;
        height: auto !important;
        margin-left: auto !important;
        margin-right: auto !important;
        float: none !important;
    }
    table { display: block; overflow-x: auto; }
    pre { white-space: pre-wrap !important; word-break: break-word; }
    a { color: #3b82f6; word-break: break-word; }
`;

// Injects theme CSS + syncs the iframe's <html> dark class with the app
const prepareFrameHtml = (html, css, dark) => {
    let out = html;

    // 1. Inject our theme/responsive <style>
const tag = `<style data-frame-theme="true">${css}</style><base target="_blank" rel="noopener noreferrer">`;
    if (/<\/head>/i.test(out)) {
        out = out.replace(/<\/head>/i, `${tag}</head>`);
    } else if (/<head[^>]*>/i.test(out)) {
        out = out.replace(/<head[^>]*>/i, (m) => `${m}${tag}`);
    } else if (/<body[^>]*>/i.test(out)) {
        out = out.replace(/<body[^>]*>/i, (m) => `${m}${tag}`);
    } else {
        out = tag + out;
    }

    // 2. Add/remove "dark" on the iframe's <html> so the author's
    //    dark:* Tailwind classes activate correctly
    if (/<html[^>]*>/i.test(out)) {
        out = out.replace(/<html([^>]*)>/i, (match, attrs) => {
            const cleaned = attrs.replace(/\sclass=("[^"]*"|'[^']*')/i, '');
            return `<html${cleaned} class="${dark ? 'dark' : ''}">`;
        });
    } else {
        out = `<html class="${dark ? 'dark' : ''}">${out}</html>`;
    }

    return out;
};

// Renders HTML in an isolated, theme-aware, auto-height iframe.
// Exported so SmartphoneContentAccordion renders through the identical code.
export const HtmlFrame = ({ html, interactive = false }) => {
    const iframeRef = useRef(null);
    const [height, setHeight] = useState(300);
    const dark = useDarkMode();

    const finalHtml = useMemo(
        () => prepareFrameHtml(html, buildFrameCss(getTextColor(dark)), dark),
        [html, dark],
    );

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;
        let observer;

        const resize = () => {
            try {
                const doc = iframe.contentDocument;
                if (doc) {
                    setHeight(doc.documentElement?.scrollHeight || doc.body?.scrollHeight || 300);
                }
            } catch (e) {}
        };

        const onLoad = () => {
            resize();
            try {
                const doc = iframe.contentDocument;
                if (doc?.body && 'ResizeObserver' in window) {
                    observer = new ResizeObserver(resize);
                    observer.observe(doc.body);
                }
            } catch (e) {}
            setTimeout(resize, 300);
            setTimeout(resize, 1200);
        };

        iframe.addEventListener('load', onLoad);
        onLoad();

        return () => {
            iframe.removeEventListener('load', onLoad);
            if (observer) observer.disconnect();
        };
    }, [finalHtml]);

    return (
        <iframe
            ref={iframeRef}
            srcDoc={finalHtml}
            title="product-description"
           sandbox={
    interactive
        ? 'allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox'
        : 'allow-same-origin allow-scripts'
}
            className="w-full border-0"
           style={{
    height: `${height}px`,
    pointerEvents: interactive ? 'auto' : 'none',
}}
        />
    );
};

/**
 * Hybrid post-content renderer. forwardRef so the parent surface keeps a ref to
 * the inline content node for product-card hydration / measurement.
 *
 * Props:
 *  - content   : the raw HTML string (pass the translated value, e.g.
 *                content_display ?? content)
 *  - className : wrapper classes (the surface's existing content wrapper)
 */
const RawHtmlContentFrame = forwardRef(function RawHtmlContentFrame(
    { content, className, interactive = false },
    ref,
) {
    if (!content) return null;

    if (containsHtml(content) && !hasProductCards(content)) {
        return (
            <div ref={ref} className={className}>
                <HtmlFrame html={content} interactive={interactive} />
            </div>
        );
    }

    return (
        <div
            ref={ref}
            className={className}
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
});

export default RawHtmlContentFrame;
