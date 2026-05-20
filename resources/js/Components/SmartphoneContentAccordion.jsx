import React, { useEffect, useMemo, useRef, useState } from 'react';
import useDarkMode from '@/Hooks/useDarkMode';

// Does the string contain any HTML tag?
const containsHtml = (str) => {
    if (typeof str !== 'string' || !str.trim()) return false;
    return /<\/?[a-z!][\s\S]*?>/i.test(str);
};

// Fallback text color based on dark/light mode
const getTextColor = (dark) => (dark ? '#e5e7eb' : '#111111');

// Theme-aware + responsive CSS injected into the iframe
const buildFrameCss = (textColor) => `
    html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: transparent !important;
    }
    body {
        color: ${textColor};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        word-wrap: break-word;
        overflow-wrap: break-word;
        overflow-x: hidden;
        -webkit-text-size-adjust: 100%;
    }
    * { box-sizing: border-box; max-width: 100%; }
    img, video, iframe, table, canvas, svg { max-width: 100% !important; height: auto; }
    table { display: block; overflow-x: auto; }
    pre { white-space: pre-wrap !important; word-break: break-word; }
    a { color: #3b82f6; word-break: break-word; }
`;

// Injects theme CSS + syncs the iframe's <html> dark class with the app
const prepareFrameHtml = (html, css, dark) => {
    let out = html;

    // 1. Inject our theme/responsive <style>
    const tag = `<style data-frame-theme="true">${css}</style>`;
    if (/<\/head>/i.test(out)) {
        out = out.replace(/<\/head>/i, `${tag}</head>`);
    } else if (/<head[^>]*>/i.test(out)) {
        out = out.replace(/<head[^>]*>/i, (m) => `${m}${tag}`);
    } else if (/<body[^>]*>/i.test(out)) {
        out = out.replace(/<body[^>]*>/i, (m) => `${m}${tag}`);
    } else {
        out = tag + out;
    }

    // 2. Add/remove "dark" on the iframe's <html> so the seller's
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

// Renders HTML in an isolated, theme-aware, auto-height iframe
const HtmlFrame = ({ html }) => {
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
            sandbox="allow-same-origin allow-scripts"
            className="w-full border-0"
            style={{ height: `${height}px` }}
        />
    );
};

const SmartphoneContentAccordion = ({
    label,
    content,
    isHtml = false,
    defaultOpen = false,
    onToggle = null,
    scrollContainerRef = null,
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const accordionRef = useRef(null);

    // Use content exactly as it is. No processing.
    const renderAsHtml = isHtml && containsHtml(content);

    const handleToggle = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        if (onToggle) onToggle(newState);
    };

    useEffect(() => {
        if (!isOpen || !accordionRef.current || !scrollContainerRef?.current) return;
        const container = scrollContainerRef.current;
        const accordionEl = accordionRef.current;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const containerRect = container.getBoundingClientRect();
                const accordionRect = accordionEl.getBoundingClientRect();
                const offset = accordionRect.top - containerRect.top + container.scrollTop;
                container.scrollTo({ top: offset - 12, behavior: 'smooth' });
            });
        });
    }, [isOpen]);

    return (
        <div className="w-full">
            <button
                onClick={handleToggle}
                className="flex w-full items-center justify-start px-0 py-4 text-left focus:outline-none"
                aria-expanded={isOpen}
            >
                <span className="pr-2 text-base font-medium text-main-text-light dark:text-main-text-dark">
                    {label}
                </span>
                <svg
                    className={`h-5 w-5 flex-shrink-0 text-main-text-light transition-transform duration-200 dark:text-main-text-dark ${
                        isOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="pb-2 pt-2" ref={accordionRef}>
                    {renderAsHtml ? (
                        <HtmlFrame html={content} />
                    ) : (
                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-sub-text-light dark:text-sub-text-dark">
                            {content}
                        </p>
                    )}
                </div>
            )}

            <div className="h-px w-full bg-[#c8c8c8] dark:bg-surface-3-dark" />
        </div>
    );
};

export default SmartphoneContentAccordion;
