import React, { useEffect, useState } from 'react';
import { useFeedCleanupStore } from '@/Hooks/useFeedCleanupStore';
import goBackOrHome from '@/Helpers/backNavigationHelper';

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
        useFeedCleanupStore.getState().setShouldCleanupBrowserHistory(false);
    } catch (e) {}

   goBackOrHome();
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
