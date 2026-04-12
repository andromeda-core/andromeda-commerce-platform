import React, { useEffect, useState } from 'react';
import SuccessToastModal from './SuccessToastModal';
import ErrorToastModal from './ErrorToastModal';
import InfoToastModal from './InfoToastModal';

const SHOWN_FLASH_KEY = 'shown_flash_ids';

function getShownIds() {
    try {
        return JSON.parse(sessionStorage.getItem(SHOWN_FLASH_KEY) || '[]');
    } catch {
        return [];
    }
}

function markIdAsShown(id) {
    const shown = getShownIds();
    const updated = [...shown, id].slice(-50);
    sessionStorage.setItem(SHOWN_FLASH_KEY, JSON.stringify(updated));
}

function generateFlashID() {
    return Math.random().toString(36).slice(2);
}

const Toast = ({ flash, onClosed }) => {
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [showInfo, setShowInfo] = useState(false);




    useEffect(() => {

        if (!flash?.flashId) flash.flashId = generateFlashID();

        if (!flash?.flashId) return;

        const shownIds = getShownIds();
        if (shownIds.includes(flash.flashId)) return;

        markIdAsShown(flash.flashId);

        if (flash.success) setShowSuccess(true);
        if (flash.error) setShowError(true);
        if (flash.info) setShowInfo(true);

    }, [flash?.flashId]);

    const handleSuccessClose = () => {
        setShowSuccess(false);
        if (onClosed) onClosed('success');
    };

    const handleErrorClose = () => {
        setShowError(false);
        if (onClosed) onClosed('error');
    };

    const handleInfoClose = () => {
        setShowInfo(false);
        if (onClosed) onClosed('info');
    };

    return (
        <div className="fixed z-[999999] space-y-3 transform -translate-x-1/2 bottom-6 left-1/2">
            {showSuccess && flash?.success && (
                <SuccessToastModal
                    showSuccess={showSuccess}
                    setShowSuccess={handleSuccessClose}
                    message={flash.success}
                />
            )}

            {showError && flash?.error && (
                <ErrorToastModal
                    showError={showError}
                    setShowError={handleErrorClose}
                    message={flash.error}
                />
            )}

            {showInfo && flash?.info && (
                <InfoToastModal
                    showInfo={showInfo}
                    setShowInfo={handleInfoClose}
                    message={flash.info}
                />
            )}
        </div>
    );
};

export default Toast;
