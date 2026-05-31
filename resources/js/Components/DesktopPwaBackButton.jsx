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

            if (storedPrevUrl && storedPrevUrl.trim() !== '') {
                // Disable feed cleanup BEFORE navigating, so any open
                // feed modal's unmount cleanup does not reset the URL
                // that we are about to navigate to.
                useFeedCleanupStore.getState().setShouldCleanupBrowserHistory(false);
                router.visit(storedPrevUrl);
                return;
            }
        } catch (e) {
            // sessionStorage access failed; fall through to default
        }

        // Default fallback: browser back
        window.history.back();
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
