import { useEffect, useState } from "react";
import AppStatusModal from "./AppStatusModal";
import { registerSW } from 'virtual:pwa-register';

export default function AppStatusManager() {
    const [status, setStatus] = useState({
        show: false,
        type: "",
        title: "",
        message: "",
        onConfirm: null,
    });

    const showModal = (config) => {
        setStatus({
            show: true,
            type: config.type,
            title: config.title,
            message: config.message,
            onConfirm: config.onConfirm || null,
        });
    };

    const hideModal = () => {
        setStatus((s) => ({ ...s, show: false }));
    };

    // Detect new PWA version
    useEffect(() => {
        registerSW({
            immediate: true,
            onNeedRefresh() {
                showModal({
                    type: "info",
                    title: "New version available",
                    message: "A newer version is available. Update now?",
                    onConfirm: () => window.location.reload(true),
                });
            },
            onOfflineReady() { },
        });
    }, []);

    // Offline detection
    useEffect(() => {
        const handleOffline = () => {
            showModal({
                type: "error",
                title: "You're Offline",
                message: "Internet connection lost. Please reconnect.",
                onConfirm: null,
            });
        };

        const handleOnline = () => {
            hideModal();

            showModal({
                type: "success",
                title: "Back Online",
                message: "Internet restored. You’re now browsing live content.",
                onConfirm: hideModal,
            });
        };

        window.addEventListener("offline", handleOffline);
        window.addEventListener("online", handleOnline);

        if (!navigator.onLine) handleOffline();

        return () => {
            window.removeEventListener("offline", handleOffline);
            window.removeEventListener("online", handleOnline);
        };
    }, []);

    return (
        <AppStatusModal
            show={status.show}
            type={status.type}
            title={status.title}
            message={status.message}
            onConfirm={() => {
                status.onConfirm?.();
                hideModal();
            }}

        />
    );
}
