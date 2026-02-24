import React, { useEffect, useState } from "react";
import { router } from "@inertiajs/react";

const DesktopPwaBackButton = ({ __ }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const isStandalone =
            window.matchMedia?.("(display-mode: standalone)")?.matches ||
            window.navigator.standalone === true;

        const isDesktop = window.matchMedia?.("(min-width: 1024px)")?.matches;

        setShow(Boolean(isStandalone && isDesktop));
    }, []);

    if (!show) return null;

    const goBack = () => {
        if (window.history.length > 1) {
            window.history.back();
            return;
        }

        // fallback
        router.visit(route("home"), { replace: true });
    };

    return (
        <button
            type="button"
            onClick={goBack}
            className="flex w-full items-center gap-2 px-2 rounded-md py-2.5 text-md transition-colors menu-item-inactive"
            title={__("Back")}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
            </svg>
            <span>{__("Back")}</span>
        </button>
    );
};

export default DesktopPwaBackButton;
