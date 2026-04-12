import { useEffect, useState } from 'react';

export default function useDarkMode() {
    const [isDarkMode, setIsDarkMode] = useState(document.body.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver(() => {
            const hasDark = document.body.classList.contains('dark');
            setIsDarkMode(hasDark);
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    return isDarkMode;
}
