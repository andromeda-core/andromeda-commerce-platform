import useWindowSize from '@/Hooks/useWindowSize';
import { usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';

const PWAAlertBar = ({ onClose }) => {
    const { generalSetting } = usePage().props;

    const windowSize = useWindowSize();
    const [isVisible, setIsVisible] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);

            const showTimer = setTimeout(() => setIsVisible(true), 400);
            return () => clearTimeout(showTimer);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) {
            console.log('No install prompt available.');
            return;
        }

        setIsVisible(false);

        setTimeout(async () => {
            onClose?.();

            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('✅ User accepted the install prompt');
            } else {
                console.log('❌ User dismissed the install prompt');
            }

            setDeferredPrompt(null);
        }, 500);
    };

    const handleClose = () => {
        setIsVisible(false);

        setTimeout(() => {
            onClose?.();
        }, 500);
    };

    return (
        <div
            className={`pointer-events-none fixed left-0 right-0 z-40 flex items-end justify-center p-4 ${windowSize.width < 1024 ? 'bottom-14' : 'bottom-0'} `}
        >
            <div
                className={`pointer-events-auto w-full max-w-md transform transition-all duration-500 ease-out ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                }`}
            >
                <div className="p-4 border shadow-2xl rounded-2xl border-slate-300 bg-white/90 text-slate-800 backdrop-blur-xl dark:border-slate-700/50 dark:bg-deepcharcoal/90 dark:text-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-gray-900">
                            {generalSetting?.app_favicon ? (
                                <img src={generalSetting?.app_favicon} alt="Logo" />
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5 text-blue-500 dark:text-blue-400"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                                    />
                                </svg>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-tight text-slate-900 dark:text-white">
                                Install App
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                For seamless experience
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleInstall}
                                className="rounded-lg bg-indigo-500 px-4 py-1.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-indigo-600"
                            >
                                Install
                            </button>
                            <button
                                onClick={handleClose}
                                className="flex items-center justify-center w-8 h-8 transition-colors duration-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700/50"
                                aria-label="Close"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-4 h-4 text-slate-500 dark:text-slate-400"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18 18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PWAAlertBar;
