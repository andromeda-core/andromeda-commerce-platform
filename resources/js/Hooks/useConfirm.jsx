import ConfirmationModal from '@/Components/ConfirmationModal';
import { useState, useCallback, useRef } from 'react';

export function useConfirm() {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState({});
    const resolveRef = useRef(null);

    const confirm = useCallback((options = {}) => {
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setConfig(options);
            setIsOpen(true);
        });
    }, []);



    const ConfirmDialog = useCallback(() => {
        const handleConfirm = () => {
            if (resolveRef.current) {
                resolveRef.current({ isConfirmed: true });
                resolveRef.current = null;
            }
            setIsOpen(false);
        };

        const handleCancel = () => {
            if (resolveRef.current) {
                resolveRef.current({ isConfirmed: false });
                resolveRef.current = null;
            }
            setIsOpen(false);
        };

        return (
            <ConfirmationModal
                isOpen={isOpen}
                onClose={handleCancel}
                promiseResolve={(value) => {
                    if (value) {
                        handleConfirm();
                    } else {
                        handleCancel();
                    }
                }}
                title={config.title || "Are you sure?"}
                message={config.text || "This action cannot be undone."}
                confirmText={config.confirmButtonText || "Yes"}
                cancelText={config.cancelButtonText || "Cancel"}
                showCancel={config.showCancelButton !== false}
                variant={config.icon || "warning"}
            />
        );
    }, [isOpen, config]);

    return {
        confirm,
        ConfirmDialog,
    };
}
