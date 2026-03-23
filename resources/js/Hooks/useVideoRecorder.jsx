import { useRef, useState, useCallback, useEffect } from 'react';

const MAX_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export function useVideoRecorder() {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const recorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);


    const startTimeRef = useRef(null);
    const totalPausedRef = useRef(0);
    const pausedAtRef = useRef(null);

    const [isReady, setIsReady] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordedFile, setRecordedFile] = useState(null);
    const [recordedUrl, setRecordedUrl] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [elapsed, setElapsed] = useState(0);

    const startCamera = useCallback(async () => {
        setCameraError(null);
        setRecordedFile(null);
        setRecordedUrl(null);
        setElapsed(0);
        setIsPaused(false);

        // Stop any existing stream first
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }

        const strategies = [
            { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true },
            { video: { facingMode: 'environment' }, audio: true },
            { video: { facingMode: 'environment' }, audio: false },
            { video: true, audio: true },
            { video: true, audio: false },
        ];

        let stream = null;
        let lastErr = null;

        for (const constraint of strategies) {
            try {
                stream = await navigator.mediaDevices.getUserMedia(constraint);
                break;
            } catch (err) {
                lastErr = err;
            }
        }

        if (!stream) {
            const map = {
                NotAllowedError: 'Camera permission denied. Please allow access in browser settings.',
                NotFoundError: 'No camera found on this device.',
                NotReadableError: 'Camera is in use by another app. Please close it and try again.',
                OverconstrainedError: 'Camera does not support required settings.',
            };
            setCameraError(map[lastErr?.name] || `Camera error: ${lastErr?.message}`);
            return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
                videoRef.current?.play().catch(() => { });
            };
        }

        setIsReady(true);
    }, []);

    const stopCamera = useCallback(() => {
        clearInterval(timerRef.current);
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        recorderRef.current = null;
        chunksRef.current = [];
        startTimeRef.current = null;
        totalPausedRef.current = 0;
        pausedAtRef.current = null;

        setIsReady(false);
        setIsRecording(false);
        setIsPaused(false);
        setElapsed(0);
    }, []);

    const startRecording = useCallback(() => {
        if (!streamRef.current) return;

        // Reset everything
        chunksRef.current = [];
        startTimeRef.current = Date.now();
        totalPausedRef.current = 0;
        pausedAtRef.current = null;

        setRecordedFile(null);
        setRecordedUrl(null);
        setElapsed(0);
        setIsPaused(false);

        const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4']
            .find(t => MediaRecorder.isTypeSupported(t)) || 'video/webm';

        const recorder = new MediaRecorder(streamRef.current, { mimeType });
        recorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
            clearInterval(timerRef.current);
            const blob = new Blob(chunksRef.current, { type: mimeType });
            const url = URL.createObjectURL(blob);
            const file = new File([blob], `recording-${Date.now()}.webm`, { type: mimeType });
            setRecordedFile(file);
            setIsRecording(false);
            setIsPaused(false);
            setTimeout(() => setRecordedUrl(url), 50);
        };

        recorder.start(500);
        setIsRecording(true);

        timerRef.current = setInterval(() => {
            const activeMs = Date.now() - startTimeRef.current - totalPausedRef.current;
            setElapsed(Math.floor(activeMs / 1000));

            // Auto-stop at 5 minutes of ACTIVE recording time
            if (activeMs >= MAX_DURATION_MS) {
                if (recorderRef.current?.state === 'recording' ||
                    recorderRef.current?.state === 'paused') {
                    recorderRef.current.stop();
                }
                clearInterval(timerRef.current);
            }
        }, 1000);

    }, []);


    const stopRecording = useCallback(() => {
        clearInterval(timerRef.current);

        const state = recorderRef.current?.state;
        if (state === 'paused') {
            recorderRef.current.resume();
            recorderRef.current.stop();
        } else if (state === 'recording') {
            recorderRef.current.stop();
        }
    }, []);

    const pauseRecording = useCallback(() => {
        if (recorderRef.current?.state !== 'recording') return;

        recorderRef.current.pause();
        pausedAtRef.current = Date.now();

        clearInterval(timerRef.current);
        setIsPaused(true);
    }, []);


    const resumeRecording = useCallback(() => {
        if (recorderRef.current?.state !== 'paused') return;

        // Accumulate the time we were paused
        if (pausedAtRef.current !== null) {
            totalPausedRef.current += Date.now() - pausedAtRef.current;
            pausedAtRef.current = null;
        }

        recorderRef.current.resume();
        setIsPaused(false);
        timerRef.current = setInterval(() => {
            const activeMs = Date.now() - startTimeRef.current - totalPausedRef.current;
            setElapsed(Math.floor(activeMs / 1000));

            if (activeMs >= MAX_DURATION_MS) {
                if (recorderRef.current?.state === 'recording' ||
                    recorderRef.current?.state === 'paused') {
                    recorderRef.current.stop();
                }
                clearInterval(timerRef.current);
            }
        }, 1000);
    }, []);

    const retake = useCallback(() => {
        clearInterval(timerRef.current);

        if (recordedUrl) URL.revokeObjectURL(recordedUrl);

        startTimeRef.current = null;
        totalPausedRef.current = 0;
        pausedAtRef.current = null;

        setRecordedFile(null);
        setRecordedUrl(null);
        setElapsed(0);
        setIsPaused(false);
    }, [recordedUrl]);
    useEffect(() => {
        if (!streamRef.current || !videoRef.current || recordedUrl) return;
        if (videoRef.current.srcObject !== streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(() => { });
        }
    }, [isReady, isRecording, recordedUrl]);
    useEffect(() => {
        return () => {
            clearInterval(timerRef.current);
            streamRef.current?.getTracks().forEach(t => t.stop());
            if (recordedUrl) URL.revokeObjectURL(recordedUrl);
        };
    }, []);

    return {
        recordingVideoRef: videoRef,
        isReady,
        isRecording,
        isPaused,
        recordedFile,
        recordedUrl,
        setRecordedUrl,
        cameraError,
        elapsed,
        startCamera,
        stopCamera,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        retake,
    };
}
