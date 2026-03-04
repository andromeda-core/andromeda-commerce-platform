import { useTranslation } from '@/Hooks/useTranslation';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

export default function EmailVerificationPopup({ user }) {
    const { __ } = useTranslation();
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState('');
    const [isMinimized, setIsMinimized] = useState(true);
    const [isClosing, setIsClosing] = useState(false);

    const handleResendVerification = () => {
        setIsResending(true);
        setResendMessage('');

        router.post(
            route('verification.send'),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setResendMessage(__('Sent! Check your inbox.'));
                    setIsResending(false);
                    router.reload({
                        only: ['user'],
                    })
                },
                onError: () => {
                    setResendMessage(__('Failed. Try again.'));
                    setIsResending(false);
                },
            }
        );
    };

    return createPortal(
        <>
            {/* Overlay wrapper */}
            <div
                className={`
                    fixed z-[50] animate-in fade-in duration-300
                    ${isMinimized
                        ? 'pointer-events-none'
                        : 'inset-0 flex items-center justify-center p-4'}
                    lg:inset-auto lg:top-4 lg:right-4 lg:flex
                    lg:items-start lg:justify-end lg:pointer-events-auto lg:p-0
                `}
                onClick={(e) => {
                    if (e.target !== e.currentTarget) {
                        return;
                    }

                    setIsMinimized(true);
                }}
            >
                {/* Popup box */}
                <div
                    className={`
        w-full bg-white border rounded-md lg:w-80
        dark:bg-surface-1-dark border-surface-2-light dark:border-surface-2-dark
        backdrop-blur-xl
        transition-all duration-300 ease-in-out
        ${(isClosing || isMinimized)
                            ? 'translate-x-[-120%] opacity-0'
                            : 'translate-x-0 opacity-100'}
        lg:translate-x-0 lg:opacity-100
    `}
                >
                    {/* Content */}
                    <div className="p-5">
                        {/* Header */}
                        <div className="flex items-start gap-3 mb-3">
                            <div className="flex-shrink-0 p-2 rounded-md bg-surface-1-light dark:bg-surface-2-dark">
                                <svg
                                    className="w-5 h-5 text-main-text-light dark:text-main-text-dark"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                                    />
                                </svg>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-main-text-light dark:text-main-text-dark">
                                    {__('Verify Your Email')}
                                </h3>
                                <p className="text-xs text-sub-text-light dark:text-sub-text-dark mt-0.5 line-clamp-2">
                                    {user?.email}
                                </p>
                            </div>

                            {/* Hide button (mobile only) */}
                            <button
                                onClick={() => {
                                    setIsClosing(true);

                                    setTimeout(() => {
                                        setIsMinimized(true);
                                        setIsClosing(false);
                                    }, 300); // same as transition duration
                                }}
                                className="px-2 py-1 text-xs rounded-md lg:hidden bg-surface-1-light text-main-text-light dark:text-main-text-dark dark:bg-surface-3-dark"
                            >
                                {__('Hide')}
                            </button>
                        </div>

                        {/* Resend Message */}
                        {resendMessage && (
                            <div
                                className={`px-3 py-2 mb-3 rounded-md text-xs font-medium ${resendMessage.includes('Failed')
                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                                    : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                    }`}
                            >
                                {resendMessage}
                            </div>
                        )}

                        {/* Action Button */}
                        <button
                            onClick={handleResendVerification}
                            disabled={isResending}
                            className="w-full px-4 py-2.5 text-sm font-semibold text-main-text-dark dark:text-main-text-light transition-all duration-200 bg-main-text-light dark:bg-main-text-dark lg:hover:bg-main-text-light/80 dark:lg:hover:bg-main-text-dark/80 disabled:opacity-50 rounded-md disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isResending ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    {__('Sending')}...
                                </>
                            ) : (
                                <>
                                    {user?.is_email_verification_sent ? (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                            </svg>
                                            {__('Resend Verification')}
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                            </svg>
                                            {__('Send Verification')}
                                        </>
                                    )}


                                </>
                            )}
                        </button>
                    </div>

                    {/* Bottom Badge */}
                    <div className="px-5 py-2 border-t bg-surface-1-light dark:bg-surface-2-dark border-surface-2-light dark:border-surface-3-dark rounded-b-md">
                        <p className="text-[10px] text-sub-text-light dark:text-sub-text-dark text-center">
                            {__('Check inbox or spam folder')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Floating restore tab (mobile only) */}
            {isMinimized && (
                <button
                    onClick={() => setIsMinimized(false)}
                    className="
                        fixed left-2 top-1/2 -translate-y-1/2
                        z-[9999] lg:hidden
                        px-3 py-2 rounded-r-md
                        bg-main-text-light dark:bg-main-text-dark
                        text-main-text-dark dark:text-main-text-light
                        text-xs shadow-lg
                    "
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>

                </button>
            )}
        </>,
        document.getElementById('modal-root') || document.body
    );
}
