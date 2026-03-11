import { useEffect, useRef } from 'react';
import beepSound from "../../assets/sounds/Beep.mp3";

export function useScanner({ active, onScan, sourceVideoRef = null }) {

    const videoRef = useRef(null);
    const readerRef = useRef(null);
    const streamRef = useRef(null);
    const intervalRef = useRef(null);
    const onScanRef = useRef(onScan);


    const audioRef = useRef(null);


    useEffect(() => {
        onScanRef.current = onScan;
    }, [onScan]);

    useEffect(() => {
        audioRef.current = new Audio(beepSound);
        audioRef.current.preload = 'auto';
    }, []);

    const playBeep = async () => {
        try {
            if (!audioRef.current) return;
            audioRef.current.currentTime = 0;
            await audioRef.current.play();
        } catch (err) {
            console.warn('[Scanner] Beep play blocked:', err);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const stopAll = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            try { readerRef.current?.reset(); } catch { }
            readerRef.current = null;

            if (!sourceVideoRef) {
                try {
                    const stream = streamRef.current;
                    if (stream) stream.getTracks().forEach(t => t.stop());
                    const v = videoRef.current;
                    if (v) { v.pause?.(); v.srcObject = null; v.load?.(); }
                } catch { }
                streamRef.current = null;
            }
        };

        if (!active) {
            stopAll();
            return () => stopAll();
        }



        const start = async () => {
            stopAll();
            if (cancelled) return;

            const { BrowserMultiFormatReader } = await import('@zxing/browser');
            // const { DecodeHintType, BarcodeFormat } = await import('@zxing/library');
            if (cancelled) return;

            // const hints = new Map();
            // hints.set(DecodeHintType.POSSIBLE_FORMATS, [
            //     BarcodeFormat.CODE_128,
            //     BarcodeFormat.CODE_39,
            //     BarcodeFormat.EAN_13,
            //     BarcodeFormat.ITF,
            // ]);

            const hints = new Map();
            const reader = new BrowserMultiFormatReader(hints);
            readerRef.current = reader;


            if (sourceVideoRef) {
                const canvas = document.createElement('canvas');
                canvas.width = 640;
                canvas.height = 360;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });

                intervalRef.current = setInterval(async () => {
                    if (cancelled) return;
                    const videoEl = sourceVideoRef.current;
                    if (!videoEl?.videoWidth) return;
                    try {
                        ctx.drawImage(videoEl, 0, 0, 640, 360);
                        const result = reader.decodeFromCanvas(canvas);
                        if (result && !cancelled) {
                            await playBeep();
                            onScanRef.current(result.getText());
                        };
                    } catch (err) {

                        if (err?.name !== 'NotFoundException') {
                            console.log('');
                        }
                    }
                }, 600);

                if (cancelled) stopAll();
                return;
            }


            try {
                const devices = await BrowserMultiFormatReader.listVideoInputDevices();
                if (cancelled) return;

                const device =
                    devices.find(d => /(back|rear|environment)/i.test(d.label || '')) ||
                    devices[devices.length - 1] ||
                    devices[0];

                if (!device || cancelled) return;

                const controls = await reader.decodeFromConstraints(
                    {
                        audio: false,
                        video: {
                            deviceId: device.deviceId ? { exact: device.deviceId } : undefined,
                            facingMode: 'environment',
                            width: { ideal: 1280 },
                            height: { ideal: 720 },
                        },
                    },
                    videoRef.current,
                    async (result, err) => {
                        if (result && !cancelled) {
                            await playBeep();
                            onScanRef.current(result.getText());
                        };
                    }
                );

                if (videoRef.current?.srcObject) streamRef.current = videoRef.current.srcObject;
                if (cancelled) { try { controls.stop(); } catch { } stopAll(); }
            } catch (err) {
                if (!cancelled) console.error('[Scanner] Error:', err);
                stopAll();
            }
        };

        start();
        return () => { cancelled = true; stopAll(); };

    }, [active]);

    return { videoRef };
}
