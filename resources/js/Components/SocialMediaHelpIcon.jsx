import { router } from "@inertiajs/react";
import { ChevronLeft, CircleQuestionMark, Facebook, Instagram } from "lucide-react";
import { useState, useEffect } from "react";

export default function SocialMediaHelpIcon({
    socialLinks = {},
    width,
    __
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check if mobile or desktop
    useEffect(() => {
        setIsMobile(width <= 1024);
    }, [width, isOpen]);


    useEffect(() => {
        if (isOpen) {
            const url = new URL(window.location.href);
            url.searchParams.set('social-media-help', 'true');
            window.history.pushState({}, '', url.toString());
        } else {
            const url = new URL(window.location.href);
            url.searchParams.delete('social-media-help');
            window.history.replaceState({}, '', url.toString());
        }
    }, [isOpen]);


    useEffect(() => {
        const handlePopState = (e) => {

            // SpatiotemporalInfo Modal Open
            if (isOpen) {
                setIsOpen(false);
                return;
            }
        };

        const preventInertiaNavigation = (event) => {
            if (isOpen) {
                event.preventDefault();
                setIsMobile(false);
                return;
            }
        };

        window.addEventListener('popstate', handlePopState);
        const removeRouterEvent = router.on('before', preventInertiaNavigation);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            if (removeRouterEvent) removeRouterEvent();
        };
    }, [isOpen]);
    return (
        <>
            {/* Question Mark Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed z-40 flex items-center justify-center transition-all bg-white border border-surface-3-light rounded-full shadow-lg  right-6 w-14 h-14  hover:scale-105 text-main-text-light dark:text-main-text-dark dark:bg-surface-1-dark dark:border-surface-3-dark ${isMobile ? 'bottom-20' : 'bottom-6'}`}
                aria-label="Help"
            >
                <CircleQuestionMark className="w-7 h-7" />
            </button>

            {/* Modal */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 z-50"
                    />

                    {/* Modal Content */}
                    {isMobile ? (
                        // Mobile: Full Screen
                        <div className="fixed inset-0 z-50 flex items-center justify-center">
                            <div className="relative w-full h-full mb-10 bg-white dark:bg-surface-1-dark animate-fade-in-up">
                                {/* Close Button */}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="absolute p-1 transition-colors cursor-pointer text-main-text-light top-4 left-4 dark:text-main-text-dark "
                                >
                                    <ChevronLeft />
                                </button>
                                {/* Content */}
                                <div className="flex flex-col h-full p-6 pt-16">
                                    <h3 className="text-[24px] font-semibold text-main-text-light dark:text-main-text-dark">
                                        {__('Message us on Social.')}
                                    </h3>
                                    <p className="mt-2 text-sm text-sub-text-light dark:text-sub-text-dark">
                                        {__('Choose your preferred platform and start a conversation.')}
                                    </p>

                                    <div className="mt-6 space-y-3">
                                        {/* Instagram */}
                                        {socialLinks?.instagram && (
                                            <a
                                                href={socialLinks.instagram}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-4 transition-colors bg-white border rounded-md text-main-text-light dark:text-main-text-dark border-surface-3-light dark:bg-surface-2-dark dark:border-surface-3-dark"
                                            >
                                                <Instagram />
                                                <span className="text-sm font-medium text-gray-900 dark:text-main-text-dark">
                                                    {__('Send Instagram')}
                                                </span>
                                            </a>
                                        )}

                                        {/* Facebook */}
                                        {socialLinks?.facebook && (
                                            <a
                                                href={socialLinks.facebook}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-4 transition-colors bg-white border rounded-md text-main-text-ligh t dark:text-main-text-dark border-surface-3-light dark:bg-surface-2-dark dark:border-surface-3-dark "
                                            >
                                                <Facebook />
                                                <span className="text-sm font-medium text-gray-900 dark:text-main-text-dark">
                                                    {__('Send Facebook')}
                                                </span>
                                            </a>
                                        )}


                                    </div>
                                </div>
                            </div >
                        </div >
                    ) : (
                        <div className="fixed inset-y-0 right-0 z-50 flex items-end sm:items-center">
                            <div className="relative w-[320px] h-[calc(80vh-50px)] mr-4 mb-6 bg-white rounded-lg shadow-2xl
                dark:bg-surface-1-dark
                animate-fade-in-up">
                                {/* Close Button */}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="absolute p-1 transition-colors cursor-pointer text-main-text-light top-5 right-4 hover:text-main-text-light/80 dark:text-main-text-dark dark:hover:text-main-text-dark/80"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-5 h-5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>

                                {/* Modal Header */}
                                <div className="p-6 pb-4">
                                    <h3 className="text-[20px] font-semibold text-main-text-light dark:text-main-text-dark">
                                        {__('Message us on Social.')}
                                    </h3>
                                    <p className="mt-1 text-sm text-sub-text-light dark:text-main-text-dark">
                                        {__('Choose your preferred platform and start a conversation.')}
                                    </p>
                                </div>

                                {/* Social Links */}
                                <div className="px-6 pb-6 space-y-3">
                                    {/* Instagram */}
                                    {socialLinks?.instagram && (
                                        <a
                                            href={socialLinks.instagram}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-4 transition-colors bg-white border rounded-md border-surface-3-light text-main-text-light dark:text-main-text-dark hover:bg-surface-1-light dark:hover:bg-surface-1-dark dark:bg-surface-2-dark dark:border-surface-3-dark"
                                        >
                                            <Instagram />
                                            <span className="text-sm font-medium text-gray-900 dark:text-main-text-dark">
                                                {__('Send Instagram')}
                                            </span>
                                        </a>
                                    )}

                                    {/* Facebook */}
                                    {socialLinks?.facebook && (
                                        <a
                                            href={socialLinks.facebook}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-4 transition-colors bg-white border rounded-md border-surface-3-light text-main-text-light dark:text-main-text-dark hover:bg-surface-1-light dark:hover:bg-surface-1-dark dark:bg-surface-2-dark dark:border-surface-3-dark "
                                        >
                                            <Facebook />
                                            <span className="text-sm font-medium text-gray-900 dark:text-main-text-dark">
                                                {__('Send Facebook')}
                                            </span>
                                        </a>
                                    )}


                                </div>
                            </div >
                        </div>
                    )}
                </>
            )}

        </>
    );
}
