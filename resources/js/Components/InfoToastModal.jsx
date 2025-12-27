import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function InfoToastModal({ showInfo, setShowInfo, message }) {
    useEffect(() => {
        if (showInfo) {
            const timer = setTimeout(() => {
                setShowInfo(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showInfo, setShowInfo]);

    if (!showInfo) return null;

    return createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                onClick={() => setShowInfo(false)}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-sm px-8 py-4 border rounded-md bg-backgroundLight animate-scale-in dark:bg-surface-1-dark border-surface-3-light dark:border-surface-3-dark">
                <div className="flex flex-col items-center text-center">
                    {/* Info Icon */}
                    <div className="flex items-center justify-center mb-3 rounded-full">
                        <svg
                            className="w-8 h-8 text-main-text-light dark:text-main-text-dark"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>

                    {/* Message */}
                    <p className="text-sm break-words text-main-text-light dark:text-main-text-dark">{message}</p>
                </div>
            </div>
        </div>,
        document.getElementById('modal-root') || document.body,
    );
}
