import { useEffect, useRef } from 'react';

export function useScanner({ active, onScan }) {
    const videoRef = useRef(null);
    const readerRef = useRef(null);
    const streamRef = useRef(null);
    const controlsRef = useRef(null);

    useEffect(() => {
        let cancelled = false;

        const stopCamera = () => {

            try { controlsRef.current?.stop(); } catch { }
            controlsRef.current = null;


            try { readerRef.current?.reset(); } catch { }
            readerRef.current = null;

            try {
                const video = videoRef.current;
                const stream = (video && video.srcObject) ? video.srcObject : streamRef.current;

                if (stream) stream.getTracks().forEach(t => t.stop());

                if (video) {
                    video.pause?.();
                    video.srcObject = null;
                    video.load?.();
                }
            } catch { }

            streamRef.current = null;
        };

        if (!active) {
            stopCamera();
            return () => stopCamera();
        }

        const start = async () => {
            stopCamera();

            const { BrowserMultiFormatReader } = await import('@zxing/browser');
            const { DecodeHintType } = await import('@zxing/library');

            if (cancelled) return;

            const hints = new Map();
            hints.set(DecodeHintType.TRY_HARDER, true);

            const reader = new BrowserMultiFormatReader(hints, {
                delayBetweenScanAttempts: 100,
                delayBetweenScanSuccess: 2000,
            });

            readerRef.current = reader;

            try {
                const devices = await BrowserMultiFormatReader.listVideoInputDevices();
                if (cancelled) return;

                const device =
                    devices.find(d =>
                        (d.label || '').toLowerCase().includes('back') ||
                        (d.label || '').toLowerCase().includes('rear') ||
                        (d.label || '').toLowerCase().includes('environment')
                    ) || devices[devices.length - 1] || devices[0];

                if (!device || cancelled) return;

                const constraints = {
                    audio: false,
                    video: {
                        deviceId: device.deviceId ? { exact: device.deviceId } : undefined,
                        facingMode: 'environment',
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                    }
                };

                const controls = await reader.decodeFromConstraints(
                    constraints,
                    videoRef.current,
                    (result, err) => {
                        if (result && !cancelled) onScan(result.getText());
                        if (err && err.name !== 'NotFoundException') console.log(err);
                    }
                );
                controlsRef.current = controls;

                const v = videoRef.current;
                if (v?.srcObject) streamRef.current = v.srcObject;

                if (cancelled) stopCamera();

            } catch (err) {
                if (!cancelled) console.error('Scanner error:', err);
                stopCamera();
            }
        };

        start();

        return () => {
            cancelled = true;
            stopCamera();
        };
    }, [active, onScan]);

    return { videoRef };
}
