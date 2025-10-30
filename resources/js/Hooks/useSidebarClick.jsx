import { useState, useEffect, useRef } from 'react';

export default function useSidebarClick() {
    const [isSidebarClickActive, setIsSidebarClickActive] = useState(false);
    const timeoutRef = useRef(null);

    useEffect(() => {
        const handleGlobalClick = (e) => {
            // Check if click originated from sidebar
            const sidebarLink = e.target.closest('[data-sidebar-link="true"]');

            if (sidebarLink) {
                setIsSidebarClickActive(true);

                // Clear any existing timeout
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }

                // Reset flag after a short delay
                timeoutRef.current = setTimeout(() => {
                    setIsSidebarClickActive(false);
                }, 150); // Short window to catch the navigation event
            }
        };

        document.addEventListener('click', handleGlobalClick, true); // Use capture phase

        return () => {
            document.removeEventListener('click', handleGlobalClick, true);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return isSidebarClickActive;
}
