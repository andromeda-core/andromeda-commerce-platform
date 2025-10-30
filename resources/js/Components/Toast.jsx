import React, { useEffect, useState } from 'react';
import SuccessToastModal from './SuccessToastModal';
import ErrorToastModal from './ErrorToastModal';
import InfoToastModal from './InfoToastModal';

export default function Toast({ flash }) {
    const [showSuccess, setShowSuccess] = useState(!!flash.success);
    const [showError, setShowError] = useState(!!flash.error);
    const [showInfo, setShowInfo] = useState(!!flash.info);

    return (
        <>
            <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform space-y-3">
                <SuccessToastModal
                    showSuccess={showSuccess}
                    setShowSuccess={setShowSuccess}
                    message={flash.success}
                />

                {/* Error Toast Modal */}
                <ErrorToastModal
                    showError={showError}
                    setShowError={setShowError}
                    message={flash.error}
                />

                {/* Info Toast Modal */}
                <InfoToastModal
                    showInfo={showInfo}
                    setShowInfo={setShowInfo}
                    message={flash.info}
                />
            </div>
        </>
    );
}
