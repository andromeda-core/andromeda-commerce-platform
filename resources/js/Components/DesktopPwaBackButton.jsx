import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { useFeedCleanupStore } from '@/Hooks/useFeedCleanupStore';

const DesktopPwaBackButton = ({ __, CustomClassName }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const isStandalone =
            window.matchMedia?.('(display-mode: standalone)')?.matches ||
            window.navigator.standalone === true;

        const isDesktop = window.matchMedia?.('(min-width: 1024px)')?.matches;

        setShow(Boolean(isStandalone && isDesktop));
    }, []);

    if (!show) {
        return null;
    }

   const handleClick = () => {
    try {
        const storedPrevUrl = sessionStorage.getItem('andromeda_prev_url');
        console.log('DesktopPwaBackButton: storedPrevUrl from sessionStorage:', storedPrevUrl);

        if (storedPrevUrl && storedPrevUrl.trim() !== '') {
            useFeedCleanupStore.getState().setShouldCleanupBrowserHistory(false);
            router.visit(storedPrevUrl);
            return;
        }
    } catch (e) {
        // sessionStorage access failed; fall through to native back
    }

    // Normal navigation: behave like the real browser back button.
    // Home/index pushes a synthetic duplicate entry (same URL) on feed
    // load, so a single history.back() can land on an identical-URL entry
    // and appear to do nothing. If the URL did not actually change after
    // going back, step back once more to reach the real previous page.
    const urlBefore = window.location.href;

    const onPop = () => {
        window.removeEventListener('popstate', onPop);

        // If URL is unchanged, we landed on a synthetic same-URL entry.
        // Step back one more time to reach the real previous page.
        if (window.location.href === urlBefore) {
            window.history.back();
        }
    };

    window.addEventListener('popstate', onPop);
    window.history.back();

    // Safety: if no popstate fired (nothing to go back to), clean up.
    setTimeout(() => window.removeEventListener('popstate', onPop), 600);
};

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`text-md menu-item-inactive flex w-full items-center gap-2 rounded-md px-2 py-2.5 transition-colors ${CustomClassName || ''}`}
            title={__('Back')}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M15 18l-6-6 6-6" />
            </svg>
            <span>{__('Back')}</span>
        </button>
    );
};

export default DesktopPwaBackButton;
