import React, { useState, useEffect } from 'react';
import { useBottomBarStore } from '@/Hooks/useBottomBarStore';

const BottomBarToggle = () => {
    const { isVisible, toggleVisibility, barHeight } = useBottomBarStore();
    const [showPulse, setShowPulse] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowPulse(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <button
            onClick={toggleVisibility}
            className={`fixed left-1/2 -translate-x-1/2 z-[70]  p-2 mb-2 transition-all duration-300 bg-zinc-800/60 backdrop-blur-sm  rounded-full shadow-lg  dark:bg-zinc-800/20  hover:scale-110 active:scale-95 ${showPulse && !isVisible ? 'animate-pulse' : ''
                }`}
            style={{
                bottom: isVisible ? `${barHeight + 10}px` : '0px',
                transition: 'bottom 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            aria-label={isVisible ? 'Hide bottom bar' : 'Show bottom bar'}
        >
            {isVisible ? (
                // Down Arrow
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-white"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                    />
                </svg>
            ) : (
                // Up Arrow
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-white"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
                    />
                </svg>
            )}
        </button>
    );
};

export default BottomBarToggle;
