import React, { useEffect, useState, useRef } from 'react';
import SuccessToastModal from './SuccessToastModal';
import ErrorToastModal from './ErrorToastModal';
import InfoToastModal from './InfoToastModal';

const Toast = ({ flash }) => {
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    const lastFlashRef = useRef(null);

    useEffect(() => {
        if (flash !== lastFlashRef.current) {
            lastFlashRef.current = flash;

            if (flash.success) {
                setShowSuccess(true);
            }
            if (flash.error) {
                setShowError(true);
            }
            if (flash.info) {
                setShowInfo(true);
            }
        }
    }, [flash]);

    const handleSuccessClose = () => {
        setShowSuccess(false);
    };

    const handleErrorClose = () => {
        setShowError(false);
    };

    const handleInfoClose = () => {
        setShowInfo(false);
    };

    return (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform space-y-3">
            {showSuccess && flash.success && (
                <SuccessToastModal
                    showSuccess={showSuccess}
                    setShowSuccess={handleSuccessClose}
                    message={flash.success}
                />
            )}

            {showError && flash.error && (
                <ErrorToastModal
                    showError={showError}
                    setShowError={handleErrorClose}
                    message={flash.error}
                />
            )}

            {showInfo && flash.info && (
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
