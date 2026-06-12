import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function ErrorToastModal({ showError, setShowError, message }) {
    useEffect(() => {
        if (showError) {
            const timer = setTimeout(() => {
                setShowError(false);
            }, 20000);
            return () => clearTimeout(timer);
        }
    }, [showError, setShowError]);

    if (!showError) return null;

    return createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                onClick={() => setShowError(false)}
            />

            {/* Modal */}

            <div className="relative z-10 w-full max-w-md px-8 py-4 border rounded-md animate-scale-in border-surface-3-light bg-backgroundLight dark:border-surface-3-dark dark:bg-surface-1-dark">
                <div className="flex flex-col items-center text-center">
                    {/* Error Icon */}
                    <div className="flex items-center justify-center mb-3 rounded-full">
                        <svg
                            className="w-8 h-8 text-main-text-light dark:text-main-text-dark"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" />
                        </svg>
                    </div>

                    {/* Message */}
                    <p className="text-sm break-all text-main-text-light dark:text-main-text-dark">
                        {typeof message === 'string' && message.includes('<a') ? (
                            <span dangerouslySetInnerHTML={{ __html: message }} />
                        ) : (
                            message
                        )}
                    </p>
                </div>
            </div>
        </div>,
        document.getElementById('modal-root') || document.body,
    );
}
