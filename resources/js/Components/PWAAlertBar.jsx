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
            return;
        }

        setIsVisible(false);

        setTimeout(async () => {
            onClose?.();

            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            // if (outcome === 'accepted') {
            //     console.log('✅ User accepted the install prompt');
            // } else {
            //     console.log('❌ User dismissed the install prompt');
            // }

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
            className={`pointer-events-none fixed left-0 right-0 z-40 flex items-end justify-center p-4 ${isVisible && windowSize.width <= 1024 ? 'bottom-14' : 'bottom-0'} `}
        >
            <div
                className={`pointer-events-auto w-full max-w-md transform transition-all duration-500 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                    }`}
            >
                <div className="p-4 border rounded-md shadow-2xl border-surface-1-light bg-backgroundLight text-main-text-light backdrop-blur-xl dark:border-surface-3-dark dark:bg-backgroundDark dark:text-main-text-dark">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-md ">
                            {generalSetting?.app_main_logo_light && (
                                <img src={generalSetting?.app_main_logo_light} alt="Logo" className='block object-cover object-center dark:hidden' />
                            )}

                            {generalSetting?.app_main_logo_dark && (
                                <img src={generalSetting?.app_main_logo_dark} alt="Logo" className='hidden object-cover object-center dark:block' />
                            )}


                            {!generalSetting?.app_main_logo_dark && !generalSetting?.app_main_logo_light && (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="text-blue-500 w-7 h-7 dark:text-blue-400"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                                    />
                                </svg>
                            )}
                        </div>

                        <div className="flex-wrap flex-1 min-w-0">
                            <p className="text-sm font-medium leading-tight text-main-text-light dark:text-main-text-dark">
                                Install App
                            </p>
                            <p className="mt-0.5 text-xs text-sub-text-light line-clamp-1 dark:text-sub-text-dark">
                                For seamless experience
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={handleInstall}
                                className="rounded-lg  bg-main-text-light dark:bg-main-text-dark  dark:hover:bg-main-text-dark/80 px-4 py-1.5 text-sm font-semibold text-main-text-dark dark:text-main-text-light transition-colors duration-200 hover:bg-main-text-light/80"
                            >
                                Install
                            </button>
                            <button
                                onClick={handleClose}
                                className="flex items-center justify-center w-8 h-8 transition-colors duration-200 rounded-md"
                                aria-label="Close"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5 text-black dark:text-white"
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
