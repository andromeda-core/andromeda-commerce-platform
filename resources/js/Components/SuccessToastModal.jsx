import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function SuccessToastModal({
    showSuccess,
    setShowSuccess,
    message,
    dismissable = true,
}) {
    useEffect(() => {
        if (showSuccess && dismissable) {
            const timer = setTimeout(() => {
                setShowSuccess(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess, setShowSuccess]);

    if (!showSuccess) return null;

    return createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                onClick={() => setShowSuccess(false)}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-sm animate-scale-in rounded-md border border-surface-3-light bg-backgroundLight px-8 py-4 dark:border-surface-3-dark dark:bg-surface-1-dark">
                <div className="flex flex-col items-center text-center">
                    {/* Success Icon */}
                    <div className="mb-3 flex items-center justify-center rounded-full">
                        <svg
                            className="h-8 w-8 text-main-text-light dark:text-main-text-dark"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                        </svg>
                    </div>
                    {/* Message */}
                    <p className="break-all text-sm text-main-text-light dark:text-main-text-dark">
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
